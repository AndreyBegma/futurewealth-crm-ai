import emailThreadRepository from '@/repositories/emailThread.repository';
import accountRepository from '@/repositories/account.repository';
import { ReceivedEmail, Account } from '@prisma/client';

class ThreadService {
  private normalizeSubject(subject: string): string {
    return subject.replace(/^(RE:\s*|FW:\s*|FWD:\s*)+/gi, '').trim();
  }

  private extractConversationId(email: ReceivedEmail): string | undefined {
    const raw = email.rawResponse as any;
    return raw?.conversationId;
  }
  async findOrCreate(email: ReceivedEmail, account: Account) {
    const normalizedSubject = this.normalizeSubject(email.subject);

    console.log('[ThreadService] Processing:', {
      accountId: account.id,
      rawSubject: email.subject,
      normalizedSubject,
    });

    let thread = await emailThreadRepository.findByAccount(account.id);

    if (thread) {
      console.log('[ThreadService] Thread exists, updating...', {
        threadId: thread.id,
        oldCount: thread.messageCount,
        newCount: thread.messageCount + 1,
      });

      thread = await emailThreadRepository.incrementMessageCount(
        thread.id,
        email.sentDateTime || new Date()
      );
    } else {
      console.log('[ThreadService] Creating new thread...');

      thread = await emailThreadRepository.create({
        accountId: account.id,
        normalizedSubject,
        conversationId: this.extractConversationId(email),
        firstMessageAt: email.sentDateTime || new Date(),
        lastMessageAt: email.sentDateTime || new Date(),
      });

      await accountRepository.updateWithAI(account.id, {
        threadCount: { increment: 1 },
      });

      console.log('[ThreadService] New thread created:', {
        threadId: thread.id,
        subject: normalizedSubject,
      });
    }

    return thread;
  }
}

export default new ThreadService();
