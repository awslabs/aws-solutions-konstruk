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

import { Secret, SecretProps } from '@aws-cdk/aws-secretsmanager';
import { Construct } from '@aws-cdk/core';
import { DefaultSecretProps } from './secretsmanager-defaults';
import { overrideProps } from './utils';

/**
 * Method to build the default AWS Secrets Manager Secret
 *
 * @param scope
 * @param secretProps
 */
export function buildSecretsManagerSecret(scope: Construct, secretProps: SecretProps): Secret {
  if (secretProps) {
    return new Secret(scope, 'Secret', overrideProps(DefaultSecretProps, secretProps));
  } else {
    return new Secret(scope, 'Secret', DefaultSecretProps);
  }
}
