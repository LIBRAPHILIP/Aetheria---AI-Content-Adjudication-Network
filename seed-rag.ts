import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DOCS_DIR = path.resolve(process.cwd(), 'docs');
const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME || 'genlayer-docs';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

async function loadDocuments(dir: string): Promise<string[]> {
  if (!fs.existsSync(dir)) {
    console.warn(`Docs directory ${dir} does not exist. Creating it...`);
    fs.mkdirSync(dir, { recursive: true });
    // Add a dummy doc if empty
    fs.writeFileSync(path.join(dir, 'dummy.md'), '# GenLayer Docs\\n\\nWelcome to GenLayer documentation.');
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const docs: string[] = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    docs.push(content);
  }
  return docs;
}

async function seed() {
  if (!process.env.PINECONE_API_KEY) {
    console.error('PINECONE_API_KEY is not defined in the environment. Skipping seed.');
    return;
  }

  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not defined in the environment. Skipping seed.');
    return;
  }

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pinecone.Index(PINECONE_INDEX);
  const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const rawDocs = await loadDocuments(DOCS_DIR);
  console.log(`Loaded ${rawDocs.length} documents.`);

  if (rawDocs.length === 0) {
    console.log('No documents found to seed.');
    return;
  }

  // Split into chunks
  const chunks = await textSplitter.createDocuments(rawDocs);
  console.log(`Created ${chunks.length} chunks.`);

  // Embed and store
  await PineconeStore.fromDocuments(chunks, embeddings, {
    pineconeIndex: index,
    namespace: 'genlayer-docs',
  });
  console.log('Seeding complete!');
}

seed().catch(console.error);
