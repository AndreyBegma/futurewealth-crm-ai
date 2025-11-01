import { microsoftGraph } from '@/config/config';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

class GraphService {
  private client: Client;

  constructor() {
    const credential = new ClientSecretCredential(
      microsoftGraph.tenantId,
      microsoftGraph.clientId,
      microsoftGraph.clientSecret
    );
    this.client = Client.init({
      authProvider: async (done) => {
        try {
          const token = await credential.getToken(microsoftGraph.scope);
          console.log('[GraphService] Token obtained:', {
            hasToken: !!token?.token,
            expiresOn: token?.expiresOnTimestamp,
            scopes: microsoftGraph.scope,
          });
          done(null, token?.token || '');
        } catch (err) {
          console.error('[GraphService] Token error:', err);
          done(err as any, null);
        }
      },
    });
  }

  public async getInboxMessages(userUpn: string, top = 5) {
    try {
      console.log('[GraphService] Fetching inbox messages for:', userUpn);
      const res = await this.client
        .api(`/users/${userUpn}/mailFolders/Inbox/messages`)
        .top(top)
        .orderby('receivedDateTime DESC')
        .get();

      console.log('[GraphService] Messages fetched:', res.value?.length || 0);
      return res.value;
    } catch (err: any) {
      console.error('[GraphService] Error fetching inbox:', {
        userUpn,
        status: err.statusCode,
        code: err.code,
        message: err.message,
      });
      throw err;
    }
  }

  public async sendTestMail(userUpn: string, to: string, subject: string, body: string) {
    await this.client.api(`/users/${userUpn}/sendMail`).post({
      message: {
        subject,
        body: { contentType: 'Text', content: body },
        toRecipients: [{ emailAddress: { address: to } }],
      },
      saveToSentItems: true,
    });

    return true;
  }

  public async getAllUsers(top = 50) {
    try {
      console.log('[GraphService] Fetching users...');
      const res = await this.client
        .api('/users')
        .top(top)
        .select('displayName,userPrincipalName,mail,userType,assignedLicenses')
        .get();

      console.log('[GraphService] Users fetched:', res.value?.length || 0);
      return res.value;
    } catch (err: any) {
      console.error('[GraphService] Error fetching users:', {
        status: err.statusCode,
        code: err.code,
        message: err.message,
      });
      throw err;
    }
  }
}

export default new GraphService();
