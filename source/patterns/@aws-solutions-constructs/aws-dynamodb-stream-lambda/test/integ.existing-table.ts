/**
 *  Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

/// !cdk-integ *
import { App, Stack } from "@aws-cdk/core";
import { DynamoDBStreamToLambdaProps, DynamoDBStreamToLambda } from "../lib";
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { generateIntegStackName } from '@aws-solutions-constructs/core';

const app = new App();

const stack = new Stack(app, generateIntegStackName(__filename));

const table = new dynamodb.Table(stack, 'mytable', {
  partitionKey: {
    name: 'id',
    type: dynamodb.AttributeType.STRING
  },
  stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES
});

const props: DynamoDBStreamToLambdaProps = {
  lambdaFunctionProps: {
    code: lambda.Code.fromAsset(`${__dirname}/lambda`),
    runtime: lambda.Runtime.NODEJS_12_X,
    handler: 'index.handler'
  },
  existingTableInterface: table
};

new DynamoDBStreamToLambda(stack, 'test-dynamodb-stream-lambda', props);

app.synth();