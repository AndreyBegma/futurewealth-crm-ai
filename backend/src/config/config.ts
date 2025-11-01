import dotenv from 'dotenv';

dotenv.config();

export const nodeEnv = process.env.NODE_ENV || 'development';
export const port = process.env.PORT || 4000;

export const database = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'recipe_db',
};

export const jwtSecret = process.env.JWT_SECRET || 'sec_key';
export const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

export const redis = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  url: process.env.REDIS_URL || 'redis://redis:6379',
};

export const ai = {
  provider: process.env.AI_PROVIDER || 'ollama',
  host: process.env.AI_HOST || 'http://ollama:11434',
  model: process.env.AI_MODEL || 'apertus:8b',
  apiKey: process.env.AI_API_KEY || '',
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.8'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '512', 10),
};

export const microsoftGraph = {
  tenantId: process.env.TENANT_ID || '',
  clientId: process.env.CLIENT_ID || '',
  clientSecret: process.env.CLIENT_SECRET || '',
  scope: process.env.GRAPH_SCOPE || 'https://graph.microsoft.com/.default',
};

export const bull = {
  prefix: process.env.BULL_QUEUE_PREFIX || 'crm:queue',
  maxJobsPerMinute: Number(process.env.MAX_JOBS_PER_MINUTE) || 1,
  contactGenerationCron: process.env.CONTACT_GENERATION_CRON || '*/30 * * * *',
  emailGenerationCron: process.env.EMAIL_GENERATION_CRON || '*/10 * * * *',
  emailAnalysisCron: process.env.EMAIL_ANALYSIS_CRON || '*/5 * * * *',
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY) || 1,
  jobAttempts: Number(process.env.JOB_ATTEMPTS) || 3,
  jobBackoffDelay: Number(process.env.JOB_BACKOFF_DELAY) || 5000,
  jobTimeout: Number(process.env.JOB_TIMEOUT) || 60000,
  removeOnFail: Number(process.env.BULL_REMOVE_ON_FAIL || '50'),
};
