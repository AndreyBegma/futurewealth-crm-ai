export interface EmailAnalysisJobData {
  emailId: string;
  triggeredBy: 'manual' | 'scheduler';
  timestamp: string;
}

export interface EmailAnalysisResult {
  success: boolean;
  message: string;
  emailId: string;
  accountId?: string;
  threadId?: string;
  processingTime?: number;
  error?: string;
}
