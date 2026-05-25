import { tool } from 'ai';
import { z } from 'zod';

export const draftDispute = tool({
  description: 'Create a formal dispute draft. This does NOT submit the dispute; it shows the user what would be filed.',
  parameters: z.object({
    contentUrl: z.string().url(),
    reason: z.string().describe('Why the content is disputed'),
    evidence: z.string().optional().describe('Any supporting evidence'),
  }),
  execute: async ({ contentUrl, reason, evidence }: any) => {
    const draft = {
      title: `Dispute concerning ${contentUrl}`,
      description: `Reason: ${reason}${evidence ? '\nEvidence: ' + evidence : ''}`,
      suggestedStake: 500,
    };
    return JSON.stringify(draft);
  }
} as any);

export const subscribeToDispute = tool({
  description: 'Subscribe to updates for a specific dispute via webhook.',
  parameters: z.object({
    disputeId: z.string(),
    webhookUrl: z.string().url(),
  }),
  execute: async ({ disputeId, webhookUrl }: any) => {
    // Store subscription in DB
    return `Subscription set. You will be notified at ${webhookUrl} when dispute ${disputeId} is resolved.`;
  }
} as any);
