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

// import * as s3 from '@aws-cdk/aws-s3';
// import * as lambda from '@aws-cdk/aws-lambda';
import * as s3a from '@aws-cdk/aws-s3-assets';
import { Stack, CfnMapping } from '@aws-cdk/core';
// import { CreateScrapBucket } from '@aws-solutions-constructs/core';

// linear learner ECR images can be found here:
// https://github.com/awsdocs/amazon-sagemaker-developer-guide/blob/master/doc_source/sagemaker-algo-docker-registry-paths.md
export function getSagemakerModel(stack: Stack): [CfnMapping, s3a.Asset ] {

  const containerMap = new CfnMapping(stack, 'mappings', {
    mapping: {
      "us-east-1": {
        containerArn: "382416733822.dkr.ecr.us-east-1.amazonaws.com/linear-learner:latest",
      },
      "us-east-2": {
        containerArn: "404615174143.dkr.ecr.us-east-2.amazonaws.com/linear-learner:latest",
      },
      "us-west-1": {
        containerArn: "632365934929.dkr.ecr.us-west-1.amazonaws.com/linear-learner:latest",
      },
      "us-west-2": {
        containerArn: "174872318107.dkr.ecr.us-west-2.amazonaws.com/linear-learner:latest",
      },
      "af-south-1": {
        containerArn: "455444449433.dkr.ecr.af-south-1.amazonaws.com/linear-learner:latest",
      },
      "ap-east-1": {
        containerArn: "286214385809.dkr.ecr.ap-east-1.amazonaws.com/linear-learner:latest",
      },
      "ap-south-1": {
        containerArn: "991648021394.dkr.ecr.ap-south-1.amazonaws.com/linear-learner:latest",
      },
      "ap-northeast-2": {
        containerArn: "835164637446.dkr.ecr.ap-northeast-2.amazonaws.com/linear-learner:latest",
      },
      "ap-southeast-1": {
        containerArn: "475088953585.dkr.ecr.ap-southeast-1.amazonaws.com/linear-learner:latest",
      },
      "ap-southeast-2": {
        containerArn: "712309505854.dkr.ecr.ap-southeast-2.amazonaws.com/linear-learner:latest",
      },
      "ap-northeast-1": {
        containerArn: "351501993468.dkr.ecr.ap-northeast-1.amazonaws.com/linear-learner:latest",
      },
      "ca-central-1": {
        containerArn: "469771592824.dkr.ecr.ca-central-1.amazonaws.com/linear-learner:latest",
      },
      "eu-central-1": {
        containerArn: "664544806723.dkr.ecr.eu-central-1.amazonaws.com/linear-learner:latest",
      },
      "eu-west-1": {
        containerArn: "438346466558.dkr.ecr.eu-west-1.amazonaws.com/linear-learner:latest",
      },
      "eu-west-2": {
        containerArn: "644912444149.dkr.ecr.eu-west-2.amazonaws.com/linear-learner:latest",
      },
      "eu-west-3": {
        containerArn: "749696950732.dkr.ecr.eu-west-3.amazonaws.com/linear-learner:latest",
      },
      "eu-north-1": {
        containerArn: "669576153137.dkr.ecr.eu-north-1.amazonaws.com/linear-learner:latest",
      },
      "eu-south-1": {
        containerArn: "257386234256.dkr.ecr.eu-south-1.amazonaws.com/linear-learner:latest",
      },
      "me-south-1": {
        containerArn: "249704162688.dkr.ecr.me-south-1.amazonaws.com/linear-learner:latest",
      },
      "sa-east-1": {
        containerArn: "855470959533.dkr.ecr.sa-east-1.amazonaws.com/linear-learner:latest",
      },
      "us-gov-west-1": {
        containerArn: "226302683700.dkr.ecr.us-gov-west-1.amazonaws.com/linear-learner:latest",
      },
    }
  });

  // const sourceBucket = new s3.Bucket(stack, 'source-bucket', {
  //   removalPolicy: RemovalPolicy.DESTROY,
  //   autoDeleteObjects: true
  // });

  // const sourceBucket = CreateScrapBucket(stack, { autoDeleteObjects: true });

  // const customResourceLambda = stack.node.findChild('Custom::S3AutoDeleteObjectsCustomResourceProvider').node.findChild('Handler') as lambda.CfnFunction;

  // customResourceLambda.cfnOptions.metadata = {
  //   cfn_nag: {
  //     rules_to_suppress: [{
  //       id: 'W58',
  //       reason: `Lambda functions has the required permission to write CloudWatch Logs. It uses custom policy instead of arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole with tighter permissions.`
  //     },
  //     {
  //       id: 'W89',
  //       reason: `This is not a rule for the general case, just for specific use cases/industries`
  //     },
  //     {
  //       id: 'W92',
  //       reason: `Impossible for us to define the correct concurrency for clients`
  //     }]
  //   }
  // };

  // const modelDeployment = new s3d.BucketDeployment(stack, 'bucket-deployment', {
  //   destinationBucket: sourceBucket,
  //   sources: [
  //     s3d.Source.asset(`${__dirname}/model`)
  //   ]
  // });

//   return [containerMap, sourceBucket, modelDeployment];

  const modelAsset = new s3a.Asset(stack, 'SampleAsset', {
    path: 'model/model.tar.gz',
  });


  return [containerMap, modelAsset]

}