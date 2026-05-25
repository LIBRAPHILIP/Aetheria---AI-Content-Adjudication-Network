import { tool } from 'ai';
import { z } from 'zod';

export const queryDisputes = tool({
  description: 'Search disputes by status (e.g., Resolved, Under Audit), fromDate, toDate (YYYY-MM-DD).',
  parameters: z.object({
    status: z.string().optional().describe('Filter by status'),
    fromDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    toDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
  }),
  execute: async ({ status, fromDate, toDate }: any) => {
    // Mock data. In a real app this would query the GenLayer backend using fetchFromGenLayer
    const mockDisputes = [
      { id: 'DSP-001', status: 'Resolved', description: 'AI-generated article accused of plagiarism', escrowStake: 500, date: '2026-05-20' },
      { id: 'DSP-002', status: 'Under Audit', description: 'Fake news detection dispute', escrowStake: 1200, date: '2026-05-21' },
      { id: 'DSP-003', status: 'Pending', description: 'Model output copyright claim', escrowStake: 300, date: '2026-05-22' }
    ];
    
    let filtered = mockDisputes;
    if (status) {
      filtered = filtered.filter(d => d.status.toLowerCase() === status.toLowerCase());
    }
    if (fromDate) {
      filtered = filtered.filter(d => new Date(d.date) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(d => new Date(d.date) <= new Date(toDate));
    }
    
    return JSON.stringify(filtered.slice(0, 10)); // limit for output
  }
} as any);
