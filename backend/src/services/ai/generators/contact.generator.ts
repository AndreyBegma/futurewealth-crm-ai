import aiService from '../ai.service';
import fakePersonRepository from '@/repositories/fakePerson.repository';
import { CONTACT_GENERATION_OPTIONS, buildContactPrompt } from '../prompts/contact.prompt';
import { ChatOptions } from '../ai.interface';
import { FakeContact } from '@/types/fakePerson.types';

class ContactGenerator {
  async generate(options?: ChatOptions, maxRetries: number = 3) {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const timestamp = new Date().toISOString();
        const randomSeed = Math.random().toString(36).substring(7);
        const prompt = buildContactPrompt(`${timestamp}-${randomSeed}`);

        const aiResponse = await aiService.chat(prompt, {
          ...CONTACT_GENERATION_OPTIONS,
          ...options,
        });

        const cleanedResponse = aiResponse
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim();

        const contactData = this.parseAndValidate(cleanedResponse);
        const savedContact = await fakePersonRepository.create(contactData);

        if (attempt > 1) {
          console.log(`[ContactGenerator] Successfully generated unique contact on attempt ${attempt}`);
        }

        return savedContact;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('already exists') && attempt < maxRetries) {
          console.log(`[ContactGenerator] Duplicate email on attempt ${attempt}, retrying...`);
          lastError = error as Error;
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }

        console.error('[ContactGenerator] Failed to generate contact:', error);
        throw error;
      }
    }

    throw lastError || new Error('Failed to generate unique contact');
  }

  private parseAndValidate(aiResponse: string): FakeContact {
    try {
      const parsed = JSON.parse(aiResponse);

      if (!parsed.firstName || !parsed.lastName || !parsed.email) {
        throw new Error('Missing required fields in AI response');
      }

      return parsed as FakeContact;
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('[ContactGenerator] Invalid JSON from AI:', aiResponse);
        throw new Error('AI returned invalid JSON format');
      }
      throw error;
    }
  }
}

export default new ContactGenerator();
