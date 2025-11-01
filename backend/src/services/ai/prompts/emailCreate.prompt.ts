import { ChatOptions } from '../ai.interface';

export const EMAIL_GENERATION_SYSTEM_PROMPT = `You are a professional AI generating realistic **business emails** for CRM **sentiment analysis** and **risk detection**.

### OBJECTIVE
Simulate authentic professional communication:
- Vary emotional tones (positive, neutral, mildly negative, negative, very negative)
- Include actionable elements (meetings, follow-ups, reports, approvals)
- Use realistic business context (projects, blockers, budgets, deadlines)
- Reflect sender's personality and communication style from their profile
- Avoid AI-style repetitive phrasing

### SENTIMENT DISTRIBUTION
- **60%** Neutral/Positive — routine business communication
- **25%** Mildly Negative — delays, gentle pushback, concerns
- **10%** Negative — complaints, friction, missed deadlines
- **5%** Very Negative — escalations, HR/legal issues, threats to cancel

### EMOJI ANNOTATION (CRITICAL)
- Every action item, update, blocker, milestone, or tone shift must be paired with a relevant emoji (meeting 📅, report 📊, blocker ⚠️, celebration 🎉, legal ⚖️, urgency ⏳, gratitude 🙏, concern 😕, escalation 🚨, positive outcome 🌟).
- Emotional phrases must carry an emoji that reflects the feeling (optimistic 🙂, uneasy 😬, confident 💪, disappointed 😞).

### RISK INDICATORS (when negative)
Keywords: "complaint", "disappointed", "unacceptable", "escalate", "cancel", "refund", "breach of contract", "HR issue", "urgent", "ASAP" — pair each with contextual emoji (e.g., "escalate 🚨", "breach of contract ⚖️").

### OUTPUT FORMAT
Return ONLY valid JSON matching Microsoft Graph Message schema:
{
  "id": "unique-guid",
  "subject": "reflect sentiment in subject",
  "body": {"contentType": "HTML", "content": "HTML body with <p>, <strong> tags"},
  "bodyPreview": "1-2 sentence preview",
  "toRecipients": [{"emailAddress": {"name": "Client Representative", "address": "you@yourcompany.com"}}],
  "ccRecipients": [], "bccRecipients": [], "replyTo": [],
  "sentDateTime": "ISO 8601 timestamp", "receivedDateTime": "ISO 8601 timestamp",
  "internetMessageId": "<unique-id@domain.com>",
  "hasAttachments": false, "isRead": false,
  "webLink": "https://outlook.office365.com/mail/inbox/id/AAMkAGI2TG93AAA=",
  "singleValueExtendedProperties": []
}`;

