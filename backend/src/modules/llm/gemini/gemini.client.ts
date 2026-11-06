import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly client: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.geminiApiKey');

    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY is not defined in application configuration');
      throw new Error('GEMINI_API_KEY is missing');
    }

    this.client = new GoogleGenAI({ apiKey });
  }

  // Returns the instantiated GoogleGenAI client instance
  public getClient(): GoogleGenAI {
    return this.client;
  }
}