import { contactQueue, emailQueue } from '@/queues';
import { contactWorker, emailWorker } from '@/queues/workers';

const queues = {
  contact: contactQueue,
  email: emailQueue,
};

const workers = {
  contact: contactWorker,
  email: emailWorker,
};

class QueueService {
  async getStats() {
    const stats: any = {};

    for (const [name, queue] of Object.entries(queues)) {
      const counts = await queue.getJobCounts(
        'waiting',
        'active',
        'completed',
        'failed',
        'delayed'
      );
      stats[name] = counts;
    }

    return stats;
  }

  async getWorkersStatus() {
    const workersStatus: any = {};

    for (const [name, worker] of Object.entries(workers)) {
      workersStatus[name] = {
        isRunning: worker.isRunning(),
        isPaused: await worker.isPaused(),
        name: worker.name,
      };
    }

    return workersStatus;
  }

  getQueue(queueName: string) {
    return queues[queueName as keyof typeof queues];
  }

  async getJobs(queueName: string, status: string = 'waiting', limit: number = 10) {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new Error('Queue not found');
    }

    const jobs = await queue.getJobs(status as any, 0, limit - 1);

    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    }));
  }

  getQueues() {
    return queues;
  }

  getWorkers() {
    return workers;
  }
}

export default new QueueService();