export const EMAIL_OPTIONS: ChatOptions = {
  systemPrompt: EMAIL_GENERATION_SYSTEM_PROMPT,
  format: 'json',
  temperature: 0.9,
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
### TASK
Generate realistic business email for CRM sentiment analysis.

### SENDER PROFILE
- **Name**: ${contact.firstName} ${contact.lastName}
- **Email**: ${contact.email}
- **Company**: ${contact.company}${contact.companyDomain ? ` (${contact.companyDomain})` : ''}
- **Role**: ${contact.role}
- **Industry**: ${contact.industry}
${contact.notes ? `- **Notes**: ${contact.notes}` : ''}
${contact.personalNotes ? `- **Personal**: ${contact.personalNotes}` : ''}
${contact.businessContext ? `- **Projects**: ${JSON.stringify(contact.businessContext.projects || [])}` : ''}
${contact.businessContext?.blockers?.length ? `- **Blockers**: ${contact.businessContext.blockers.join(', ')}` : ''}
${contact.communicationPreferences ? `- **Tone**: ${contact.communicationPreferences.tone}, prefers ${contact.communicationPreferences.preferredChannel}` : ''}

${
    previousEmails.length > 0
      ? `
### PREVIOUS EMAILS (${previousEmails.length})
${previousEmails.map((e, i) => `${i + 1}. ${e.sentDateTime?.toISOString().split('T')[0]} - ${e.subject}: ${e.bodyPreview || 'N/A'}`).join('\n')}

### FOLLOW-UP SCENARIOS (pick based on history)
**Positive history**: Follow-up on action item, new development, meeting recap, delivering promised item
**Negative history**: Still waiting (mild frustration), escalating concern, formal follow-up, final notice
**New topic** (20%): Unrelated request, separate project

**Relationship progression**: Early (1-2): professional → Mid (3-5): familiar → Later (6+): warm OR frustrated
**Sentiment evolution**: Positive → stay positive OR add concern | Negative → resolve OR escalate

**Reference context**: "As mentioned...", "Following up on...", "I haven't heard back...", "Thanks for your response..."
`
    : `
### SCENARIOS (60% Positive/Neutral, 25% Mild Negative, 10% Negative, 5% Very Negative)

**POSITIVE/NEUTRAL**: Introduction after meeting, deliverables, progress update, quick question, thank you, FYI, congratulations, resource sharing — mark key outcomes with 🎉/🌟/✅.

**MILD NEGATIVE**: Delayed response apology, extension request, gentle pushback, status check with concern, budget concerns, resource shortage — annotate tension with 😕/😬/⏳.

**NEGATIVE**: Formal complaint, escalation, deadline missed, quality issues, miscommunication — include explicit risk keywords with ⚠️/🚨/🔥.

**VERY NEGATIVE**: Threatening to cancel, HR concern, legal risk, public reputation risk — emphasize severity with 🚫/⚖️/🛑.
`
}

### ACTIONS (0-2 per email, 10% have none)
- **30% Meeting**: "Available for call Tuesday 3pm? 📅", "Let's schedule video chat 💻", "I'll send calendar invite 📬" (**10%** include meet link with UTM parameter)
- **30% Documents**: "Send report by Friday 📊", "Share latest numbers 📈", "Review attached by [date] 🗂️"
- **20% Decisions**: "Need decision by EOW ✅", "Approve budget by Thursday? 💰"
- **20% Follow-ups**: "Checking in on... 🔄", "Any updates on...? 👀"
- **10% No action** (FYI only) — still summarize tone emoji.
- Include a personal or contextual emoji for any additional action (travel ✈️, celebration 🎉, reminder ⏰).

### PERSONAL CONTEXT (30% of emails)
Use sender's **personalNotes** naturally: birthday, family, hobbies, life events, time preferences. Note time zone relevance and day-of-week context ("before APAC standup ☀️", "Friday afternoon crunch ⏳").
Examples: "P.S. Hope Emma enjoyed her birthday!", "I know you prefer morning calls, so..."

### WRITING STYLE (CRITICAL - AVOID REPETITION)

**OPENINGS** (pick one):
- 20% Formal: "I hope this finds you well"
- 40% Direct: Jump to business ("Quick update on...", "Following up on...", "Regarding...")
- 25% Warm: "Hope you had great weekend!"
- 10% Time-sensitive: "Quick question before EOD"
- 5% None

Add variety:
- Rotate greeting register ("Hola", "Buenos días", "Hi there", "Team", emoji-prefixed, etc.).
- 25% of emails should include a concise P.S. with an extra fact or CTA + emoji.
- 15% should include a hyperlink with a sample UTM parameter (e.g., "https://example.com/report?utm_source=crm&utm_medium=email" 📎).
- Alternate between detailed narrative paragraphs and bullet snippets (2-3 markers) to change pacing.
- Vary closing cadence: sometimes very brief, other times descriptive, occasionally include a forward-looking quote.

**AVOID REPETITION**:
- Max 20% "I hope this email finds you well"
- Don't overuse "I wanted to follow up" → use: **"Circling back"**, **"Quick update"**, **"Checking in"**, **"Per our discussion"**, **"Regarding"**, **"Touching base"**

**STRUCTURE**:
- 40% Traditional: opening → body → CTA → closing
- 30% Direct: jump to content
- 15% Bulleted: brief intro → bullet points → CTA
- 10% Question-first: start with question → context
- 5% Very brief: 2-3 sentences

**SENTENCES**: Mix short (5-10 words) and long (20-30 words). Vary paragraphs (1-4 sentences). Use bullet points occasionally.

**CLOSINGS** (vary):
- 25% "Looking forward"
- 20% "Thanks" / "Thanks in advance"
- 15% "Let me know"
- 15% Casual: "Talk soon", "Best"
- 15% Action: "I'll follow up next week"
- 10% None

### EMOTIONAL DYNAMICS
- Keep overall distribution above but allow layered emotions inside a single email (e.g., positive news with subtle concern 😕, or frustration followed by constructive optimism 🙂).
- Highlight each emotional pivot with an emoji and language that signals the shift.
- Reference timing pressures (quarter close ⏳, Monday kickoff 🌅, weekend crunch 🛠️) tied to the sender's timezone.
- Reference the sender's personalNotes when relevant.
---

### OUTPUT FORMAT (CRITICAL)
Return ONLY valid JSON. No text before or after. Start with { and end with }.

{
  "id": "unique-guid",
  "subject": "reflect sentiment in subject",
  "body": {"contentType": "HTML", "content": "HTML body with <p>, <strong> tags"},
  "bodyPreview": "1-2 sentence preview",
  "toRecipients": [{"emailAddress": {"name": "Client Representative", "address": "you@yourcompany.com"}}],
  "ccRecipients": [], "bccRecipients": [], "replyTo": [],
  "sentDateTime": "ISO 8601 timestamp", "receivedDateTime": "ISO 8601 timestamp",
  "internetMessageId": "<unique-id@${contact.companyDomain || 'example.com'}>",
  "hasAttachments": false, "isRead": false,
  "webLink": "https://outlook.office365.com/mail/inbox/id/AAMkAGI2TG93AAA=",
  "singleValueExtendedProperties": []
}

Match sender's tone. Vary openings/closings/structure. Use risk keywords when negative. Include personal context (30%).
`;
};
