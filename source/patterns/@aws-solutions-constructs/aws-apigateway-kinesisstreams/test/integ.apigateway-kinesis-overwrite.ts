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
import { App, Stack } from '@aws-cdk/core';
import { ApiGatewayToKinesisStreams, ApiGatewayToKinesisStreamsProps } from '../lib';

// Setup
const app = new App();
const stack = new Stack(app, 'test-apigateway-kinesis-overwrite');
stack.templateOptions.description = 'Integration Test for aws-apigateway-kinesis';

// Definitions
const props: ApiGatewayToKinesisStreamsProps = {
    apiGatewayProps: {
        restApiName: 'my-api',
        deployOptions: {
            methodOptions: {
                '/*/*': {
                    throttlingRateLimit: 100,
                    throttlingBurstLimit: 25
                }
            }
        }
    },
    kinesisStreamProps: {
        shardCount: 1,
        streamName: 'my-stream'
    },
    createRequestModels: false
};

new ApiGatewayToKinesisStreams(stack, 'test-apigateway-kinesis-overwrite', props);

// Synth
app.synth();
