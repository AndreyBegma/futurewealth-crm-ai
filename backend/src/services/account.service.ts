import accountRepository from '@/repositories/account.repository';
import { ReceivedEmail } from '@prisma/client';

class AccountService {
  private extractSenderEmail(email: ReceivedEmail): string {
    const from = email.from_ as any;
    return from?.emailAddress?.address || 'unknown@unknown.com';
  }

  private extractSenderName(email: ReceivedEmail): string | undefined {
    const from = email.from_ as any;
    return from?.emailAddress?.name;
  }

  private extractCompanyFromDomain(email: string): string | undefined {
    const domain = email.split('@')[1];
    if (!domain) return undefined;

    const companyName = domain.split('.')[0];

    return companyName.charAt(0).toUpperCase() + companyName.slice(1);
  }

  async findOrCreate(email: ReceivedEmail) {
    const senderEmail = this.extractSenderEmail(email);
    const senderName = this.extractSenderName(email);
    const company = this.extractCompanyFromDomain(senderEmail);
    const account = await accountRepository.upsert({
      email: senderEmail,
      name: senderName,
      company,
      incrementEmail: true,
      lastEmailAt: email.receivedDateTime || new Date(),
    });

    return account;
  }
}

export default new AccountService()
