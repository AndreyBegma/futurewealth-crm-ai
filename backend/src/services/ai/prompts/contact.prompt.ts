import { ChatOptions } from '../ai.interface';

export const CONTACT_GENERATION_SYSTEM_PROMPT = `You are a business contact profile generator for a CRM system.
Generate realistic, professional business contacts with rich context for relationship management.

CRITICAL: Every contact MUST be completely unique and contain detailed personal/business context.

Always return valid JSON matching the requested schema.`;

export const CONTACT_GENERATION_OPTIONS: ChatOptions = {
  systemPrompt: CONTACT_GENERATION_SYSTEM_PROMPT,
  format: 'json',
  temperature: 1.2,  // Increased for maximum diversity
  maxTokens: 800,
  retries: 3,
};

export const buildContactPrompt = (timestamp?: string) => `
Generate a UNIQUE, realistic business contact with RICH CONTEXT for CRM analysis.
Must be fictional — do not use real persons or companies.

CRITICAL UNIQUENESS RULES:
- NEVER repeat first names from previous generations (avoid: Kaito, Ethan, Alexander, Liam, etc.)
- Mix first and last names from DIFFERENT cultures (e.g., Irish first + Indian last, African first + Nordic last)
- Use uncommon names from diverse origins:
  * Irish: Saoirse, Niamh, Cillian, Oisín, Róisín
  * Japanese: Haruki, Yuki, Ren, Sakura, Aiko
  * Indian: Priya, Arjun, Kavya, Rohan, Ananya
  * Nordic: Astrid, Bjorn, Freya, Lars, Ingrid
  * Hispanic: Mateo, Lucia, Diego, Camila, Santiago
  * African: Amara, Kofi, Zuri, Kwame, Nia
  * Arabic: Layla, Omar, Zara, Rashid, Amina
  * Slavic: Katya, Dimitri, Nadia, Viktor, Anya
  * Korean: Min-jun, Ji-woo, Seo-yun, Tae-yang
  * Vietnamese: Linh, Minh, Tuan, Hoa, Duc
- Mix cultures creatively: "Saoirse Nakamura", "Arjun Sørensen", "Zuri O'Brien", "Min-jun García"
- Company names: avoid "Tech", "Solutions", "Labs" repetition
- Vary domains: .io, .ai, .tech, .co, .com, .dev, .ventures, .capital, .group, .global

${timestamp ? `Generation context: ${timestamp}` : ''}

ROLE DISTRIBUTION (IMPORTANT):
- 10% C-Level: CEO, CTO, CFO, COO, CMO
- 20% VP/Director: VP of Sales, Director of Marketing, VP of Engineering, Director of Operations
- 30% Manager: Product Manager, Sales Manager, Marketing Manager, Engineering Manager, Account Manager
- 40% Individual Contributor / Personal Contacts:
  * Sales Rep, Account Executive, Software Engineer, Data Analyst, Marketing Specialist
  * Business contacts: Consultant, Advisor, Investor, Partner
  * Personal acquaintances: Former colleague, Industry contact, Conference connection, Mentor

Return ONLY valid JSON:
{
  "firstName": "unique uncommon first name",
  "lastName": "unique last name (different culture than first name)",
  "company": "creative company name (avoid overused suffixes)",
  "companyDomain": "domain based on company name",
  "role": "realistic job title (90% NOT C-level - see distribution above)",
  "industry": "specific industry (FinTech, HealthTech, CleanTech, AI/ML, SaaS, E-commerce, PropTech, EdTech, etc.)",
  "email": "firstname.lastname@companyDomain (lowercase)",

  "notes": "Structured business context in natural text format. Adapt to role level:

FOR C-LEVEL/VPs (10-20%):
- Communication style, strategic pain points (e.g., 'board pressure, market competition')
- High-level projects with associates and blockers
- Big opportunities (partnerships, funding, M&A)

FOR MANAGERS (30%):
- Communication style, operational pain points (e.g., 'team coordination, resource allocation')
- Department projects, reports to VP/Director, works with peers
- Process improvements, tool evaluations

FOR INDIVIDUAL CONTRIBUTORS / PERSONAL CONTACTS (40-50%):
- Casual communication style, hands-on challenges (e.g., 'learning new stack, tight deadlines')
- Day-to-day work, reports to manager, collaborates with team
- For personal contacts: how you know them (e.g., 'Met at TechCrunch 2024, former colleague at Acme Corp, mentor from MBA program')
- Lighter context, focus on relationship and common interests

Make it 3-5 sentences, natural and conversational",

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
