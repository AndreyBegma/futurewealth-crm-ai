import aiService from '../ai.service';
import fakePersonRepository from '@/repositories/fakePerson.repository';
import { CONTACT_GENERATION_OPTIONS, CONTACT_GENERATION_PROMPT } from '../prompts/contact.prompt';
import { ChatOptions } from '../ai.interface';
import { FakeContact } from '@/types/fakePerson.types';

class ContactGenerator {
  async generate(options?: ChatOptions) {
    try {
      const aiResponse = await aiService.chat(CONTACT_GENERATION_PROMPT, {
        ...CONTACT_GENERATION_OPTIONS,
        ...options,
      });

      const contactData = this.parseAndValidate(aiResponse);
      const savedContact = await fakePersonRepository.create(contactData);

      return savedContact;
    } catch (error) {
      console.error('[ContactGenerator] Failed to generate contact:', error);
      throw error;
    }
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
