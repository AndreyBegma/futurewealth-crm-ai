import { Worker } from 'bullmq';

import { createContactWorker } from './contact.worker';
import { createEmailWorker } from './email.worker';
import { createEmailAnalysisWorker } from './emailAnalysis.worker';

let contactWorker: Worker | null = null;
let emailWorker: Worker | null = null;
let emailAnalysisWorker: Worker | null = null;

export const initializeWorkers = async () => {
  const [contact, email, emailAnalysis] = await Promise.all([
    createContactWorker(),
    createEmailWorker(),
    createEmailAnalysisWorker(),
  ]);

  contactWorker = contact;
  emailWorker = email;
  emailAnalysisWorker = emailAnalysis;
};

const ensureWorker = (worker: Worker | null, name: string) => {
  if (!worker) {
    throw new Error(`${name} worker is not initialized`);
  }
  return worker;
};

export const getContactWorker = () => ensureWorker(contactWorker, 'contact');
export const getEmailWorker = () => ensureWorker(emailWorker, 'email');
export const getEmailAnalysisWorker = () => ensureWorker(emailAnalysisWorker, 'emailAnalysis');

export const getWorkers = () => ({
  contact: getContactWorker(),
  email: getEmailWorker(),
  emailAnalysis: getEmailAnalysisWorker(),
});
