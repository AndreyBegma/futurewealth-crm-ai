export interface GenerateContactJobData {
  triggeredBy: 'manual' | 'cron';
  timestamp: string;
}

export interface GenerateContactResult {
  success: boolean;
  message: string;
  contactId?: string;
}
