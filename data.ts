/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Dispute {
  id: string;
  claimant: string;
  respondent: string;
  disputeType: string;
  status: 'RESOLVED' | 'UNDER_AUDIT' | 'QUEUED' | 'APPEALED';
  description: string;
  evidence: string;
  stakingAmount: number;
  verdict?: 'CLAIM_SUSTAINED' | 'CLAIM_DISMISSED';
  confidence?: number;
  dateSubmitted: string;
  votes?: {
    sustained: number;
    dismissed: number;
    details: Array<{ validator: string; vote: string; reason: string }>;
  };
  analysis?: {
    originalityScore: number;
    substantialSimilarity: number;
    transformativeFactor: number;
    summaryOfLaw: string;
  };
  evidenceChecks?: Array<{ source: string; status: string; details: string }>;
}

export const DISPUTE_TEMPLATES = [
  {
    type: 'AI Art Originality',
    description: 'Assess if a synthesized image or visual generation is derivative or represents a genuine standalone creative work under fair use limits.',
    typicalEvidence: 'Creative prompts, style seed details, diffusion step counts, and comparative image URLs.'
  },
  {
    type: 'AI Text Plagiarism',
    description: 'Determine if an LLM-generated book segment, technical codebase, or research paper copies structure or ideas from existing authors without transformation.',
    typicalEvidence: 'Original author documents, generated text strings, and semantic overlay mappings.'
  },
  {
    type: 'AI Audio Sampling',
    description: 'Inspect synthetic vocal tracks, voice clones, or music riffs for stylistic duplication and lack of authentic creative modification.',
    typicalEvidence: 'Spectrogram frequencies, synthesized model references, and sample timestamps.'
  },
  {
    type: 'Automated Content Appeals',
    description: 'Contest automated platform censorship or copyright takedowns through independent GenLayer semantic audits.',
    typicalEvidence: 'Takedown notice files, platform policies, and original context briefs.'
  }
];

export const INITIAL_DISPUTES: Dispute[] = [
  {
    id: "DISP-1142",
    claimant: "NovaCreative Agent #4",
    respondent: "CyberSynthetics Co.",
    disputeType: "AI Art Originality",
    status: "RESOLVED",
    description: "Claim that CyberSynthetics' commercial background textures mimic NovaCreative's hand-crafted diffusion weights and prompt patterns directly without permission, causing direct revenue substitution.",
    evidence: "IPFS CID: QmXGtY2... original generation prompts, style seed 4210984, compared with CyberSynthetic's live asset marketplace link.",
    stakingAmount: 500,
    verdict: "CLAIM_SUSTAINED",
    confidence: 88,
    dateSubmitted: "2026-05-18",
    votes: {
      sustained: 4,
      dismissed: 1,
      details: [
        { validator: "Validator-1 (Gemini-Flash-Consensus)", vote: "CLAIM_SUSTAINED", reason: "Found 84% prompt similarity with nearly identical color vector spaces and seed outputs." },
        { validator: "Validator-2 (Llama-Adjudicator)", vote: "CLAIM_SUSTAINED", reason: "Substantial similarity in structural style without any transformative elements." },
        { validator: "Validator-3 (Claude-Juror)", vote: "CLAIM_SUSTAINED", reason: "The respondent failed to prove independent creation given the chronological evidence sequence." },
        { validator: "Validator-4 (Deepseek-Audit)", vote: "CLAIM_DISMISSED", reason: "Artistic styles are not patentable under standard copyright, transformations are sufficient." },
        { validator: "Validator-5 (Mistral-Oracle)", vote: "CLAIM_SUSTAINED", reason: "Commercial replacement effect is high, violating fair use multi-part tests." }
      ]
    },
    analysis: {
      originalityScore: 92,
      substantialSimilarity: 81,
      transformativeFactor: 15,
      summaryOfLaw: "The dispute falls under **U.S. Copyright Act Section 107 (Fair Use Doctrine)**. A critical analysis of the four fair use factors determines that CyberSynthetics' work is highly commercial, non-transformative, and substitutes the market value of NovaCreative's original creation."
    },
    evidenceChecks: [
      { source: "IPFS Timestamp Registry", status: "VERIFIED", details: "NovaCreative's assets were registered on 2026-02-12T10:14:00Z." },
      { source: "Arweave Metadata Link", status: "VERIFIED", details: "CyberSynthetics' textures were minted on 2026-04-10T18:32:00Z." }
    ]
  },
  {
    id: "DISP-1143",
    claimant: "Auralis Music Group",
    respondent: "HyperEcho.io Lab",
    disputeType: "AI Audio Sampling",
    status: "UNDER_AUDIT",
    description: "Assertion that HyperEcho vocal clone 'Echo-Taylor' replicates real vocal characteristics with a 98% formants overlap, surpassing standard artistic boundaries and violating portraiture right protocols.",
    evidence: "Vocal frequency comparison data file, model descriptor JSON, audio file hashes from decentralised storage.",
    stakingAmount: 1200,
    dateSubmitted: "2026-05-21",
    evidenceChecks: [
      { source: "Vocal Frequency Analyzer Service", status: "VERIFIED", details: "Identified high-range pitch similarities." }
    ]
  },
  {
    id: "DISP-1144",
    claimant: "DevFlow Systems",
    respondent: "AutoCode Agent #11",
    disputeType: "AI Text Plagiarism",
    status: "RESOLVED",
    description: "Claim that AutoCode commercial database library reproduces DevFlow patented state-machine algorithms verbatim without honoring the open-source dual license attribution.",
    evidence: "Git Commit hash: d085f1c... containing algorithm architecture, compared with AutoCode dynamic generation endpoint outputs.",
    stakingAmount: 850,
    verdict: "CLAIM_SUSTAINED",
    confidence: 94,
    dateSubmitted: "2026-05-19",
    votes: {
      sustained: 5,
      dismissed: 0,
      details: [
        { validator: "Validator-1 (Gemini-Flash-Consensus)", vote: "CLAIM_SUSTAINED", reason: "verbatim code match found for 12 files representing core algorithm loops." },
        { validator: "Validator-2 (Llama-Adjudicator)", vote: "CLAIM_SUSTAINED", reason: "No functional modification made. Complete reproduction of internal functions." },
        { validator: "Validator-3 (Claude-Juror)", vote: "CLAIM_SUSTAINED", reason: "The copyright protection extends to expressive code layouts which were directly copied." },
        { validator: "Validator-4 (Deepseek-Audit)", vote: "CLAIM_SUSTAINED", reason: "Consensus satisfied. Commercial distribution without keeping open-source licenses." },
        { validator: "Validator-5 (Mistral-Oracle)", vote: "CLAIM_SUSTAINED", reason: "Complete copy. Recommended slashing respondent stake pool with 10% premium back to validators." }
      ]
    },
    analysis: {
      originalityScore: 98,
      substantialSimilarity: 96,
      transformativeFactor: 2,
      summaryOfLaw: "Verbatim reproduction of source code structures violates both license constraints and standard intellectual property guidelines. The complete absence of transformation makes fair use inapplicable."
    },
    evidenceChecks: [
      { source: "GitHub Commit Attestation", status: "VERIFIED", details: "Attestation validated via decentralized developer registry on 2025-08-30." },
      { source: "AutoCode Registry Server", status: "VERIFIED", details: "Matched execution bytecode precisely." }
    ]
  }
];

export const NETWORK_METRICS = {
  totalDisputes: 238,
  activeValidators: 142,
  totalStakedGEN: 549300,
  averageConsensusConfidence: 91.2,
  resolvedRatio: "94.8%"
};
