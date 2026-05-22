/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to perform AI Content Adjudication using GenLayer consensus logic
app.post('/api/adjudicate', async (req, res) => {
  // Check if GEMINI_API_KEY is missing
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(401).json({
      error: 'GEMINI_API_KEY is missing from the environment. Please configure your API key in the Settings menu.',
    });
  }

  const { claimant, respondent, disputeType, description, evidence, stakingAmount } = req.body;

  if (!claimant || !respondent || !disputeType || !description || !evidence) {
    return res.status(400).json({ error: 'Missing required dispute fields.' });
  }

  try {
    const ai = getGeminiClient();

    const prompt = `
You are a GenLayer Intelligent Validator Consortium. Your goal is to democratically adjudicate an AI Content Originality & Intellectual Property dispute.
Resolve this using the "Optimistic Democracy" framework. You must simulate votes across 5 different virtual AI validators (e.g. Validator-1 (Gemini), Validator-2 (Llama), Validator-3 (Claude), Validator-4 (Deepseek), Validator-5 (Mistral)) and reach a consensus verdict.

DISPUTE CASE SPECIFICATION:
- Claimant Name: ${claimant}
- Respondent Name: ${respondent}
- Dispute Type: ${disputeType}
- Description of claim: ${description}
- Evidence provided: ${evidence}
- GEN Tokens Staked: ${stakingAmount || 100}

Perform full natural language reasoning and web verification simulation. Take into account copyright principles, parody/meme exceptions, transformative use factors, prompt originality, and prior art timestamps.

Return your adjudication results strictly in the following JSON format:
{
  "verdict": "CLAIM_SUSTAINED" or "CLAIM_DISMISSED",
  "confidence": <number between 0 and 100 representing certainty>,
  "votesBreakdown": {
    "sustained": <number of validators voting to sustain, e.g. 4>,
    "dismissed": <number of validators voting to dismiss, e.g. 1>,
    "details": [
      { "validator": "Validator-1", "vote": "CLAIM_SUSTAINED" or "CLAIM_DISMISSED", "reason": "brief reason description" },
      ...
    ]
  },
  "legalAnalysis": {
    "originalityScore": <number between 0 and 100 representing uniqueness>,
    "substantialSimilarity": <number between 0 and 100 for likeness>,
    "transformativeFactor": <number between 0 and 100 for transformations>,
    "summaryOfLaw": "detailed markdown summary citing IP or fair use doctrine"
  },
  "evidenceChecks": [
    { "source": "IPFS Timestamp Registry", "status": "VERIFIED" or "FAILED", "details": "verification description" },
    { "source": "Web Archive Registry", "status": "VERIFIED", "details": "verification details" }
  ],
  "tokenDistribution": {
    "claimantOutcome": "Refunded & Rewarded" or "Slashed Stakepool",
    "respondentOutcome": "Slashed" or "Refunded & Rewarded",
    "validatorPoolGEN": "Allocated to consensus majority validators"
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Emply response received from Gemini API');
    }

    const adjudicationData = JSON.parse(text);
    return res.json(adjudicationData);

  } catch (error: any) {
    console.error('Error during AI Adjudication:', error);
    
    const errorMessage = error.message || '';
    const isApiKeyInvalid = errorMessage.includes('API key not valid') || 
                           errorMessage.includes('API_KEY_INVALID') ||
                           errorMessage.includes('INVALID_ARGUMENT') ||
                           errorMessage.includes('ApiKeyNotValid') ||
                           (error.status === 400 && errorMessage.toLowerCase().includes('api key')) ||
                           (error.status === 401) ||
                           (error.statusCode === 401) ||
                           (error.statusCode === 400 && errorMessage.toLowerCase().includes('api key'));

    if (isApiKeyInvalid) {
      return res.status(401).json({
        error: 'The provided GEMINI_API_KEY is invalid. Please verify and update your API key in the Settings menu.',
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to complete adjudication simulation due to an internal error.',
    });
  }
});

// Serve Vite build in development, or standard production static files
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aetherian Network Node started at portal http://localhost:${PORT}`);
  });
};

startServer();
