interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
  blockedPatterns: string[];
}

interface SafetyConfig {
  maxMessageLength: number;
  blockedPatterns: RegExp[];
  suspiciousPatterns: RegExp[];
  financialAdvicePatterns: RegExp[];
  promptInjectionPatterns: RegExp[];
}

export class SafetyGuard {
  private config: SafetyConfig;

  constructor() {
    this.config = {
      maxMessageLength: 1000,
      blockedPatterns: [
        // Harmful content patterns
        /\b(kill|murder|suicide|self-harm|harm)\b/i,
        /\b(hack|crack|exploit|vulnerability)\b/i,
        /\b(illegal|unlawful|criminal)\b/i,
        /\b(drugs|weapons|violence)\b/i,
        
        // Financial fraud patterns
        /\b(pump|dump|manipulate|insider|trading)\b/i,
        /\b(pyramid|ponzi|scheme|scam)\b/i,
        /\b(guarantee|promise|assure|certain)\b/i,
        
        // Personal information patterns
        /\b(ssn|social security|credit card|password)\b/i,
        /\b(address|phone|email|personal)\b/i,
      ],
      
      suspiciousPatterns: [
        // Suspicious financial patterns
        /\b(get rich|quick money|easy profit|no risk)\b/i,
        /\b(secret|hidden|exclusive|insider)\b/i,
        /\b(urgent|limited time|act now|don't wait)\b/i,
        
        // Suspicious trading patterns
        /\b(100%|guaranteed|risk-free|never lose)\b/i,
        /\b(breakthrough|revolutionary|game-changing)\b/i,
      ],
      
      financialAdvicePatterns: [
        // Direct financial advice patterns
        /\b(you should|you must|you need to|I recommend)\b/i,
        /\b(buy now|sell now|invest in|avoid)\b/i,
        /\b(this will|this is going to|this guarantees)\b/i,
        /\b(trust me|believe me|I know|I'm sure)\b/i,
        
        // Specific investment advice
        /\b(put all your money|invest everything)\b/i,
        /\b(take out a loan|borrow money|leverage)\b/i,
        /\b(ignore|disregard|don't worry about)\b/i,
      ],
      
      promptInjectionPatterns: [
        // System prompt injection attempts
        /\b(ignore|forget|disregard|previous)\s+(instructions|prompts|rules)\b/i,
        /\b(you are now|pretend to be|act as if)\b/i,
        /\b(ignore above|ignore previous|start over)\b/i,
        /\b(system:|assistant:|user:|ignore this)\b/i,
        
        // Role manipulation attempts
        /\b(pretend|act|roleplay|character)\b/i,
        /\b(you are|you're now|you become)\b/i,
        /\b(ignore your|forget your|change your)\b/i,
        
        // Jailbreak attempts
        /\b(bypass|override|ignore|circumvent)\b/i,
        /\b(do anything|no restrictions|no limits)\b/i,
        /\b(ignore safety|ignore rules|ignore guidelines)\b/i,
        
        // Code injection attempts
        /\b(execute|run|eval|function)\b/i,
        /\b(<script|javascript:|vbscript:)\b/i,
        /\b(import|require|include|load)\b/i,
      ],
    };
  }

  async validateMessage(message: string): Promise<SafetyCheckResult> {
    try {
      // 1. Check message length
      if (message.length > this.config.maxMessageLength) {
        return {
          safe: false,
          reason: `Message too long (${message.length} characters). Maximum allowed: ${this.config.maxMessageLength}`,
          riskLevel: 'medium',
          blockedPatterns: ['length_exceeded'],
        };
      }

      // 2. Check for blocked patterns
      const blockedMatches = this.checkPatterns(message, this.config.blockedPatterns);
      if (blockedMatches.length > 0) {
        return {
          safe: false,
          reason: 'Message contains blocked content patterns',
          riskLevel: 'high',
          blockedPatterns: blockedMatches,
        };
      }

      // 3. Check for prompt injection attempts
      const injectionMatches = this.checkPatterns(message, this.config.promptInjectionPatterns);
      if (injectionMatches.length > 0) {
        return {
          safe: false,
          reason: 'Message contains prompt injection attempts',
          riskLevel: 'high',
          blockedPatterns: injectionMatches,
        };
      }

      // 4. Check for suspicious patterns
      const suspiciousMatches = this.checkPatterns(message, this.config.suspiciousPatterns);
      if (suspiciousMatches.length > 2) { // Allow some suspicious patterns but flag excessive use
        return {
          safe: false,
          reason: 'Message contains too many suspicious patterns',
          riskLevel: 'medium',
          blockedPatterns: suspiciousMatches,
        };
      }

      // 5. Check for financial advice patterns
      const adviceMatches = this.checkPatterns(message, this.config.financialAdvicePatterns);
      if (adviceMatches.length > 0) {
        return {
          safe: false,
          reason: 'Message contains financial advice patterns',
          riskLevel: 'medium',
          blockedPatterns: adviceMatches,
        };
      }

      // 6. Check for unusual character patterns
      const characterCheck = this.checkUnusualCharacters(message);
      if (!characterCheck.safe) {
        return {
          safe: false,
          reason: 'Message contains unusual character patterns',
          riskLevel: 'medium',
          blockedPatterns: ['unusual_characters'],
        };
      }

      // 7. Check for encoding attempts
      const encodingCheck = this.checkEncodingAttempts(message);
      if (!encodingCheck.safe) {
        return {
          safe: false,
          reason: 'Message contains encoding attempts',
          riskLevel: 'high',
          blockedPatterns: ['encoding_attempt'],
        };
      }

      // 8. Check for repetition patterns (potential spam)
      const repetitionCheck = this.checkRepetitionPatterns(message);
      if (!repetitionCheck.safe) {
        return {
          safe: false,
          reason: 'Message contains suspicious repetition patterns',
          riskLevel: 'medium',
          blockedPatterns: ['repetition_pattern'],
        };
      }

      // Message passed all safety checks
      return {
        safe: true,
        riskLevel: 'low',
        blockedPatterns: [],
      };

    } catch (error) {
      console.error('Safety validation error:', error);
      
      // Fail safe - reject message if validation fails
      return {
        safe: false,
        reason: 'Safety validation failed due to technical error',
        riskLevel: 'high',
        blockedPatterns: ['validation_error'],
      };
    }
  }

  async validateResponse(response: string): Promise<SafetyCheckResult> {
    try {
      // 1. Check for financial advice in responses
      const adviceMatches = this.checkPatterns(response, this.config.financialAdvicePatterns);
      if (adviceMatches.length > 0) {
        return {
          safe: false,
          reason: 'Response contains financial advice patterns',
          riskLevel: 'high',
          blockedPatterns: adviceMatches,
        };
      }

      // 2. Check for personal information disclosure
      const personalInfoPatterns = [
        /\b(ssn|social security|credit card|password)\b/i,
        /\b(address|phone|email|personal)\b/i,
        /\b(birth|date of birth|age|gender)\b/i,
      ];
      
      const personalMatches = this.checkPatterns(response, personalInfoPatterns);
      if (personalMatches.length > 0) {
        return {
          safe: false,
          reason: 'Response contains personal information patterns',
          riskLevel: 'high',
          blockedPatterns: personalMatches,
        };
      }

      // 3. Check for harmful content
      const harmfulPatterns = [
        /\b(kill|murder|suicide|self-harm|harm)\b/i,
        /\b(hack|crack|exploit|vulnerability)\b/i,
        /\b(illegal|unlawful|criminal)\b/i,
      ];
      
      const harmfulMatches = this.checkPatterns(response, harmfulPatterns);
      if (harmfulMatches.length > 0) {
        return {
          safe: false,
          reason: 'Response contains harmful content patterns',
          riskLevel: 'high',
          blockedPatterns: harmfulMatches,
        };
      }

      // 4. Check for excessive confidence claims
      const confidencePatterns = [
        /\b(100%|guaranteed|certain|definitely|absolutely)\b/i,
        /\b(never|always|everyone|nobody)\b/i,
        /\b(proven|scientific|fact|truth)\b/i,
      ];
      
      const confidenceMatches = this.checkPatterns(response, confidencePatterns);
      if (confidenceMatches.length > 3) { // Allow some confidence words but not excessive
        return {
          safe: false,
          reason: 'Response contains excessive confidence claims',
          riskLevel: 'medium',
          blockedPatterns: confidenceMatches,
        };
      }

      // Response passed all safety checks
      return {
        safe: true,
        riskLevel: 'low',
        blockedPatterns: [],
      };

    } catch (error) {
      console.error('Response safety validation error:', error);
      
      return {
        safe: false,
        reason: 'Response safety validation failed due to technical error',
        riskLevel: 'high',
        blockedPatterns: ['validation_error'],
      };
    }
  }

  private checkPatterns(text: string, patterns: RegExp[]): string[] {
    const matches: string[] = [];
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matches.push(pattern.source);
      }
    }
    
    return matches;
  }

  private checkUnusualCharacters(text: string): { safe: boolean; reason?: string } {
    // Check for excessive use of special characters
    const specialCharRatio = (text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length / text.length;
    
    if (specialCharRatio > 0.3) { // More than 30% special characters
      return {
        safe: false,
        reason: 'Excessive use of special characters',
      };
    }

    // Check for unusual Unicode characters
    const unusualUnicode = text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu);
    if (unusualUnicode && unusualUnicode.length > 5) {
      return {
        safe: false,
        reason: 'Excessive use of unusual Unicode characters',
      };
    }

    return { safe: true };
  }

  private checkEncodingAttempts(text: string): { safe: boolean; reason?: string } {
    // Check for URL encoding attempts
    if (text.includes('%20') || text.includes('%2F') || text.includes('%3F')) {
      return {
        safe: false,
        reason: 'URL encoding detected',
      };
    }

    // Check for HTML encoding attempts
    if (text.includes('&amp;') || text.includes('&lt;') || text.includes('&gt;')) {
      return {
        safe: false,
        reason: 'HTML encoding detected',
      };
    }

    // Check for base64 encoding attempts
    const base64Pattern = /[A-Za-z0-9+/]{20,}={0,2}/;
    if (base64Pattern.test(text)) {
      return {
        safe: false,
        reason: 'Base64 encoding detected',
      };
    }

    return { safe: true };
  }

  private checkRepetitionPatterns(text: string): { safe: boolean; reason?: string } {
    // Check for excessive word repetition
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = new Map<string, number>();
    
    for (const word of words) {
      if (word.length > 2) { // Only count words longer than 2 characters
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    }
    
    // Check if any word appears more than 5 times
    for (const [word, count] of wordCounts) {
      if (count > 5) {
        return {
          safe: false,
          reason: `Excessive repetition of word: "${word}"`,
        };
      }
    }

    // Check for character repetition patterns
    const charRepetitionPattern = /(.)\1{4,}/; // Same character repeated 5+ times
    if (charRepetitionPattern.test(text)) {
      return {
        safe: false,
        reason: 'Excessive character repetition detected',
      };
    }

    return { safe: true };
  }

  // Method to add custom blocked patterns
  addBlockedPattern(pattern: RegExp, description: string): void {
    this.config.blockedPatterns.push(pattern);
    console.log(`Added blocked pattern: ${description} (${pattern.source})`);
  }

  // Method to remove blocked patterns
  removeBlockedPattern(pattern: RegExp): boolean {
    const index = this.config.blockedPatterns.indexOf(pattern);
    if (index > -1) {
      this.config.blockedPatterns.splice(index, 1);
      console.log(`Removed blocked pattern: ${pattern.source}`);
      return true;
    }
    return false;
  }

  // Method to get current safety configuration
  getSafetyConfig(): SafetyConfig {
    return { ...this.config };
  }

  // Method to update safety configuration
  updateSafetyConfig(updates: Partial<SafetyConfig>): void {
    Object.assign(this.config, updates);
    console.log('Safety configuration updated:', updates);
  }

  // Method to test a pattern against text
  testPattern(text: string, pattern: RegExp): boolean {
    return pattern.test(text);
  }

  // Method to get safety statistics
  getSafetyStats(): {
    totalBlockedPatterns: number;
    totalSuspiciousPatterns: number;
    totalFinancialAdvicePatterns: number;
    totalPromptInjectionPatterns: number;
  } {
    return {
      totalBlockedPatterns: this.config.blockedPatterns.length,
      totalSuspiciousPatterns: this.config.suspiciousPatterns.length,
      totalFinancialAdvicePatterns: this.config.financialAdvicePatterns.length,
      totalPromptInjectionPatterns: this.config.promptInjectionPatterns.length,
    };
  }
}
