/**
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

// Imports
import * as api from '@aws-cdk/aws-apigateway';
import * as kinesis from '@aws-cdk/aws-kinesis';
import * as iam from '@aws-cdk/aws-iam';
import * as defaults from '@aws-solutions-constructs/core';
import { Construct } from '@aws-cdk/core';
import { LogGroup } from '@aws-cdk/aws-logs';

/**
 * @summary The properties for the ApiGatewayToKinesisStreamsProps class.
 */
export interface ApiGatewayToKinesisStreamsProps {
    /**
     * Optional user-provided props to override the default props for the API Gateway.
     *
     * @default - Default properties are used.
     */
    readonly apiGatewayProps?: api.RestApiProps,

    /**
     * Whether to create a data model for the request payload.
     * If this is set to true, a request validator will also be created.
     *
     * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/rest-api-data-transformations.html#models-mappings-models
     * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-method-request-validation.html
     * @default - true
     */
    readonly createRequestModels?: boolean;

    /**
     * Existing instance of Kinesis Stream, if this is set then kinesisStreamProps is ignored.
     *
     * @default - None
     */
    readonly existingStreamObj?: kinesis.Stream;

    /**
     * Optional user-provided props to override the default props for the Kinesis Data Stream.
     *
     * @default - Default properties are used.
     */
    readonly kinesisStreamProps?: kinesis.StreamProps,
}

/**
 * @summary The ApiGatewayToKinesisStreams class.
 */
export class ApiGatewayToKinesisStreams extends Construct {
    public readonly apiGateway: api.RestApi;
    public readonly apiGatewayRole: iam.Role;
    public readonly apiGatewayCloudWatchRole: iam.Role;
    public readonly apiGatewayLogGroup: LogGroup;
    public readonly kinesisStream: kinesis.Stream;

    /**
     * @summary Constructs a new instance of the ApiGatewayToKinesisStreams class.
     * @param {cdk.App} scope - represents the scope for all the resources.
     * @param {string} id - this is a a scope-unique id.
     * @param {ApiGatewayToKinesisStreamsProps} props - user provided props for the construct.
     * @since 1.61.1
     * @access public
     */
    constructor(scope: Construct, id: string, props: ApiGatewayToKinesisStreamsProps) {
        super(scope, id);

        // Setup the Kinesis stream
        this.kinesisStream = defaults.buildKinesisStream(scope, {
            existingStreamObj: props.existingStreamObj,
            kinesisStreamProps: props.kinesisStreamProps
        });

        // Setup the API Gateway
        [this.apiGateway, this.apiGatewayCloudWatchRole, this.apiGatewayLogGroup] = defaults.GlobalRestApi(this, props.apiGatewayProps);

        // Setup the API Gateway role
        this.apiGatewayRole = new iam.Role(this, 'api-gateway-role', {
            assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
        });
        this.kinesisStream.grantWrite(this.apiGatewayRole);

        // Setup API Gateway methods
        const shouldCreateModels = props.createRequestModels === undefined || props.createRequestModels === true;

        let requestValidator: api.RequestValidator | undefined;
        if (shouldCreateModels) {
            requestValidator = this.apiGateway.addRequestValidator('request-validator', {
                requestValidatorName: 'request-body-validator',
                validateRequestBody: true
            });
        }

        // PutRecord
        const putRecordResource = this.apiGateway.root.addResource('record');
        const putRecordTemplate = `{ "StreamName": "${this.kinesisStream.streamName}", "Data": "$util.base64Encode($input.json('$.data'))", "PartitionKey": "$input.path('$.partitionKey')" }`;
        const putRecordModel = shouldCreateModels ? this.getPutRecordModel() : api.Model.EMPTY_MODEL;

        defaults.addProxyMethodToApiResource({
            service: 'kinesis',
            action: 'PutRecord',
            apiGatewayRole: this.apiGatewayRole,
            apiMethod: 'POST',
            apiResource: putRecordResource,
            requestTemplate: putRecordTemplate,
            contentType: "'x-amz-json-1.1'",
            requestValidator,
            requestModel: { 'application/json': putRecordModel }
        });

        // PutRecords
        const putRecordsResource = this.apiGateway.root.addResource('records');
        const putRecordsTemplate = `{ "StreamName": "${this.kinesisStream.streamName}", "Records": [ #foreach($elem in $input.path('$.records')) { "Data": "$util.base64Encode($elem.data)", "PartitionKey": "$elem.partitionKey"}#if($foreach.hasNext),#end #end ] }`;
        const putRecordsModel = shouldCreateModels ? this.getPutRecordsModel() : api.Model.EMPTY_MODEL;

        defaults.addProxyMethodToApiResource({
            service: 'kinesis',
            action: 'PutRecords',
            apiGatewayRole: this.apiGatewayRole,
            apiMethod: 'POST',
            apiResource: putRecordsResource,
            requestTemplate: putRecordsTemplate,
            contentType: "'x-amz-json-1.1'",
            requestValidator,
            requestModel: { 'application/json': putRecordsModel }
        });
    }

    private getPutRecordModel(): api.Model {
        return this.apiGateway.addModel('PutRecordModel', {
            contentType: 'application/json',
            modelName: 'PutRecordModel',
            description: 'PutRecord proxy single-record payload',
            schema: {
                schema: api.JsonSchemaVersion.DRAFT4,
                title: 'PutRecord proxy single-record payload',
                type: api.JsonSchemaType.OBJECT,
                required: ['data', 'partitionKey'],
                properties: {
                    data: { type: api.JsonSchemaType.STRING },
                    partitionKey: { type: api.JsonSchemaType.STRING }
                }
            }
        });
    }

    private getPutRecordsModel(): api.Model {
        return this.apiGateway.addModel('PutRecordsModel', {
            contentType: 'application/json',
            modelName: 'PutRecordsModel',
            description: 'PutRecords proxy payload data',
            schema: {
                schema: api.JsonSchemaVersion.DRAFT4,
                title: 'PutRecords proxy payload data',
                type: api.JsonSchemaType.OBJECT,
                required: ['records'],
                properties: {
                    records: {
                        type: api.JsonSchemaType.ARRAY,
                        items: {
                            type: api.JsonSchemaType.OBJECT,
                            required: ['data', 'partitionKey'],
                            properties: {
                                data: { type: api.JsonSchemaType.STRING },
                                partitionKey: { type: api.JsonSchemaType.STRING }
                            }
                        }
                    }
                }
            }
        });
    }
}
