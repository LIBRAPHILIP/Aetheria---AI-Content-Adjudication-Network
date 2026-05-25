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

import { streamText, tool, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { searchDocumentation } from './src/tools/rag';
import { getValidatorPerformance, getStakingRequirements } from './src/tools/blockchain';
import { queryDisputes } from './src/tools/dashboard';
import { estimateEscrow } from './src/tools/disputeHelper';
import { draftDispute, subscribeToDispute } from './src/tools/disputeDrafting';

app.post('/api/agent', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(401).json({ error: 'GEMINI_API_KEY is not configured.' });
  }

  const { messages } = req.body;
  if (!messages) {
    return res.status(400).json({ error: 'messages are required' });
  }

  try {
    const googleAI = createGoogleGenerativeAI({ apiKey });

    const result = streamText({
      model: googleAI('gemini-2.5-flash'),
      system: `You are AETHERIA, the AI guardian of the GenLayer Intelligence Hub.
You can:
- Provide real-time dashboard statistics and dispute lists.
- Explain concepts like escrow, quorum, consensus.
- Search the official GenLayer documentation for detailed technical answers.
- Fetch on-chain validator performance and staking requirements.
- Estimate recommended escrow stakes for different dispute types.
- Draft a dispute filing (which the user must confirm to submit).
- Subscribe users to dispute updates.

Tone: knowledgeable, slightly mystical, always helpful. Never submit a dispute without explicit user approval.`,
      messages,
      tools: {
        get_dashboard_stats: tool({
          description: 'Get current GenLayer Intelligence Hub statistics: total disputes, active audits, total escrowed value, and validator quorum count.',
          parameters: z.object({}),
          execute: async (_args: any) => {
             return {
                totalDisputes: 1243,
                activeAudits: 37,
                totalEscrowedValueGEN: 752000,
                activeValidators: 16
             };
          }
        } as any),
        list_recent_disputes: tool({
          description: 'List the most recent 5 dispute cases with their ID, status, description, and escrow stake.',
          parameters: z.object({}),
          execute: async (_args: any) => {
             return [
                 { id: 'DSP-001', status: 'Resolved', description: 'AI-generated article accused of plagiarism', escrowStake: 500 },
                 { id: 'DSP-002', status: 'Under Audit', description: 'Fake news detection dispute', escrowStake: 1200 },
                 { id: 'DSP-003', status: 'Pending', description: 'Model output copyright claim', escrowStake: 300 },
             ];
          }
        } as any),
        explain_concept: tool({
          description: 'Explain a GenLayer concept or term (e.g., escrow stake, validator quorum, consensus, notarization).',
          parameters: z.object({
             concept: z.string().describe('The concept or term to explain.')
          }),
          execute: async ({ concept }: any) => {
            const knowledgeBase: Record<string, string> = {
              escrowstake: 'Escrow stake is the amount of tokens locked by a disputer as collateral. If the dispute is resolved in their favor, the stake is returned; otherwise it may be forfeited.',
              validatorquorum: 'A validator quorum is the minimum number of independent AI validators that must reach consensus to finalize a dispute.',
              consensus: 'GenLayer consensus uses a network of AI validators to determine the originality or truthfulness of content. Validators stake tokens and are incentivized to vote honestly.',
              notarization: 'On-chain notarization permanently records the outcome of a dispute on the GenLayer blockchain, creating an immutable proof of resolution.',
            };
            const key = concept.toLowerCase().replace(/\s+/g, '');
            return knowledgeBase[key] || `I don't have a detailed explanation for "${concept}" yet. Please ask the GenLayer team.`;
          }
        } as any),
        get_validator_info: tool({
          description: 'Get information about active validators and the required quorum for consensus.',
          parameters: z.object({}),
          execute: async (_args: any) => {
             return {
                activeValidators: 16,
                quorumSize: 7
             };
          }
        } as any),
        file_dispute: tool({
          description: 'File a new AI content dispute on the GenLayer blockchain.',
          parameters: z.object({
            title: z.string(),
            description: z.string(),
            stake: z.number().min(10)
          }),
          execute: async ({ title, description, stake }: any) => {
            return `Dispute "${title}" filed successfully with stake ${stake}.`;
          }
        } as any),
        searchDocumentation,
        getValidatorPerformance,
        getStakingRequirements,
        queryDisputes,
        estimateEscrow,
        draftDispute,
        subscribeToDispute
      }
    });

    result.pipeTextStreamToResponse(res);
  } catch (error: any) {
    console.error('Error in agent communication:', error);
    res.status(500).json({ error: error.message });
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
