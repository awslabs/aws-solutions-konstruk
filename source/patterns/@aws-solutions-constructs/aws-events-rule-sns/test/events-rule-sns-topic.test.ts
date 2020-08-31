/**
 *  Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { SynthUtils } from '@aws-cdk/assert';
import * as cdk from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import '@aws-cdk/assert/jest';
import { EventsRuleToSNSTopic, EventsRuleToSNSTopicProps } from "../lib"


function deployNewFunc(stack: cdk.Stack) {
    const props: EventsRuleToSNSTopicProps = {
        eventRuleProps: {
            schedule: events.Schedule.rate(cdk.Duration.minutes(5))
        }
    }
    return new EventsRuleToSNSTopic(stack, 'test-events-rule-lambda', props);
}

function getStack() {
    const app = new cdk.App()
    const envEU = { account: '111111111111', region: 'eu-west-1'}
    return new cdk.Stack(app, 'stack', { env: envEU })
}

test('snapshot test EventsRuleToLambda default params', () => {
    const stack = getStack()
    deployNewFunc(stack)
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('check the sns topic properties', () => {
    const stack = getStack()
    deployNewFunc(stack)
    expect(stack).toHaveResource('AWS::SNS::Topic', {})
})

test('check if the event rule has permission/policy in place in sns for it to be able to publish to the topic', () => {
    const stack = getStack()
    deployNewFunc(stack)
    expect(stack).toHaveResource('AWS::SNS::TopicPolicy', {
        PolicyDocument:  {
            Statement:  [
               {
                Action:  [
                  "SNS:Publish",
                  "SNS:RemovePermission",
                  "SNS:SetTopicAttributes",
                  "SNS:DeleteTopic",
                  "SNS:ListSubscriptionsByTopic",
                  "SNS:GetTopicAttributes",
                  "SNS:Receive",
                  "SNS:AddPermission",
                  "SNS:Subscribe",
                ],
                Condition:  {
                  "StringEquals":  {
                    "AWS:SourceOwner":
                        "111111111111"
                  }
                },
                Effect: "Allow",
                Principal:  {
                  "AWS":  {
                    "Fn::Join":  [
                      "",
                       [
                        "arn:",
                         {
                          "Ref": "AWS::Partition",
                        },
                        ":iam::111111111111:root"
                      ],
                    ],
                  },
                },
                Resource:  {
                  "Ref": "testeventsrulelambdaSnsTopicE6187642",
                },
                Sid: "TopicOwnerOnlyAccess",
              },
               {
                Action:  [
                  "SNS:Publish",
                  "SNS:RemovePermission",
                  "SNS:SetTopicAttributes",
                  "SNS:DeleteTopic",
                  "SNS:ListSubscriptionsByTopic",
                  "SNS:GetTopicAttributes",
                  "SNS:Receive",
                  "SNS:AddPermission",
                  "SNS:Subscribe",
                ],
                Condition:  {
                  "Bool":  {
                    "aws:SecureTransport": "false",
                  },
                },
                Effect: "Deny",
                Principal: "*",
                Resource:  {
                  "Ref": "testeventsrulelambdaSnsTopicE6187642",
                },
                Sid: "HttpsOnly",
              },
               {
                Action: "sns:Publish",
                Effect: "Allow",
                Principal:  {
                  "Service": "events.amazonaws.com",
                },
                Resource:  {
                  "Ref": "testeventsrulelambdaSnsTopicE6187642",
                },
                Sid: "2",
              },
            ],
            Version: "2012-10-17",
          },
          Topics:  [
             {
              "Ref": "testeventsrulelambdaSnsTopicE6187642",
            },
          ],
        },
    )
})