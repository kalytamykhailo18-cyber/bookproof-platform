import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Language, TargetMarket } from '@prisma/client';

export interface KeywordGenerationInput {
  bookTitle: string;
  genre: string;
  category: string;
  description: string;
  targetAudience: string;
  competingBooks?: string;
  specificKeywords?: string; // User-specified keywords that should be included
  language: Language;
  targetMarket: TargetMarket;
  additionalNotes?: string;
}

export interface KeywordGenerationResult {
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  usageGuidelines: {
    location: string;
    instruction: string;
    examples: string[];
  }[];
  kdpSuggestions: {
    title: string[];
    subtitle: string[];
    description: string[];
    backendKeywords: string[];
  };
}

@Injectable()
export class KeywordAiService {
  private readonly logger = new Logger(KeywordAiService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI API key not configured. Keyword generation will use fallback.');
    }
  }

  /**
   * Generate keywords using OpenAI GPT-4
   */
  async generateKeywords(input: KeywordGenerationInput): Promise<KeywordGenerationResult> {
    this.logger.log(`Generating keywords for book: ${input.bookTitle}`);

    if (!this.openai) {
      this.logger.warn('Using fallback keyword generation (no OpenAI API key)');
      return this.generateFallbackKeywords(input);
    }

    try {
      const prompt = this.buildPrompt(input);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Amazon KDP keyword research and book marketing. Generate highly relevant, searchable keywords that will help authors find readers for their books.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) {
        throw new Error('Empty response from OpenAI');
      }

      const result = JSON.parse(responseContent);

      return this.validateAndFormatResult(result);
    } catch (error) {
      this.logger.error('Error generating keywords with OpenAI', error);
      this.logger.warn('Falling back to rule-based keyword generation');
      return this.generateFallbackKeywords(input);
    }
  }

  /**
   * Build the prompt for OpenAI
   */
  private buildPrompt(input: KeywordGenerationInput): string {
    const languageInstructions = this.getLanguageInstructions(input.language);
    const marketInstructions = this.getMarketInstructions(input.targetMarket);

    return `Generate comprehensive keyword research for this book in ${languageInstructions}:

**Book Information:**
- Title: ${input.bookTitle}
- Genre: ${input.genre}
- Category: ${input.category}
- Description: ${input.description}
- Target Audience: ${input.targetAudience}
- Target Market: ${marketInstructions}
${input.competingBooks ? `- Competing Books: ${input.competingBooks}` : ''}
${input.specificKeywords ? `- Author's Preferred Keywords (MUST be included in results): ${input.specificKeywords}` : ''}
${input.additionalNotes ? `- Additional Notes: ${input.additionalNotes}` : ''}

**Instructions:**
Generate keywords optimized for Amazon KDP specifically for the ${marketInstructions} marketplace in the following structure:

1. **Primary Keywords** (5-10): Broad, high-volume search terms that define the book's main topic
2. **Secondary Keywords** (10-20): More specific terms related to subtopics and themes
3. **Long-tail Keywords** (20-30): Specific phrases that readers might search for (3-5 words each)
4. **Usage Guidelines**: Practical instructions for where to use these keywords:
   - Title optimization
   - Subtitle optimization
   - Description optimization
   - KDP backend keywords (7 keyword boxes)
5. **KDP Suggestions**: Specific recommendations for:
   - Title keyword variations
   - Subtitle keyword variations
   - Description keyword placement
   - Backend keyword boxes (7 boxes, max 50 characters each)

**Output Format (JSON):**
\`\`\`json
{
  "primaryKeywords": ["keyword1", "keyword2", ...],
  "secondaryKeywords": ["keyword1", "keyword2", ...],
  "longTailKeywords": ["long tail phrase 1", "long tail phrase 2", ...],
  "usageGuidelines": [
    {
      "location": "Title",
      "instruction": "How to use keywords in the title",
      "examples": ["Example 1", "Example 2"]
    },
    ...
  ],
  "kdpSuggestions": {
    "title": ["Title variation 1", "Title variation 2"],
    "subtitle": ["Subtitle option 1", "Subtitle option 2"],
    "description": ["Description template with keyword placement"],
    "backendKeywords": ["keyword set 1", "keyword set 2", ..., "keyword set 7"]
  }
}
\`\`\`

Generate comprehensive, relevant keywords that will help this book reach its target audience.`;
  }

  /**
   * Get language-specific instructions
   */
  private getLanguageInstructions(language: Language): string {
    switch (language) {
      case Language.EN:
        return 'English';
      case Language.ES:
        return 'Spanish (España)';
      case Language.PT:
        return 'Portuguese (Brazil)';
      default:
        return 'English';
    }
  }

  /**
   * Get market-specific instructions
   */
  private getMarketInstructions(market: TargetMarket): string {
    switch (market) {
      case TargetMarket.US:
        return 'Amazon United States (amazon.com)';
      case TargetMarket.BR:
        return 'Amazon Brazil (amazon.com.br)';
      default:
        return 'Amazon United States (amazon.com)';
    }
  }

  /**
   * Validate and format the AI response
   */
  private validateAndFormatResult(result: any): KeywordGenerationResult {
    return {
      primaryKeywords: Array.isArray(result.primaryKeywords)
        ? result.primaryKeywords.slice(0, 10)
        : [],
      secondaryKeywords: Array.isArray(result.secondaryKeywords)
        ? result.secondaryKeywords.slice(0, 20)
        : [],
      longTailKeywords: Array.isArray(result.longTailKeywords)
        ? result.longTailKeywords.slice(0, 30)
        : [],
      usageGuidelines: Array.isArray(result.usageGuidelines)
        ? result.usageGuidelines
        : [],
      kdpSuggestions: result.kdpSuggestions || {
        title: [],
        subtitle: [],
        description: [],
        backendKeywords: [],
      },
    };
  }

  /**
   * Fallback keyword generation (rule-based when OpenAI is unavailable)
   */
  private generateFallbackKeywords(input: KeywordGenerationInput): KeywordGenerationResult {
    this.logger.log('Generating fallback keywords using rule-based approach');

    // Extract words from various fields
    const titleWords = this.extractKeywords(input.bookTitle);
    const genreWords = this.extractKeywords(input.genre);
    const categoryWords = this.extractKeywords(input.category);
    const descriptionWords = this.extractKeywords(input.description);
    const audienceWords = this.extractKeywords(input.targetAudience);

    // Generate primary keywords (broad terms)
    const primaryKeywords = [
      ...new Set([
        ...genreWords.slice(0, 3),
        ...categoryWords.slice(0, 3),
        ...titleWords.slice(0, 4),
      ]),
    ].slice(0, 10);

    // Generate secondary keywords (more specific)
    const secondaryKeywords = [
      ...new Set([
        ...descriptionWords.slice(0, 10),
        ...audienceWords.slice(0, 5),
        ...this.generateCombinations(genreWords, categoryWords, 5),
      ]),
    ].slice(0, 20);

    // Generate long-tail keywords (3+ word phrases)
    const longTailKeywords = [
      ...this.generateLongTailPhrases(input),
    ].slice(0, 30);

    // Generate usage guidelines
    const usageGuidelines = [
      {
        location: 'Title',
        instruction: 'Include 1-2 primary keywords naturally in your title',
        examples: [
          `${primaryKeywords[0] || 'keyword'} for ${audienceWords[0] || 'readers'}`,
          `The Complete Guide to ${primaryKeywords[0] || 'topic'}`,
        ],
      },
      {
        location: 'Subtitle',
        instruction: 'Use 2-3 secondary keywords to expand on your topic',
        examples: [
          `A Practical Guide to ${secondaryKeywords[0] || 'subtopic'}`,
          `Master ${secondaryKeywords[0] || 'skill'} and ${secondaryKeywords[1] || 'skill'}`,
        ],
      },
      {
        location: 'Description',
        instruction: 'Naturally incorporate keywords throughout your description',
        examples: [
          `First paragraph: Use 2-3 primary keywords`,
          `Body: Mix secondary and long-tail keywords`,
          `Last paragraph: Include call-to-action with keywords`,
        ],
      },
      {
        location: 'KDP Backend Keywords',
        instruction: 'Use all 7 keyword boxes (max 50 characters each)',
        examples: [
          'Use comma-separated keywords',
          'Include long-tail phrases',
          'Avoid repeating words from title',
        ],
      },
    ];

    // Generate KDP suggestions
    const kdpSuggestions = {
      title: [
        `${input.bookTitle}`,
        `${primaryKeywords[0] || 'Topic'}: ${input.bookTitle}`,
      ],
      subtitle: [
        `A Complete Guide to ${primaryKeywords[0] || 'Topic'}`,
        `Master ${secondaryKeywords[0] || 'Skill'} in ${genreWords[0] || 'Field'}`,
      ],
      description: [
        `Start with a hook using ${primaryKeywords[0] || 'keywords'}...`,
        `Highlight benefits with ${secondaryKeywords[0] || 'keywords'}...`,
        `End with call-to-action mentioning ${primaryKeywords[1] || 'keywords'}...`,
      ],
      backendKeywords: [
        primaryKeywords.slice(0, 3).join(', '),
        secondaryKeywords.slice(0, 3).join(', '),
        longTailKeywords.slice(0, 2).join(', '),
        longTailKeywords.slice(2, 4).join(', '),
        secondaryKeywords.slice(3, 6).join(', '),
        primaryKeywords.slice(3, 6).join(', '),
        audienceWords.slice(0, 3).join(', '),
      ].slice(0, 7),
    };

    return {
      primaryKeywords,
      secondaryKeywords,
      longTailKeywords,
      usageGuidelines,
      kdpSuggestions,
    };
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    if (!text) return [];

    // Remove special characters and split into words
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3) // Only words longer than 3 characters
      .filter(word => !this.isStopWord(word));

    return [...new Set(words)]; // Remove duplicates
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'from', 'this', 'that', 'these', 'those',
      'will', 'would', 'could', 'should', 'about', 'after', 'before', 'into',
      'through', 'during', 'including', 'within', 'without', 'between',
    ]);
    return stopWords.has(word);
  }

  /**
   * Generate keyword combinations
   */
  private generateCombinations(words1: string[], words2: string[], limit: number): string[] {
    const combinations: string[] = [];
    for (let i = 0; i < Math.min(words1.length, 3); i++) {
      for (let j = 0; j < Math.min(words2.length, 3); j++) {
        combinations.push(`${words1[i]} ${words2[j]}`);
        if (combinations.length >= limit) return combinations;
      }
    }
    return combinations;
  }

  /**
   * Generate long-tail phrases
   */
  private generateLongTailPhrases(input: KeywordGenerationInput): string[] {
    const phrases: string[] = [];
    const { bookTitle, genre, category, targetAudience } = input;

    // Generate common long-tail patterns
    const genreWords = this.extractKeywords(genre);
    const categoryWords = this.extractKeywords(category);
    const audienceWords = this.extractKeywords(targetAudience);

    if (genreWords.length > 0 && audienceWords.length > 0) {
      phrases.push(`${genreWords[0]} for ${audienceWords[0]}`);
      phrases.push(`best ${genreWords[0]} for ${audienceWords[0]}`);
    }

    if (categoryWords.length > 0) {
      phrases.push(`how to ${categoryWords[0]}`);
      phrases.push(`complete guide to ${categoryWords[0]}`);
      phrases.push(`${categoryWords[0]} for beginners`);
    }

    // Add more patterns
    phrases.push(`${genre.toLowerCase()} books`);
    phrases.push(`${genre.toLowerCase()} guide`);

    return phrases;
  }
}
