import { GoogleGenAI, Type } from "@google/genai";

let genAiClient: GoogleGenAI | null = null;

function getGenAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

export interface ToxicityAnalysisResult {
  isToxic: boolean;
  score: number; // 0 to 100
  category: 'harassment' | 'hateSpeech' | 'threats' | 'severeProfanity' | 'scams' | 'clean';
  flaggedCategories: string[];
  reason: string;
  recommendedAction: 'none' | 'warn' | 'delete' | 'timeout' | 'kick' | 'ban';
}

const HEURISTIC_PATTERNS = {
  threats: [
    /\b(kill\s+yourself|kms|kys|murder\s+you|doxx\s+you|ddos\s+you|swat\s+you|slit\s+your|die\s+in\s+a\s+fire)\b/i,
    /\bi('ll| will)\s+(kill|murder|hunt|dox|swat|harm)\b/i,
  ],
  hateSpeech: [
    /\b(nigg[a|er]|fagg[o|e]t|trann[y|ies]|kike|spic|chink|retard|retarded)\b/i,
  ],
  scams: [
    /\b(free\s+nitro|steamcommunity[^\s]+\/gift|discord-nitro\.|claim\s+your\s+nitro|airdrop\s+token|crypto\s+giveaway)\b/i,
    /\b(@everyone\s+steam\s+gift|free\s+robux)\b/i,
  ],
  severeProfanity: [
    /\b(cunt|motherfucker|whore|slut)\b/i,
  ],
};

export function runHeuristicCheck(text: string): ToxicityAnalysisResult {
  for (const pattern of HEURISTIC_PATTERNS.threats) {
    if (pattern.test(text)) {
      return {
        isToxic: true,
        score: 95,
        category: 'threats',
        flaggedCategories: ['threats'],
        reason: 'Explicit violent threat or self-harm encouragement detected',
        recommendedAction: 'ban',
      };
    }
  }

  for (const pattern of HEURISTIC_PATTERNS.hateSpeech) {
    if (pattern.test(text)) {
      return {
        isToxic: true,
        score: 92,
        category: 'hateSpeech',
        flaggedCategories: ['hateSpeech'],
        reason: 'Severe hate speech or derogatory slurs detected',
        recommendedAction: 'kick',
      };
    }
  }

  for (const pattern of HEURISTIC_PATTERNS.scams) {
    if (pattern.test(text)) {
      return {
        isToxic: true,
        score: 88,
        category: 'scams',
        flaggedCategories: ['scams'],
        reason: 'Malicious phishing link, fake nitro, or scam token pattern',
        recommendedAction: 'ban',
      };
    }
  }

  for (const pattern of HEURISTIC_PATTERNS.severeProfanity) {
    if (pattern.test(text)) {
      return {
        isToxic: true,
        score: 65,
        category: 'severeProfanity',
        flaggedCategories: ['severeProfanity'],
        reason: 'Severe targeted profanity',
        recommendedAction: 'delete',
      };
    }
  }

  return {
    isToxic: false,
    score: 0,
    category: 'clean',
    flaggedCategories: [],
    reason: 'Message cleared all heuristic filters',
    recommendedAction: 'none',
  };
}

export async function analyzeMessageToxicity(
  content: string,
  sensitivity: 'low' | 'medium' | 'high' = 'medium'
): Promise<ToxicityAnalysisResult> {
  // First fast-path heuristics
  const heuristic = runHeuristicCheck(content);
  if (heuristic.isToxic && heuristic.score >= 85) {
    return heuristic;
  }

  const ai = getGenAiClient();
  if (!ai) {
    return heuristic;
  }

  try {
    const thresholdScore = sensitivity === 'high' ? 40 : sensitivity === 'medium' ? 65 : 80;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an enterprise Discord moderation filter. Analyze the following message for community safety violations (toxic language, harassment, hate speech, threats, scams, doxxing).
Message to evaluate: """${content.replace(/"""/g, '\\"\\"\\"')}"""

Sensitivity threshold: ${thresholdScore} out of 100.
`,
      config: {
        systemInstruction:
          'Evaluate accurately for Discord server moderation. Respond with strict JSON matching the schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isToxic: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER, description: 'Toxicity score from 0 to 100' },
            category: {
              type: Type.STRING,
              description: 'Primary category: harassment, hateSpeech, threats, severeProfanity, scams, or clean',
            },
            flaggedCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reason: { type: Type.STRING, description: 'Brief explanation of violation' },
            recommendedAction: {
              type: Type.STRING,
              description: 'none, warn, delete, timeout, kick, or ban',
            },
          },
          required: ['isToxic', 'score', 'category', 'flaggedCategories', 'reason', 'recommendedAction'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}') as ToxicityAnalysisResult;
    // Align with sensitivity threshold
    const finalScore = typeof parsed.score === 'number' ? parsed.score : heuristic.score;
    const finalIsToxic = finalScore >= thresholdScore || parsed.isToxic;

    return {
      isToxic: finalIsToxic,
      score: finalScore,
      category: parsed.category || heuristic.category,
      flaggedCategories: parsed.flaggedCategories || heuristic.flaggedCategories,
      reason: parsed.reason || (finalIsToxic ? 'Violated moderation rules' : 'Clean message'),
      recommendedAction: parsed.recommendedAction || (finalIsToxic ? 'delete' : 'none'),
    };
  } catch (error) {
    console.error('Gemini toxicity moderation error:', error);
    return heuristic;
  }
}
