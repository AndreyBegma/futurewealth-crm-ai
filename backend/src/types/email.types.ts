export enum EmailType {
  BUSINESS = 'business',
  SALES = 'sales',
  SUPPORT = 'support',
  SPAM = 'spam',
  PERSONAL = 'personal',
  FOLLOW_UP = 'follow_up',
}

export enum RelationshipStage {
  COLD = 'cold',
  WARM = 'warm',
  HOT = 'hot',
  CLIENT = 'client',
  INACTIVE = 'inactive',
}

export interface GeneratedContact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  industry: string;

  relationshipStage: RelationshipStage;
  communicationStyle: 'formal' | 'casual' | 'technical';

  interests: string[];
  painPoints: string[];

  lastContactDate?: Date;
  emailsSent: number;
  emailsReceived: number;
}

export interface GeneratedEmail {
  id: string;
  threadId: string;

  from: GeneratedContact;
  to: string;

  subject: string;
  body: string;

  type: EmailType;
  isSpam: boolean;

  // Вложения
  hasAttachments: boolean;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
  }>;

  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'low' | 'normal' | 'high';

  createdAt: Date;

  metadata: {
    relatedOpportunity?: string;
    tags: string[];
    requiresResponse: boolean;
    urgency: number;
  };
}

export interface EmailThread {
  id: string;
  subject: string;

  participants: GeneratedContact[];
  emails: GeneratedEmail[];

  type: EmailType;
  stage: RelationshipStage;

  context: {
    summary: string;
    keyTopics: string[];
    nextAction?: string;
    deals?: Array<{
      amount: number;
      status: string;
    }>;
  };

  createdAt: Date;
  lastActivityAt: Date;
}

export interface GeneratorConfig {
  emailsToGenerate: number;

  spamProbability: number;
  newContactProbability: number;
  threadContinuationProbability: number;

  relationshipStageDistribution: {
    cold: number;
    warm: number;
    hot: number;
    client: number;
  };
}
