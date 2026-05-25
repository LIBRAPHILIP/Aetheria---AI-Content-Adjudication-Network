import { tool } from 'ai';
import { z } from 'zod';

const stakeRules: Record<string, number> = {
  plagiarism: 500,
  factual: 300,
  deepfake: 1000,
  default: 200,
};

export const estimateEscrow = tool({
  description: 'Estimate the recommended escrow stake for a given dispute type (plagiarism, factual, deepfake).',
  parameters: z.object({
    disputeType: z.string().describe('Type of dispute'),
  }),
  execute: async ({ disputeType }: any) => {
    const key = disputeType.toLowerCase().trim();
    const stake = stakeRules[key] || stakeRules.default;
    return `The recommended escrow stake for a "${disputeType}" dispute is ${stake} GEN tokens.`;
  }
} as any);
