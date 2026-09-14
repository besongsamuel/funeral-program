import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { memorialAssistant } from './functions/memorial-assistant/resource';
import { tributeGuard } from './functions/tribute-guard/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  memorialAssistant,
  tributeGuard,
});

backend.memorialAssistant.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
    resources: ['*'],
  }),
);

backend.memorialAssistant.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:GetItem',
      'dynamodb:Query',
      'dynamodb:Scan',
      'dynamodb:PutItem',
      'dynamodb:UpdateItem',
    ],
    resources: ['*'],
  }),
);
