import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
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

const assistantFn = backend.memorialAssistant.resources.lambda;

backend.memorialAssistant.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
    resources: ['*'],
  }),
);

const assistantTables = [
  'Memorial',
  'BiographySection',
  'TimelineEvent',
  'FamilyMember',
  'FuneralEvent',
  'ProgramItem',
  'Tribute',
  'Story',
  'MediaItem',
  'DonationCause',
  'FamilyContact',
  'AiSettings',
  'AiKnowledgeEntry',
] as const;

for (const model of assistantTables) {
  const table = backend.data.resources.tables[model];
  assistantFn.addEnvironment(`TABLE_${model}`, table.tableName);
  assistantFn.addToRolePolicy(
    new PolicyStatement({
      actions: ['dynamodb:GetItem', 'dynamodb:Query'],
      resources: [table.tableArn, `${table.tableArn}/index/*`],
    }),
  );
}

const assistantUrl = assistantFn.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.POST],
    allowedHeaders: ['content-type'],
  },
});

backend.addOutput({
  custom: {
    assistant_url: assistantUrl.url,
  },
});
