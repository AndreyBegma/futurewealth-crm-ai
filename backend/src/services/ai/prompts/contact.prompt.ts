import { ChatOptions } from '../ai.interface';

export const CONTACT_GENERATION_SYSTEM_PROMPT = `You are a business contact profile generator. 
  Generate realistic, professional business contacts with appropriate:
  - Names that fit the industry and region
  - Communication styles matching their role
  - Industry-relevant interests
  - Real business pain points for their position

  Always return valid JSON matching the requested schema.`;

export const CONTACT_GENERATION_OPTIONS: ChatOptions = {
  systemPrompt: CONTACT_GENERATION_SYSTEM_PROMPT,
  format: 'json',
  temperature: 0.8,
  maxTokens: 300,
  retries: 3,
};

export const CONTACT_GENERATION_PROMPT = `
Generate a realistic, fictional business contact with minimal information.
Must be fictional — do not use real persons or companies.

Return ONLY valid JSON:
{
  "firstName": "realistic first name",
  "lastName": "realistic last name",
  "company": "company name (2-3 words, believable and fictional)",
  "companyDomain": "domain based on company name, e.g. 'apexsolutions.com'",
  "role": "job title (e.g. 'CEO', 'VP of Sales', 'CTO', 'Product Manager')",
  "industry": "industry (e.g. 'Technology', 'Finance', 'Healthcare', 'Real Estate')",
  "email": "professional email address in format 'firstname.lastname@companyDomain'",
  "notes": "short 1-2 sentence note about the contact: interests, business pain points, communication style, preferences, and things that can influence future messages",
  "personalNotes": "1-2 sentences about personal life, events, or circumstances that might influence availability or business interactions (e.g., family events, personal priorities, travel, day-off). Include these only with some realistic probability (~10-20%) and vary across contacts."
}

Requirements:
- Names, company, and emails MUST be fictional.
- Company names should be believable business names (2-3 words).
- Email must use format 'firstname.lastname@companyDomain' (lowercase).
- notes must reflect the contact's role, industry, and communication style.
- personalNotes must be realistic, fictional, and could affect availability or responsiveness.
- Return ONLY valid JSON, no extra text.
`;
