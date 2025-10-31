export type EmailJobType = 'spam' | 'normal';

export interface GenerateEmailJobData {
  type: EmailJobType;
  triggeredBy: 'manual' | 'cron';
  timestamp: string;
  contactId?: string;
}

export interface GenerateEmailResult {
  success: boolean;
  message: string;
  emailId?: string;
  type: EmailJobType;
}
