import { ChatOptions } from '../ai.interface';

export const CONTACT_GENERATION_SYSTEM_PROMPT = `You are a business contact profile generator for a CRM system.
Generate realistic, professional business contacts with rich context for relationship management.

CRITICAL: Every contact MUST be completely unique and contain detailed personal/business context.

Always return valid JSON matching the requested schema.`;

export const CONTACT_GENERATION_OPTIONS: ChatOptions = {
  systemPrompt: CONTACT_GENERATION_SYSTEM_PROMPT,
  format: 'json',
  temperature: 1.0,
  maxTokens: 800,
  retries: 3,
};

export const buildContactPrompt = (timestamp?: string) => `
Generate a UNIQUE, realistic business contact with RICH CONTEXT for CRM analysis.
Must be fictional — do not use real persons or companies.

UNIQUENESS REQUIREMENT:
- Use DIVERSE names from various cultures (Irish, Japanese, Indian, Nordic, Hispanic, African, etc.)
- Avoid common names like "John", "Sarah", "Michael", "Emily"
- Creative company names (e.g., "Quantum Forge Labs", "Nexus Data Partners", "Crimson Wave Analytics")
- Varied domains (.io, .ai, .tech, .co, .com)
- Every contact must be COMPLETELY different

${timestamp ? `Generation context: ${timestamp}` : ''}

Return ONLY valid JSON:
{
  "firstName": "unique first name",
  "lastName": "unique last name",
  "company": "creative company name (2-4 words)",
  "companyDomain": "domain based on company name",
  "role": "specific job title (CEO, VP of Sales, CTO, Product Manager, CFO, etc.)",
  "industry": "specific industry (FinTech, HealthTech, CleanTech, AI/ML, SaaS, etc.)",
  "email": "firstname.lastname@companyDomain (lowercase)",

  "notes": "Structured business context in natural text format. Include:
- Communication style (e.g., 'Formal communicator, prefers email over calls, responds within 24h')
- Business pain points for their role (e.g., 'Struggling with team scalability, needs better analytics tools')
- Current projects (e.g., 'Working on Q1 2025 digital transformation initiative (high priority, in progress). Leading customer retention program (medium priority, planning stage)')
- Key associates (e.g., 'Works closely with CFO David Chen and reports to CEO Maria Rodriguez')
- Blockers if any (e.g., 'Waiting for budget approval, understaffed engineering team')
- Opportunities (e.g., 'Potential for enterprise license upsell, interested in AI integration')
Make it 3-5 sentences, natural and readable",

  "personalNotes": "Personal context in natural text (include 60% of time, null for 40%). Include when relevant:
- Birthday/age (e.g., 'Birthday March 15, recently turned 42')
- Family (e.g., 'Wife Sarah, two kids Emma (8) and Luke (5), golden retriever Max')
- Interests (e.g., 'Avid golfer, plays weekends. Marathon runner')
- Life events (e.g., 'Recently relocated to Austin, settling in new house')
- Communication preferences (e.g., 'Early bird, prefers morning meetings before 11am')
- Topics to avoid (e.g., 'Vegetarian, avoid steakhouse lunches. Don't discuss politics')
Make it 2-4 sentences, conversational. Examples:
- 'Birthday March 15. Wife Sarah, two kids Emma (8) and Luke (5). Avid golfer, prefers morning meetings. Vegetarian.'
- 'Recently relocated to Austin. Has dog named Max. Enjoys hiking. Early bird, best to contact before noon.'
- null"
}

Requirements:
- MAXIMUM CREATIVITY and diversity
- notes should include: communication style, 1-3 projects, 1-3 associates, 0-2 blockers, 0-2 opportunities
- All information in notes should flow naturally as connected text, not bullet points
- personalNotes should be realistic and varied (60% have them, 40% null)
- Both notes fields must reflect their actual role and industry
- Return ONLY valid JSON, no extra text.
`;

export const CONTACT_GENERATION_PROMPT = buildContactPrompt();
