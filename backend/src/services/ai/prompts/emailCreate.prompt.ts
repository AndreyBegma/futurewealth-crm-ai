import { ChatOptions } from '../ai.interface';

export const EMAIL_GENERATION_SYSTEM_PROMPT = `You are generating realistic business emails for CRM sentiment analysis and risk detection.

Your goal:
- Create emails with VARIED EMOTIONAL TONES (positive, neutral, negative, frustrated, urgent)
- Include actionable items (callbacks, meetings, deadlines, follow-ups)
- Sometimes include risk indicators (complaints, delays, budget concerns, escalations)
- Reflect sender's personality and communication style from their profile
- Use business context (projects, blockers, associates) naturally

IMPORTANT: Email sentiment distribution should be realistic:
- 60% Neutral/Positive (routine business)
- 25% Mildly Negative (concerns, delays, pushback)
- 10% Negative (complaints, frustrations, risks)
- 5% Very Negative (escalations, threats to cancel, HR issues)

Always return valid JSON matching Microsoft Graph Message schema.`;

export const EMAIL_OPTIONS: ChatOptions = {
  systemPrompt: EMAIL_GENERATION_SYSTEM_PROMPT,
  format: 'json',
  temperature: 0.95,
  maxTokens: 1200,
  retries: 3,
};

export const buildEmailPrompt = (context: {
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    companyDomain?: string;
    role: string;
    industry: string;
    notes?: string;
    personalNotes?: string;
    businessContext?: any;
    communicationPreferences?: any;
  };
  previousEmails: Array<{
    subject: string;
    bodyPreview?: string;
    sentDateTime?: Date;
  }>;
}): string => {
  const { contact, previousEmails } = context;

  return `
Generate a realistic business email from this contact FOR CRM SENTIMENT ANALYSIS.

SENDER INFORMATION:
- Name: ${contact.firstName} ${contact.lastName}
- Email: ${contact.email}
- Company: ${contact.company}${contact.companyDomain ? ` (${contact.companyDomain})` : ''}
- Role: ${contact.role}
- Industry: ${contact.industry}
${contact.notes ? `- Business characteristics: ${contact.notes}` : ''}
${contact.personalNotes ? `- Personal context: ${contact.personalNotes}` : ''}
${contact.businessContext ? `- Current projects: ${JSON.stringify(contact.businessContext.projects || [])}` : ''}
${contact.businessContext?.blockers?.length ? `- Current blockers: ${contact.businessContext.blockers.join(', ')}` : ''}
${contact.communicationPreferences ? `- Communication style: ${contact.communicationPreferences.tone}, prefers ${contact.communicationPreferences.preferredChannel}` : ''}

  ${
    previousEmails.length > 0
      ? `
  PREVIOUS EMAIL HISTORY FROM THIS CONTACT:
  ${previousEmails
    .map(
      (email, i) => `
  ${i + 1}. Date: ${email.sentDateTime?.toISOString().split('T')[0] || 'Unknown'}
     Subject: ${email.subject}
     Preview: ${email.bodyPreview || 'N/A'}
  `
    )
    .join('\n')}

INSTRUCTIONS:
- Continue conversation from previous emails OR start new topic
- Reference projects, blockers, or associates if relevant
- Match sender's communication style (tone, formality)
- Vary emotional tone based on realistic business scenarios
`
    : `
INSTRUCTIONS - FIRST EMAIL (choose scenario):

SCENARIO DISTRIBUTION:
Pick ONE scenario with these probabilities:

POSITIVE/NEUTRAL (60%):
1. "Introduction after meeting" - Warm follow-up
2. "Sending deliverables" - Sharing promised materials
3. "Progress update" - Positive project status
4. "Meeting invitation" - Google Meet link for collaboration
5. "Quick question" - Simple request or clarification
6. "Thank you note" - Appreciation for help/service

MILDLY NEGATIVE (25%):
7. "Delayed response apology" - Sorry for late reply, explain blocker
8. "Request for extension" - Need more time due to blocker
9. "Gentle pushback" - Concerns about timeline/budget/scope
10. "Status check with concern" - Following up on delayed item
11. "Budget concerns" - Questioning costs or requesting discount
12. "Resource shortage" - Can't meet deadline, need help

NEGATIVE (10%):
13. "Formal complaint" - Issue with product/service/team
14. "Escalation" - Problem not resolved, escalating to manager
15. "Deadline missed" - Frustrated about delays impacting business
16. "Quality issues" - Disappointed with deliverable quality
17. "Miscommunication fallout" - Frustrated about misunderstanding

VERY NEGATIVE (5%):
18. "Threatening to cancel" - Considering ending contract/relationship
19. "HR concern" - Inappropriate behavior or policy violation
20. "Legal risk" - Mentioning lawyers, contracts, liability
21. "Public reputation risk" - Threatening social media/review

RISK INDICATORS TO INCLUDE (when negative):
- Keywords: "complaint", "disappointed", "unacceptable", "escalate", "cancel", "refund"
- "need to speak with your manager"
- "this is not what we agreed"
- "considering other options"
- "breach of contract"
- "HR issue", "inappropriate", "harassment"
- Urgent language: "URGENT", "ASAP", "immediately"

ACTIONABLE ITEMS TO INCLUDE (vary):
- "Can you call me tomorrow at 2pm?"
- "Let's schedule a meeting: https://meet.google.com/abc-defg-hij"
- "Please send the report by Friday"
- "I need your decision by EOD"
- "Follow up with [associate name] about [project]"
- "Review the attached contract and sign by [date]"

`
}

RECIPIENT (you are writing TO):
- Name: Client Representative
- Email: you@yourcompany.com

SENTIMENT REQUIREMENTS:
- Choose email sentiment based on scenario distribution above
- Negative emails should have CLEAR indicators: tone, word choice, explicit complaints
- Include frustration markers: "Unfortunately", "I'm disappointed", "This is unacceptable"
- Positive emails should be warm but professional
- Neutral emails are routine business

ACTION EXTRACTION REQUIREMENTS:
Include at least 1-2 of these:
- Explicit callback request with time
- Meeting invitation with Google Meet link
- Deadline or due date
- Follow-up task
- Decision request
- Document to review/sign

Return ONLY valid JSON:
{
  "id": "unique-guid",
  "subject": "email subject (reflect sentiment - urgent/neutral/positive)",
  "body": {
    "contentType": "HTML",
    "content": "full email body in HTML - include <p> tags, <strong> for emphasis, etc."
  },
  "bodyPreview": "1-2 sentence preview reflecting email tone",
  "toRecipients": [
    {
      "emailAddress": {
        "name": "Client Name",
        "address": "you@yourcompany.com"
      }
    }
  ],
  "ccRecipients": [],
  "bccRecipients": [],
  "replyTo": [],
  "sentDateTime": "ISO 8601 timestamp (recent, realistic)",
  "receivedDateTime": "ISO 8601 timestamp (same as sentDateTime or slightly after)",
  "internetMessageId": "<unique-id@${contact.companyDomain || 'example.com'}>",
  "hasAttachments": false,
  "isRead": false,
  "webLink": "https://outlook.office365.com/mail/inbox/id/AAMkAGI2TG93AAA=",
  "singleValueExtendedProperties": []
}

IMPORTANT:
- Return ONLY the JSON
- Match sender's tone from their profile
- Include realistic sentiment variety
- Add clear action items
- Use risk keywords when appropriate
`;
};
