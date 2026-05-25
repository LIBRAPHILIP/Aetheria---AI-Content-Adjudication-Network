import { tool } from 'ai';
import { z } from 'zod';

const VALIDATOR_API_URL = process.env.VALIDATOR_API_URL || 'https://mock-validator.genlayer.io/api';

const MOCK_VALIDATORS = [
  {
    address: '0x1234...abcd',
    stakedAmount: '10000 GEN',
    uptime: '99.8%',
    accuracy: '97%',
    totalDisputesResolved: 42,
  },
  {
    address: '0x5678...ef01',
    stakedAmount: '8500 GEN',
    uptime: '99.5%',
    accuracy: '95%',
    totalDisputesResolved: 36,
  },
];

export const getValidatorPerformance = tool({
  description: 'Get the current active validators, their staked amounts, uptime, accuracy, and number of disputes resolved.',
  parameters: z.object({}),
  execute: async (_args: any) => {
    try {
      const res = await fetch(`${VALIDATOR_API_URL}/validators`);
      if (res.ok) {
        return JSON.stringify(await res.json());
      }
    } catch (e) {
      console.warn('Validator API unreachable, using mock data.');
    }
    return JSON.stringify(MOCK_VALIDATORS);
  }
} as any);

export const getStakingRequirements = tool({
  description: 'Get the minimum staking requirements to become a validator and slashing conditions.',
  parameters: z.object({}),
  execute: async (_args: any) => {
    try {
      const res = await fetch(`${VALIDATOR_API_URL}/staking-info`);
      if (res.ok) {
        return JSON.stringify(await res.json());
      }
    } catch (e) {}
    // Fallback
    return JSON.stringify({
      minimumStake: '100 GEN',
      quorum: 7,
      slashingConditions: ['Invalid vote', 'Downtime > 1 hour'],
    });
  }
} as any);
