import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Memorial: a
    .model({
      slug: a.string().required(),
      fullName: a.string().required(),
      maidenName: a.string(),
      portraitUrl: a.string(),
      heroImageUrl: a.string(),
      bornOn: a.date().required(),
      diedOn: a.date().required(),
      tagline: a.string(),
      shortTribute: a.string(),
      obituaryHtml: a.string(),
      theme: a.json(),
      isPublished: a.boolean().default(false),
      programPdfUrl: a.string(),
    })
    .secondaryIndexes((index) => [index('slug')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  BiographySection: a
    .model({
      memorialId: a.id().required(),
      kind: a.enum(['childhood', 'education', 'faith', 'accomplishments', 'qualities', 'quotes', 'career']),
      heading: a.string().required(),
      body: a.string().required(),
      imageUrl: a.string(),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [index('memorialId').sortKeys(['sortOrder'])])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  TimelineEvent: a
    .model({
      memorialId: a.id().required(),
      eventDate: a.date().required(),
      title: a.string().required(),
      description: a.string(),
      imageUrl: a.string(),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [index('memorialId').sortKeys(['sortOrder'])])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  FamilyMember: a
    .model({
      memorialId: a.id().required(),
      fullName: a.string().required(),
      relation: a.string().required(),
      photoUrl: a.string(),
      bio: a.string(),
      parentId: a.id(),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [index('memorialId').sortKeys(['sortOrder'])])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  FuneralEvent: a
    .model({
      memorialId: a.id().required(),
      kind: a.enum(['service', 'visitation', 'reception', 'burial']),
      title: a.string(),
      startsAt: a.datetime().required(),
      endsAt: a.datetime(),
      timeLabel: a.string(),
      venueName: a.string().required(),
      address: a.string(),
      mapEmbedUrl: a.string(),
      parkingNotes: a.string(),
      dressCode: a.string(),
      notes: a.string(),
    })
    .secondaryIndexes((index) => [index('memorialId')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  ProgramItem: a
    .model({
      memorialId: a.id().required(),
      kind: a.enum(['hymn', 'scripture', 'speaker', 'eulogy', 'prayer', 'music']),
      title: a.string().required(),
      person: a.string(),
      reference: a.string(),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [index('memorialId').sortKeys(['sortOrder'])])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  GalleryAlbum: a
    .model({
      memorialId: a.id().required(),
      name: a.string().required(),
      category: a.enum(['childhood', 'family', 'friends', 'career', 'community', 'special', 'funeral']),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [index('memorialId').sortKeys(['sortOrder'])])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  GalleryPhoto: a
    .model({
      memorialId: a.id().required(),
      albumId: a.id().required(),
      url: a.string().required(),
      caption: a.string(),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [
      index('memorialId').sortKeys(['sortOrder']),
      index('albumId').sortKeys(['sortOrder']),
    ])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  Tribute: a
    .model({
      memorialId: a.id().required(),
      authorName: a.string().required(),
      relationship: a.string(),
      message: a.string().required(),
      photoUrl: a.string(),
      isGuestbookSignature: a.boolean().default(false),
      status: a.enum(['pending', 'approved', 'rejected']),
    })
    .secondaryIndexes((index) => [
      index('memorialId').sortKeys(['status']),
    ])
    .authorization((allow) => [
      allow.publicApiKey().to(['read', 'create']),
      allow.guest().to(['read', 'create']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  Story: a
    .model({
      memorialId: a.id().required(),
      authorName: a.string().required(),
      title: a.string().required(),
      body: a.string().required(),
      mediaUrl: a.string(),
      status: a.enum(['pending', 'approved', 'rejected']),
    })
    .secondaryIndexes((index) => [
      index('memorialId').sortKeys(['status']),
    ])
    .authorization((allow) => [
      allow.publicApiKey().to(['read', 'create']),
      allow.guest().to(['read', 'create']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  MediaItem: a
    .model({
      memorialId: a.id().required(),
      kind: a.enum(['video', 'audio', 'livestream']),
      provider: a.enum(['youtube', 'vimeo', 'upload']),
      url: a.string().required(),
      title: a.string().required(),
      category: a.string(),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [index('memorialId').sortKeys(['sortOrder'])])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  DonationCause: a
    .model({
      memorialId: a.id().required(),
      name: a.string().required(),
      description: a.string(),
      logoUrl: a.string(),
      donateUrl: a.string(),
      inLieuOfFlowersNote: a.string(),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [index('memorialId').sortKeys(['sortOrder'])])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  FamilyContact: a
    .model({
      memorialId: a.id().required(),
      name: a.string().required(),
      relation: a.string(),
      phone: a.string(),
      email: a.string(),
      note: a.string(),
    })
    .secondaryIndexes((index) => [index('memorialId')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  AdminUser: a
    .model({
      memorialId: a.id().required(),
      userId: a.string().required(),
      email: a.string().required(),
      role: a.enum(['owner', 'admin', 'moderator']),
    })
    .secondaryIndexes((index) => [
      index('memorialId'),
      index('email'),
    ])
    .authorization((allow) => [
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  AiSettings: a
    .model({
      memorialId: a.id().required(),
      assistantName: a.string().default('Memorial Guide'),
      persona: a.string(),
      greeting: a.string(),
      isEnabled: a.boolean().default(true),
      fallbackMessage: a.string(),
    })
    .secondaryIndexes((index) => [index('memorialId')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  AiQuickQuestion: a
    .model({
      memorialId: a.id().required(),
      label: a.string().required(),
      questionText: a.string().required(),
      sortOrder: a.integer().default(0),
    })
    .secondaryIndexes((index) => [index('memorialId').sortKeys(['sortOrder'])])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  AiKnowledgeEntry: a
    .model({
      memorialId: a.id().required(),
      question: a.string().required(),
      answer: a.string().required(),
      tags: a.string().array(),
    })
    .secondaryIndexes((index) => [index('memorialId')])
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.guest().to(['read']),
      allow.groups(['MemorialAdmin']).to(['create', 'read', 'update', 'delete']),
    ]),

  AiConversation: a
    .model({
      memorialId: a.id().required(),
      sessionId: a.string().required(),
    })
    .secondaryIndexes((index) => [
      index('memorialId').sortKeys(['sessionId']),
    ])
    .authorization((allow) => [
      allow.groups(['MemorialAdmin']).to(['read']),
    ]),

  AiMessage: a
    .model({
      memorialId: a.id().required(),
      conversationId: a.id().required(),
      sessionId: a.string().required(),
      role: a.enum(['user', 'assistant', 'tool']),
      content: a.string().required(),
      toolCalls: a.json(),
    })
    .secondaryIndexes((index) => [
      index('conversationId'),
      index('sessionId'),
    ])
    .authorization((allow) => [
      allow.groups(['MemorialAdmin']).to(['read']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});
