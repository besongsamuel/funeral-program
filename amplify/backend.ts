import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { CfnBucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { memorialAssistant } from './functions/memorial-assistant/resource';
import { tributeGuard } from './functions/tribute-guard/resource';
import { moderationGate } from './functions/moderation-gate/resource';

const backend = defineBackend({
  auth,
  data,
  storage,
  memorialAssistant,
  tributeGuard,
  moderationGate,
});

// Allow anonymous HTTP reads of gallery/media objects so <img src> works without Cognito.
const mediaBucket = backend.storage.resources.bucket;
const cfnMediaBucket = mediaBucket.node.defaultChild as CfnBucket;
cfnMediaBucket.publicAccessBlockConfiguration = {
  blockPublicAcls: false,
  blockPublicPolicy: false,
  ignorePublicAcls: false,
  restrictPublicBuckets: false,
};
mediaBucket.addToResourcePolicy(
  new PolicyStatement({
    sid: 'PublicReadMemorialMedia',
    effect: Effect.ALLOW,
    principals: [new AnyPrincipal()],
    actions: ['s3:GetObject'],
    resources: [
      `${mediaBucket.bucketArn}/memorial-media/*`,
      `${mediaBucket.bucketArn}/gallery-uploads/*`,
    ],
  }),
);
mediaBucket.addCorsRule({
  allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.PUT, HttpMethods.POST],
  allowedOrigins: ['*'],
  allowedHeaders: ['*'],
  exposedHeaders: ['ETag', 'x-amz-request-id'],
  maxAge: 3000,
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

const moderationFn = backend.moderationGate.resources.lambda;
const moderationTables = ['Tribute', 'Story', 'GalleryPhoto', 'GalleryAlbum'] as const;

for (const model of moderationTables) {
  const table = backend.data.resources.tables[model];
  moderationFn.addEnvironment(`TABLE_${model}`, table.tableName);
  moderationFn.addToRolePolicy(
    new PolicyStatement({
      actions: [
        'dynamodb:GetItem',
        'dynamodb:Query',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
      ],
      resources: [table.tableArn, `${table.tableArn}/index/*`],
    }),
  );
}

const moderationUrl = moderationFn.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.POST],
    allowedHeaders: ['content-type', 'Content-Type'],
    maxAge: Duration.days(1),
  },
});

backend.addOutput({
  custom: {
    assistant_url: assistantUrl.url,
    moderation_url: moderationUrl.url,
  },
});
