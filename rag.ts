import { tool } from 'ai';
import { z } from 'zod';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

// Initialise once
let vectorStore: PineconeStore | null = null;

async function getVectorStore() {
  if (vectorStore) return vectorStore;

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME || 'genlayer-docs');
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: 'genlayer-docs',
  });
  return vectorStore;
}

// Tool: Search the knowledge base
export const searchDocumentation = tool({
  description: 'Search the GenLayer documentation for answers to technical questions about the protocol, consensus, staking, or disputes.',
  parameters: z.object({
    query: z.string().describe('Search query'),
  }),
  execute: async ({ query }) => {
    try {
      if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
        return 'Vector database credentials not configured. Please configure PINECONE_API_KEY and OPENAI_API_KEY.';
      }
      const store = await getVectorStore();
      const results = await store.similaritySearch(query, 3);
      if (results.length === 0) return 'No relevant documentation found.';
      return results.map((doc: any, i: number) => `[${i + 1}] ${doc.pageContent}`).join('\n\n');
    } catch (e: any) {
      console.error('RAG Tool Error:', e);
      return 'An error occurred while searching the documentation.';
    }
  }
} as any);
