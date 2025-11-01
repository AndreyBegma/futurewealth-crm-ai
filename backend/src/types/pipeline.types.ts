export interface PipelineAttachment {
  id: string;
  name: string;
  mimeType: string;
  textContent?: string;
  source?: string;
}

export interface PipelineMessage {
  id: string;
  subject: string;
  bodyPreview?: string;
  body?: string;
  from: string;
  to: string[];
  cc?: string[];
  category?: string;
  direction?: 'inbound' | 'outbound';
  sentAt?: string;
  receivedAt?: string;
}

export interface PipelineContactProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  company?: string;
  personalNotes?: string;
  businessNotes?: string;
  tonePreference?: string;
}

export interface SentimentPipelineInput {
  account: string;
  messages: PipelineMessage[];
  attachments?: PipelineAttachment[];
}

export interface SummarisePipelineInput extends SentimentPipelineInput {
  contact?: PipelineContactProfile;
}

