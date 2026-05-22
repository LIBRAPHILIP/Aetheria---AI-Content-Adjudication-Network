/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  FileLock, 
  Terminal, 
  ChevronRight, 
  Cpu, 
  Zap, 
  Lock,
  Search, 
  Plus, 
  FileText, 
  Coins, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Users,
  Clock,
  Briefcase,
  Layers,
  HelpCircle,
  TrendingUp,
  RotateCw,
  Scale,
  Award,
  Info,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { 
  DISPUTE_TEMPLATES, 
  INITIAL_DISPUTES, 
  NETWORK_METRICS, 
  Dispute 
} from './data';

type View = 'overview' | 'submit' | 'arena' | 'specs' | 'monetization';

// Monthly timeline data of resolved disputes & transaction volume
const TREND_DATA = [
  { month: 'Jan', disputes: 12, volume: 18000 },
  { month: 'Feb', disputes: 18, volume: 24000 },
  { month: 'Mar', disputes: 32, volume: 45000 },
  { month: 'Apr', disputes: 58, volume: 82000 },
  { month: 'May (Est)', disputes: 118, volume: 145000 },
];

const TOP_VALIDATORS = [
  { 
    rank: 1, 
    name: "Gemini-Flash Consensus", 
    address: "0x982F...E31C", 
    resolved: 148, 
    earnings: 12450, 
    accuracy: "99.2%", 
    reputation: 99.8,
    uptime: "99.99%",
    stake: "45,000 GEN",
    reliability: "Exceptional"
  },
  { 
    rank: 2, 
    name: "Mistral-Oracle Node", 
    address: "0x741A...92D1", 
    resolved: 132, 
    earnings: 10890, 
    accuracy: "98.5%", 
    reputation: 98.7,
    uptime: "99.95%",
    stake: "38,500 GEN",
    reliability: "High"
  },
  { 
    rank: 3, 
    name: "Claude-Juror Pool", 
    address: "0xE5CA...74FB", 
    resolved: 129, 
    earnings: 10450, 
    accuracy: "98.1%", 
    reputation: 98.2,
    uptime: "99.88%",
    stake: "35,000 GEN",
    reliability: "High"
  },
  { 
    rank: 4, 
    name: "Llama-Adjudicator Node", 
    address: "0x3D4C...61B2", 
    resolved: 112, 
    earnings: 8250, 
    accuracy: "97.4%", 
    reputation: 96.9,
    uptime: "99.71%",
    stake: "28,000 GEN",
    reliability: "Stable"
  },
  { 
    rank: 5, 
    name: "Deepseek-Audit Instance", 
    address: "0x11BA...85AE", 
    resolved: 98, 
    earnings: 6840, 
    accuracy: "96.8%", 
    reputation: 95.8,
    uptime: "99.65%",
    stake: "22,500 GEN",
    reliability: "Stable"
  }
];

export default function App() {
  const [activeView, setActiveView] = useState<View>('overview');
  const [disputes, setDisputes] = useState<Dispute[]>(INITIAL_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(INITIAL_DISPUTES[0]);
  
  // Create New Dispute States
  const [newClaimant, setNewClaimant] = useState('');
  const [newRespondent, setNewRespondent] = useState('');
  const [newType, setNewType] = useState(DISPUTE_TEMPLATES[0].type);
  const [newDescription, setNewDescription] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newStaking, setNewStaking] = useState(500);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSteps, setSimSteps] = useState<string[]>([]);
  const [simProgress, setSimProgress] = useState(0);

  // x402 Modal Simulation States
  const [showX402Modal, setShowX402Modal] = useState(false);
  const [x402State, setX402State] = useState<'idle' | 'authorizing' | 'success' | 'failed'>('idle');
  const [x402Progress, setX402Progress] = useState(0);
  const [pendingDispute, setPendingDispute] = useState<Dispute | null>(null);
  const [x402SelectedProvider, setX402SelectedProvider] = useState<'web3' | 'agent-wallet' | 'gen-governance'>('web3');
  const [x402Logs, setX402Logs] = useState<string[]>([]);
  const [x402SimulateFailure, setX402SimulateFailure] = useState(false);

  // Monetization Interactive States
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Click-away listener to dismiss open validator tooltips
  useEffect(() => {
    const handleDocumentClick = () => {
      setActiveTooltipValidatorRank(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Enterprise API test runner states
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [apiTestLogs, setApiTestLogs] = useState<string[]>([]);

  const runApiTestCall = () => {
    if (apiTestStatus === 'running') return;
    setApiTestStatus('running');
    setApiTestLogs(["⏳ Initializing Enterprise API socket connection..."]);

    const logsList = [
      "🔗 Establishing secure SSL tunnel to api.aetheria.network...",
      "🛡️ Verifying API authentication signature (Secret Token Hash)...",
      "📦 Packaging request payload: { threshold: 85, mediaHash: 'ipfs://QmR6e4...' }",
      "⚡ Dispatching verification task to GenLayer Decentralized Ledger...",
      "🔍 Querying IPFS for matching fingerprints & timestamp markers...",
      "✅ Response Received: HTTP 200 OK after 1184ms",
      "📊 Originality Score: 94.2% [AUTHENTICATED]",
      "🔒 Notary Seal signed by 5/5 active validators."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < logsList.length) {
        setApiTestLogs(prev => [...prev, logsList[current]]);
        current++;
      } else {
        clearInterval(interval);
        setApiTestStatus('completed');
        showToast("API sandbox execution succeeded! HTTP 200 OK. Originality verified.", "success");
      }
    }, 300);
  };

  const [validatorSearchQuery, setValidatorSearchQuery] = useState('');
  const [activeTooltipValidatorRank, setActiveTooltipValidatorRank] = useState<number | null>(null);

  const [montyDisputes, setMontyDisputes] = useState(480);
  const [montyCertifications, setMontyCertifications] = useState(1800);
  const [montyEnterpriseWeb, setMontyEnterpriseWeb] = useState(35000);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeMonetizationTab, setActiveMonetizationTab] = useState<'revenue' | 'tiers' | 'enterprise' | 'ecosystem' | 'calculator'>('revenue');

  // Originality Certification States
  const [certTitle, setCertTitle] = useState('');
  const [certCreator, setCertCreator] = useState('');
  const [certType, setCertType] = useState('Image Prompt');
  const [certMintState, setCertMintState] = useState<'idle' | 'minting' | 'success'>('idle');
  const [certProgress, setCertProgress] = useState(0);
  const [certLogs, setCertLogs] = useState<string[]>([]);
  const [certifiedList, setCertifiedList] = useState<Array<{
    id: string;
    title: string;
    creator: string;
    type: string;
    timestamp: string;
    hash: string;
    block: number;
  }>>([
    {
      id: "AETH-CERT-019",
      title: "Solitary Neon Obelisk",
      creator: "yuyus",
      type: "Image Prompt",
      timestamp: "2026-05-20 18:42",
      hash: "ipfs://QmR6e4X9p3fWn2v...7g",
      block: 104859
    }
  ]);

  const handleMintCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle || !certCreator) return;

    setCertMintState('minting');
    setCertProgress(0);
    setCertLogs(["🌐 Computing SHA-256 asset characteristics..."]);

    const steps = [
      "🔗 Securing IPFS peer routing tables...",
      "🪙 Verifying 15 GEN mint transaction on GenLayer...",
      "⚡ Transmitting payload to " + NETWORK_METRICS.activeValidators + " consensus validators...",
      "📜 Confirming ERC-8004 trustless metadata standard...",
      "🛡️ Cryptographic Aetheria Notary seal finalized!"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setCertLogs((prev) => [...prev, steps[currentStep]]);
        setCertProgress(Math.floor(((currentStep + 1) / (steps.length + 1)) * 100));
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Generate new certificate record
        const hashHex = "ipfs://Qm" + Math.random().toString(36).substring(2, 12).toUpperCase() + "..." + Math.random().toString(36).substring(2, 4).toUpperCase();
        const blockNum = Math.floor(Math.random() * 500000) + 120000;
        const certId = "AETH-CERT-" + (certifiedList.length + 20).toString().padStart(3, '0');
        
        const newCert = {
          id: certId,
          title: certTitle,
          creator: certCreator,
          type: certType,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          hash: hashHex,
          block: blockNum
        };

        setCertifiedList((prev) => [newCert, ...prev]);
        setCertProgress(100);
        setCertMintState('success');
      }
    }, 600);
  };

  // Launch secure x402 transaction sequencing
  const startX402AdjudicationPayment = () => {
    if (!pendingDispute) return;
    setX402State('authorizing');
    setX402Progress(0);
    setX402Logs(["🌐 Interfacing with GenLayer x402 Payment Gateway API..."]);

    const steps = [
      "🔐 Establishing secure connection via " + (
        x402SelectedProvider === 'web3' ? "Browser Wallet Proxy (Metamask/Rabby)" : 
        x402SelectedProvider === 'agent-wallet' ? "Aetheria Agent Autonomous Wallet" : 
        "GenLayer Core Signer Pool"
      ) + "...",
      "🔑 Authorizing cryptographic dispute registration signature...",
      "🪙 Verifying staked escrow balance check for " + pendingDispute.stakingAmount + " GEN + 15 GEN (Standard Network Fee)...",
      "⚖️ " + (x402SimulateFailure 
        ? "❌ FAILED: Insufficient GEN balance inside the selected agentic escrow pool." 
        : "🔒 Successfully allocated staking assets & locked in GenLayer Intelligent Contract vault."
      ),
      x402SimulateFailure 
        ? "⚠️ x402 Payment Required: Request terminated with error 402."
        : "📝 Injecting claim details & IPFS evidence hash into the protocol mempool...",
      x402SimulateFailure
        ? "❌ Reconcile failure logs generated. Ready for next attempt."
        : "✨ Consensus payment authorized! Escrow secured."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setX402Logs((prev) => [...prev, steps[currentStep]]);
        setX402Progress(Math.floor(((currentStep + 1) / steps.length) * 100));
        
        if (x402SimulateFailure && currentStep === 3) {
          // Failure injected
          setX402State('failed');
          clearInterval(interval);
        } else if (!x402SimulateFailure && currentStep === steps.length - 1) {
          // Success reached
          setX402State('success');
          clearInterval(interval);
          
          // Auto route to Adjudication Arena after a small beautiful delay
          setTimeout(() => {
            const updated = [pendingDispute, ...disputes];
            setDisputes(updated);
            setSelectedDispute(pendingDispute);

            // Clean Form
            setNewClaimant('');
            setNewRespondent('');
            setNewDescription('');
            setNewEvidence('');
            setNewStaking(500);

            // Hide Modal
            setShowX402Modal(false);
            setPendingDispute(null);
            setX402State('idle');

            // Route
            setActiveView('arena');
          }, 1800);
        }
        currentStep++;
      }
    }, 650);
  };

  // Navigation Setup
  const navigation = [
    { id: 'overview', name: 'Network Overview', icon: Activity },
    { id: 'submit', name: 'File New Dispute', icon: Plus },
    { id: 'arena', name: 'Adjudication Arena', icon: Scale },
    { id: 'specs', name: 'GenLayer Architecture', icon: Layers },
    { id: 'monetization', name: 'Monetization Model', icon: Coins },
  ];

  // Auto-scroll simulation progress logs
  useEffect(() => {
    if (isSimulating) {
      const steps = [
        "🌐 Connecting to GenLayer mainnet-sim routing engine...",
        "⚖️ Fetching active dispute consensus template...",
        "🔑 Validating staked GEN escrow allocations (ERC-20/x402 proxy)...",
        "📄 Compiling Intelligent Contract bytecodes & LLM sub-routines...",
        "🛰️ Broadcasting dispute natural language context to 5 diverse validator nodes...",
        "🔍 Invoking gl.nondet.web.request opcodes to extract prior art archive proofs...",
        "🤖 Validator-1 (Gemini-Flash): Parsing semantics vs substantial similarity factors...",
        "🤖 Validator-2 (Llama-Juror): Inspecting transformative work boundaries...",
        "🤖 Validator-3 (Claude-Juror): Calculating retroactive priority timestamps...",
        "🤖 Validator-4 (Deepseek-Audit): Computing economic substitution risk index...",
        "🤖 Validator-5 (Mistral-Oracle): Evaluating parody vs pure commercial copyright...",
        "📥 Collecting consensus votes within the Optimistic Democracy layer...",
        "✨ Quorum reached. Formulating final adjudicated resolution..."
      ];

      setSimSteps([]);
      setSimProgress(0);

      const interval = setInterval(() => {
        setSimProgress((prev) => {
          if (prev < steps.length) {
            setSimSteps((currentSteps) => [...currentSteps, steps[prev]]);
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 700);

      return () => clearInterval(interval);
    }
  }, [isSimulating]);

  // Handle active dispute submit
  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimant || !newRespondent || !newDescription || !newEvidence) {
      showToast("Please provide all required claim variables.", "error");
      return;
    }

    const created: Dispute = {
      id: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
      claimant: newClaimant,
      respondent: newRespondent,
      disputeType: newType,
      status: 'QUEUED',
      description: newDescription,
      evidence: newEvidence,
      stakingAmount: Number(newStaking),
      dateSubmitted: new Date().toISOString().split('T')[0]
    };

    setPendingDispute(created);
    setShowX402Modal(true);
    setX402State('idle');
    setX402Progress(0);
    setX402Logs([]);
  };

  // Perform Gemini full-stack API call to adjudicate
  const runConsensusSimulation = async (dispute: Dispute) => {
    setIsSimulating(true);
    try {
      const response = await fetch('/api/adjudicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimant: dispute.claimant,
          respondent: dispute.respondent,
          disputeType: dispute.disputeType,
          description: dispute.description,
          evidence: dispute.evidence,
          stakingAmount: dispute.stakingAmount
        })
      });

      if (!response.ok) {
        throw new Error('Adjudication response returned an error status.');
      }

      const result = await response.json();

      // Update local dispute with simulated verdict data
      const updatedDisputes = disputes.map((d) => {
        if (d.id === dispute.id) {
          return {
            ...d,
            status: 'RESOLVED' as const,
            verdict: result.verdict,
            confidence: result.confidence,
            votes: result.votesBreakdown,
            analysis: result.legalAnalysis,
            evidenceChecks: result.evidenceChecks
          };
        }
        return d;
      });

      setDisputes(updatedDisputes);
      
      // Update the active selection
      const activeMatch = updatedDisputes.find((d) => d.id === dispute.id);
      if (activeMatch) {
        setSelectedDispute(activeMatch);
      }

    } catch (error) {
      console.error(error);
      showToast("Verification could not be processed, reverting dispute status to queue.", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  // Export adjudication details, legal analyses, votes and scores to PDF
  const exportToPDF = (dispute: Dispute) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Clear markdown bold/italic/code block markers
      const cleanMarkdown = (text: string) => {
        return text
          .replace(/\*\*(.*?)\*\*/g, '$1') // bold
          .replace(/\*(.*?)\*/g, '$1')     // italic
          .replace(/`(.*?)`/g, '$1')       // inline code
          .replace(/#/g, '')               // headers
          .trim();
      };

      let currentY = 20;
      const margin = 20;
      const pageWidth = 210;
      const contentWidth = pageWidth - (margin * 2); // 170

      const checkPageOverflow = (neededHeight: number) => {
        if (currentY + neededHeight > 275) {
          doc.addPage();
          currentY = 20;
          // Soft decorative page header
          doc.setFontSize(8);
          doc.setFont("Helvetica", "italic");
          doc.setTextColor(148, 163, 184); // slate-400
          doc.text(`Case ID: ${dispute.id} | Aetheria Dispute Adjudication | Page ${doc.getNumberOfPages()}`, margin, 12);
          doc.setDrawColor(226, 232, 240); // slate-200
          doc.setLineWidth(0.2);
          doc.line(margin, 15, pageWidth - margin, 15);
          currentY = 22;
        }
      };

      // Primary header banner at top
      doc.setFillColor(15, 23, 42); // slate-900 (dark navy)
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Header branding text
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("AETHERIA", margin, 16);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225); // slate-300
      doc.text("DECENTRALIZED AI ORIGINALITY & ADJUDICATION PROTOCOL", margin, 22);

      doc.setFontSize(8);
      doc.setTextColor(129, 140, 248); // indigo-400
      doc.text("Official Ledger Proof & Multi-Agent Standard Record", margin, 27);

      // Custom layout divider line
      doc.setDrawColor(79, 70, 229); // indigo-600
      doc.setLineWidth(1.2);
      doc.line(margin, 32, pageWidth - margin, 32);

      currentY = 52;

      // Report Header Section
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text("OFFICIAL CASE ADJUDICATION REPORT", margin, currentY);
      currentY += 8;

      // Metadata Grid Information Block
      checkPageOverflow(36);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.25);
      doc.rect(margin, currentY, contentWidth, 32, 'FD');

      // Render grid elements
      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Case ID:", margin + 5, currentY + 7);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(dispute.id, margin + 25, currentY + 7);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Adjudication Date:", margin + 85, currentY + 7);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(dispute.dateSubmitted || "2026-05-22", margin + 118, currentY + 7);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Classification:", margin + 5, currentY + 15);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(dispute.disputeType, margin + 25, currentY + 15);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Lock Collateral:", margin + 85, currentY + 15);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${dispute.stakingAmount} GEN`, margin + 118, currentY + 15);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Status Ledger:", margin + 5, currentY + 23);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(dispute.status, margin + 25, currentY + 23);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Protocol Ver:", margin + 85, currentY + 23);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Aetheria-Core-v1.4", margin + 118, currentY + 23);

      currentY += 40;

      // Section I: Parties Included
      checkPageOverflow(24);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("I. DESIGNATED PARTIES", margin, currentY);
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.4);
      doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
      currentY += 8;

      doc.setFontSize(9);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("Claimant:", margin + 5, currentY);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(dispute.claimant, margin + 40, currentY);
      currentY += 6;

      doc.setFont("Helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("Respondent / Publisher:", margin + 5, currentY);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(dispute.respondent, margin + 40, currentY);
      currentY += 10;

      // Section II: Case Narrative Description
      const descLines = doc.splitTextToSize(dispute.description, contentWidth - 10);
      const narrativeBoxHeight = (descLines.length * 5) + 8;
      checkPageOverflow(narrativeBoxHeight + 16);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("II. DISPUTE NARRATIVE & ALLEGATION CONTEXT", margin, currentY);
      doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
      currentY += 8;

      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(margin, currentY, contentWidth, narrativeBoxHeight, 'F');

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      descLines.forEach((line: string) => {
        doc.text(line, margin + 5, currentY + 5.5);
        currentY += 5;
      });
      currentY += 12;

      // Section III: Creative Evidence
      const evLines = doc.splitTextToSize(dispute.evidence, contentWidth - 10);
      const evidenceBoxHeight = (evLines.length * 5) + 8;
      checkPageOverflow(evidenceBoxHeight + 16);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("III. SUBMITTED EVIDENCE & ASSET SIGNATURES", margin, currentY);
      doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
      currentY += 8;

      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, evidenceBoxHeight, 'F');

      doc.setFont("Courier", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229); // text-indigo
      evLines.forEach((line: string) => {
        doc.text(line, margin + 5, currentY + 5.5);
        currentY += 5;
      });
      currentY += 12;

      // Section IV: Core Adjudication Verdict Highlight Banner
      checkPageOverflow(32);
      const isSustained = dispute.verdict === 'CLAIM_SUSTAINED';
      const verdictBg = isSustained ? [209, 250, 229] : [254, 226, 226]; // light green : red
      const verdictBorder = isSustained ? [16, 185, 129] : [239, 68, 68];
      const verdictLabel = isSustained ? "CLAIM SUSTAINED (INFRINGEMENT DETECTED)" : "CLAIM DISMISSED (ORIGINAL/FAIR USE RECOGNIZED)";

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("IV. CONSENSUS RESOLUTION & SETTLE VERDICT", margin, currentY);
      doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
      currentY += 8;

      doc.setFillColor(verdictBg[0], verdictBg[1], verdictBg[2]);
      doc.setDrawColor(verdictBorder[0], verdictBorder[1], verdictBorder[2]);
      doc.rect(margin, currentY, contentWidth, 18, 'FD');

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(verdictBorder[0], verdictBorder[1], verdictBorder[2]);
      doc.text(verdictLabel, margin + 5, currentY + 6.5);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Consensus consensus rating of ${dispute.confidence}% validator certainty. Assets governed & settled by the Optimistic Ledger.`, margin + 5, currentY + 12.5);
      currentY += 26;

      // Section V: Originality Scores / Legal Criteria metrics
      if (dispute.analysis) {
        checkPageOverflow(46);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text("V. TECHNICAL ORIGINALITY METRICS", margin, currentY);
        doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
        currentY += 9;

        const drawMetricSegment = (label: string, score: number, rgb: number[]) => {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          doc.text(`${label}: ${score}%`, margin + 5, currentY + 4);
          
          doc.setFillColor(226, 232, 240); // slate-200
          doc.rect(margin + 75, currentY + 1.5, 80, 3, 'F');
          
          doc.setFillColor(rgb[0], rgb[1], rgb[2]);
          const fillWidth = (score / 100) * 80;
          doc.rect(margin + 75, currentY + 1.5, fillWidth, 3, 'F');
          currentY += 7.5;
        };

        drawMetricSegment("Expression Originality Index", dispute.analysis.originalityScore, [16, 185, 129]);
        drawMetricSegment("Substantial Similarity Ratio", dispute.analysis.substantialSimilarity, [79, 70, 229]);
        drawMetricSegment("Transformative Factor (Fair Use)", dispute.analysis.transformativeFactor, [245, 158, 11]);

        currentY += 7;

        // Legal Analysis block
        const lawCleaned = cleanMarkdown(dispute.analysis.summaryOfLaw);
        const legalLines = doc.splitTextToSize(lawCleaned, contentWidth - 10);
        const legalBoxHeight = (legalLines.length * 4.5) + 8;
        checkPageOverflow(legalBoxHeight + 16);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text("Legal Authority & Summary of Doctrine Reference:", margin, currentY);
        currentY += 5;

        doc.setFillColor(248, 250, 252);
        doc.rect(margin, currentY, contentWidth, legalBoxHeight, 'F');

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        legalLines.forEach((line: string) => {
          doc.text(line, margin + 5, currentY + 5.5);
          currentY += 4.5;
        });
        currentY += 12;
      }

      // Section VI: Validator Votes
      if (dispute.votes && dispute.votes.details && dispute.votes.details.length > 0) {
        checkPageOverflow(36);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text("VI. VALIDATOR QUORUM VOTES BREAKDOWN", margin, currentY);
        doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
        currentY += 8;

        dispute.votes.details.forEach((v) => {
          const voteLines = doc.splitTextToSize(`"${v.reason}"`, contentWidth - 15);
          const voteHeight = (voteLines.length * 4.5) + 12;
          checkPageOverflow(voteHeight + 4);

          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(241, 245, 249);
          doc.rect(margin, currentY, contentWidth, voteHeight, 'FD');

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(v.validator, margin + 5, currentY + 6);

          const isSust = v.vote === 'CLAIM_SUSTAINED';
          doc.setFillColor(isSust ? 209 : 254, isSust ? 250 : 226, isSust ? 229 : 226);
          doc.rect(margin + 130, currentY + 2.5, 35, 4.5, 'F');

          doc.setFontSize(7.5);
          doc.setTextColor(isSust ? 16 : 220, isSust ? 120 : 38, isSust ? 80 : 38);
          doc.text(isSust ? "VOTED: SUSTAIN" : "VOTED: DISMISS", margin + 134, currentY + 5.7);

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          let voteTextY = currentY + 11.5;
          voteLines.forEach((line: string) => {
            doc.text(line, margin + 5, voteTextY);
            voteTextY += 4.5;
          });

          currentY += voteHeight + 4;
        });
        currentY += 6;
      }

      // Section VII: Verification timelines
      if (dispute.evidenceChecks && dispute.evidenceChecks.length > 0) {
        checkPageOverflow(30);
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text("VII. CRON CHRONOLOGY PROOF MARKERS", margin, currentY);
        doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
        currentY += 8;

        dispute.evidenceChecks.forEach((chk) => {
          checkPageOverflow(14);
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(79, 70, 229);
          doc.text(`[${chk.status}] ${chk.source}`, margin + 5, currentY + 4);

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text(chk.details, margin + 5, currentY + 8);
          currentY += 12;
        });
        currentY += 6;
      }

      // Seal authentication signatures
      checkPageOverflow(30);
      currentY += 4;
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.6);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 6;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Official Consensus Ledger Authentication Seal", margin, currentY);
      
      doc.setFont("Courier", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`AETHERIA-PROOF-VERIFIED: ${dispute.id}-GENLAYER-CONSENSUS-VERIFIED-RECORD-SHA256HASH-OK`, margin, currentY + 4);

      // Save standard PDF
      const docPathName = `Aetheria_Adjudication_Report_${dispute.id}.pdf`;
      doc.save(docPathName);
      showToast(`Adjudication report PDF generated & downloaded successfully!`, "success");

    } catch (err) {
      console.error(err);
      showToast("Could not generate PDF report. Verification error.", "error");
    }
  };

  return (
    <div className="flex h-screen bg-[#060709] text-slate-100 font-sans antialiased overflow-hidden select-none relative">
      
      {/* Background modern tech grid & ambient glow elements */}
      <div className="absolute inset-0 bg-grid-cyber pointer-events-none opacity-45 z-0" />
      <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full ambient-glow-1 pointer-events-none opacity-50 blur-[120px] z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full ambient-glow-2 pointer-events-none opacity-40 blur-[130px] z-0" />
      <div className="absolute top-[35%] left-[30%] w-[35%] h-[35%] rounded-full ambient-glow-3 pointer-events-none opacity-25 blur-[110px] z-0" />

      {/* Visual Workspace Sidebar */}
      <aside className="w-80 border-r border-[#1E232F]/50 bg-[#0B0D13]/85 backdrop-blur-xl flex flex-col justify-between shrink-0 relative z-10">
        
        <div>
          {/* Header Title / Context branding */}
          <div className="p-6 border-b border-[#1E232F]/50 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <Scale className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-slate-900 bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="font-black text-md tracking-[0.25em] text-shimmer-effect leading-tight font-display">AETHERIA</h1>
              <p className="text-[9px] text-[#818EA3] font-bold uppercase tracking-[0.12em]">AI Content Adjudicator</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as View);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                    isActive 
                      ? "bg-gradient-to-r from-indigo-900/45 to-indigo-800/10 border border-indigo-700/30 text-indigo-300" 
                      : "text-slate-400 hover:text-white hover:bg-[#121622]/40 border border-transparent"
                  )}
                  id={`nav-link-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Global Network Metrics Footer Bar */}
        <div className="p-5 border-t border-[#1E232F]/50 bg-[#07090F]/80">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 leading-none">
              <span className="font-semibold uppercase tracking-wider">GEN Consensus Stake</span>
              <span className="font-mono text-indigo-400 text-sm font-bold">{NETWORK_METRICS.totalStakedGEN.toLocaleString()} GEN</span>
            </div>
            <div className="w-full bg-[#181D2A] h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full w-[82%]" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>{NETWORK_METRICS.activeValidators} Active Nodes</span>
              </span>
              <span className="font-mono">{NETWORK_METRICS.resolvedRatio} Resolved</span>
            </div>
          </div>
        </div>

      </aside>

      {/* Primary Dashboard Content Panel */}
      <main className="flex-1 bg-[#060709]/55 backdrop-blur-[3px] flex flex-col min-w-0 overflow-y-auto relative z-10">
        
        {/* View Transition Matrix */}
        <AnimatePresence mode="wait">
          
          {/* VIEW: OVERVIEW */}
          {activeView === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 space-y-8"
              id="view-overview"
            >
              {/* Heading */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">Consensus Dashboard</h2>
                  <p className="text-sm text-slate-400 font-medium">Verified intelligence overview of disputes, active templates, and AI originality audits.</p>
                </div>
                <div className="flex items-center gap-3 bg-[#0B0D13] px-4 py-2 rounded-xl border border-[#1E232F]/60">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Confidence</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{NETWORK_METRICS.averageConsensusConfidence}%</span>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
              </div>

              {/* Statistical Bento Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatMetric label="Adjudicated Disputes" value={NETWORK_METRICS.totalDisputes.toString()} desc="Resolved cases" icon={CheckCircle2} color="indigo" />
                <StatMetric label="Escrowed Stake Limit" value={`${(NETWORK_METRICS.totalStakedGEN / 1000).toFixed(1)}k GEN`} desc="Total locked liquidity" icon={Coins} color="emerald" />
                <StatMetric label="Validator Quorums" value={`${NETWORK_METRICS.activeValidators} Nodes`} desc="Cross-validated sets" icon={Users} color="pink" />
                <StatMetric label="Resolvability Rate" value={NETWORK_METRICS.resolvedRatio} desc="Fast-track consensus ratio" icon={ShieldCheck} color="amber" />
              </div>

              {/* Main Content Layout Block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active and Resolved Claims List */}
                <div className="lg:col-span-2 bg-[#0B0D13]/65 backdrop-blur-md border border-[#1E232F]/45 rounded-2xl p-6 space-y-6 shadow-xl hover:border-indigo-500/15 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      Dispute Case Log ({disputes.length})
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">Sort: Newest First</span>
                  </div>

                  <div className="space-y-3.5">
                    {disputes.map((disp) => {
                      const isSelected = selectedDispute?.id === disp.id;
                      return (
                        <div
                          key={disp.id}
                          onClick={() => {
                            setSelectedDispute(disp);
                            setActiveView('arena');
                          }}
                          className={cn(
                            "p-5 rounded-xl border transition-all duration-300 cursor-pointer hover:border-indigo-500/30 bg-[#07090E]/60 group",
                            isSelected 
                              ? "border-indigo-600/50 shadow-[0_0_20px_rgba(79,70,229,0.06)]" 
                              : "border-[#1E232F]/60"
                          )}
                          id={`dispute-card-${disp.id}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2.5 mb-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-wider">{disp.id}</span>
                              <h4 className="font-bold text-white text-md tracking-tight group-hover:text-indigo-300 transition-colors leading-tight">
                                {disp.claimant} <span className="text-slate-500 font-normal">vs</span> {disp.respondent}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap",
                                disp.status === 'RESOLVED' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                disp.status === 'UNDER_AUDIT' ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              )}>
                                {disp.status}
                              </span>
                              <span className="text-[11px] text-[#A0AEC0] font-mono bg-[#181D2A] px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                                <Coins className="w-3 h-3 text-indigo-400 inline mr-1" />
                                {disp.stakingAmount} GEN
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                            {disp.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-[#1E232F]/40 pt-3">
                            <div className="flex items-center gap-3">
                              <span className="font-medium bg-[#141A29] px-2 py-1 rounded text-indigo-400">{disp.disputeType}</span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-600" />
                                {disp.dateSubmitted}
                              </span>
                            </div>
                            <span className="text-indigo-400 font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                              View Audit
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Margin: Templates and Legal Guidance */}
                <div className="space-y-6">
                  <div className="bg-[#0B0D13]/65 backdrop-blur-md border border-[#1E232F]/45 rounded-2xl p-6 space-y-5 shadow-xl hover:border-emerald-500/15 transition-all duration-300">
                    <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Dispute Standard Blueprints
                    </h3>
                    <div className="space-y-4">
                      {DISPUTE_TEMPLATES.map((tmpl) => (
                        <div key={tmpl.type} className="space-y-1.5 border-b border-[#1E232F]/40 pb-3 last:border-b-0 last:pb-0">
                          <h4 className="text-xs font-bold text-white tracking-tight">{tmpl.type}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-normal">{tmpl.description}</p>
                          <div className="bg-[#07090F] p-2 rounded text-[10px] font-mono text-slate-500 border border-[#1E232F]/30 leading-normal">
                            <span className="text-indigo-400 font-bold">Evidence Required:</span> {tmpl.typicalEvidence}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
\t\t\t\t  
\t\t\t\t  {/* Top Validators Leadership Board */}
                  {/* Validator Search & Filter Bar */}
                  <div className="bg-[#0B0D13]/55 backdrop-blur-md border border-[#1E232F]/45 rounded-2xl p-4 flex items-center gap-3 relative shadow-md focus-within:border-indigo-500/30 transition-all duration-300">
                    <Search className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={validatorSearchQuery}
                      onChange={(e) => setValidatorSearchQuery(e.target.value)}
                      placeholder="Search validators by address or name..."
                      className="w-full bg-[#07090F]/70 border border-[#1E232F]/55 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-[11px] placeholder:text-slate-500 font-sans transition-all"
                    />
                    {validatorSearchQuery && (
                      <button
                        onClick={() => setValidatorSearchQuery('')}
                        className="text-[10px] text-slate-400 hover:text-white transition-colors uppercase font-bold tracking-wider shrink-0 font-sans"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="bg-[#0B0D13]/65 backdrop-blur-md border border-[#1E232F]/45 rounded-2xl p-6 space-y-5 shadow-xl hover:border-indigo-500/15 transition-all duration-300" id="top-validators-module">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#F59E0B]" />
                        Top Consensus Validators
                      </h3>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-black font-mono">Consensus Hub</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      The top 5 GenLayer nodes performing decentralized originality validation, sorted by resolved dispute outputs and accumulated consensus fees.
                    </p>

                    <div className="space-y-3">
                      {(() => {
                        const isValActive = (rank: number) => {
                          if (selectedDispute && selectedDispute.status === 'UNDER_AUDIT') {
                            return true;
                          }
                          if (isSimulating) {
                            if (simProgress === 4 || simProgress === 5 || simProgress === 11) {
                              return true;
                            }
                            if (rank === 1 && simProgress === 6) return true;
                            if (rank === 4 && simProgress === 7) return true;
                            if (rank === 3 && simProgress === 8) return true;
                            if (rank === 5 && simProgress === 9) return true;
                            if (rank === 2 && simProgress === 10) return true;
                          }
                          return false;
                        };

                        const filtered = TOP_VALIDATORS.filter(val => 
                          val.name.toLowerCase().includes(validatorSearchQuery.toLowerCase()) ||
                          val.address.toLowerCase().includes(validatorSearchQuery.toLowerCase())
                        );
                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-7 text-xs text-slate-500 border border-dashed border-[#1E232F]/30 rounded-xl leading-relaxed font-sans">
                              No consensus validators found matching<br />
                              <span className="text-indigo-400 font-mono mt-1 inline-block">"{validatorSearchQuery}"</span>
                            </div>
                          );
                        }
                        return filtered.map((val) => {
                          const isActive = isValActive(val.rank);
                          return (
                            <div 
                              key={val.rank}
                              className={cn(
                                "p-3 bg-[#07090E]/60 border rounded-xl flex items-center justify-between gap-3 transition-all group relative overflow-visible",
                                isActive 
                                  ? "active-border-pulse bg-indigo-950/25 scale-[1.01]" 
                                  : "border-[#1E232F]/50 hover:border-indigo-500/20"
                              )}
                            >
                              {/* Rank badge and Info */}
                              <div className="flex items-center gap-3 relative overflow-visible">
                                <div className="relative">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveTooltipValidatorRank(activeTooltipValidatorRank === val.rank ? null : val.rank);
                                    }}
                                    className={cn(
                                      "w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 relative transition-transform hover:scale-110 active:scale-95 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/50",
                                      isActive ? "bg-indigo-600/35 text-indigo-400 border border-indigo-500/50" :
                                      val.rank === 1 ? "bg-amber-400/10 text-amber-400 border border-amber-400/25 animate-pulse" :
                                      val.rank === 2 ? "bg-slate-300/10 text-slate-300 border border-slate-300/25" :
                                      val.rank === 3 ? "bg-amber-700/10 text-amber-600 border border-amber-700/25" :
                                      "bg-[#1A1F2D] text-slate-500 border border-transparent"
                                    )}
                                    title="Click to view consensus reputation"
                                  >
                                    {isActive ? (
                                      <span className="flex h-1.5 w-1.5 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                                      </span>
                                    ) : val.rank}
                                  </button>

                                  {/* Tooltip Content */}
                                  <AnimatePresence>
                                    {activeTooltipValidatorRank === val.rank && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-0 mt-2 z-50 w-64 bg-[#0D1017] border border-indigo-500/40 rounded-xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(99,102,241,0.15)] text-left"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="absolute top-2 right-2">
                                          <button 
                                            onClick={() => setActiveTooltipValidatorRank(null)}
                                            className="text-[9px] text-slate-400 hover:text-slate-200 transition-colors uppercase font-bold tracking-wider px-1 py-0.5 rounded"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                        <div className="space-y-2.5">
                                          <div>
                                            <span className="text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-black font-mono tracking-wider block w-fit mb-1">
                                              VALIDATOR #{val.rank} INFO
                                            </span>
                                            <h4 className="font-bold text-slate-100 text-xs tracking-tight">{val.name}</h4>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{val.address}</p>
                                          </div>
                                          
                                          <div className="border-t border-[#1E232F]/60 pt-2 space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="text-slate-500">Reputation Score</span>
                                              <span className="font-mono text-emerald-400 font-bold">{val.reputation}%</span>
                                            </div>
                                            {/* Progress bar for Reputation */}
                                            <div className="w-full bg-[#161B26] h-1 rounded-full overflow-hidden">
                                              <div 
                                                className="bg-emerald-500 h-full rounded-full"
                                                style={{ width: `${val.reputation}%` }}
                                              />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1E232F]/30 text-[9px] leading-tight">
                                              <div>
                                                <span className="text-slate-500 block text-[8px]">Active Stake</span>
                                                <span className="font-mono text-slate-300 font-medium">{val.stake}</span>
                                              </div>
                                              <div>
                                                <span className="text-slate-500 block text-[8px]">Node Uptime</span>
                                                <span className="font-mono text-slate-300 font-medium">{val.uptime}</span>
                                              </div>
                                              <div>
                                                <span className="text-slate-500 block text-[8px]">Total Cases</span>
                                                <span className="font-mono text-slate-300 font-medium">{val.resolved} Resolved</span>
                                              </div>
                                              <div>
                                                <span className="text-slate-500 block text-[8px]">Reliability Class</span>
                                                <span className="font-mono text-indigo-400 font-bold">{val.reliability}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                                <div className="space-y-0.5 text-left">
                                  <h4 className="font-bold text-slate-200 text-[11px] tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">
                                    {val.name}
                                  </h4>
                                  <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1.5">
                                    <span className="bg-[#11141D] px-1 py-0.2 rounded border border-[#1E232F]/40 text-indigo-400">{val.address}</span>
                                    <span>•</span>
                                    <span className="text-emerald-500 font-medium">Acc {val.accuracy}</span>
                                    {isActive && <span className="text-emerald-400 animate-pulse font-bold tracking-wider text-[8px] uppercase bg-emerald-500/10 px-1 py-0.2 rounded ml-1">Live Adjudicating</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Dispute counts & earnings metrics */}
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono font-bold text-slate-300 block">
                                  {val.resolved} Cases
                                </span>
                                <div className="text-[9.5px] text-emerald-400 font-mono font-bold flex items-center gap-0.5 justify-end">
                                  <Coins className="w-2.5 h-2.5 text-emerald-500 inline shrink-0" />
                                  <span>+{val.earnings.toLocaleString()} GEN</span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Originality Certification Card */}
                  <div className="bg-[#0B0D13]/65 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-xl hover:border-emerald-500/45 transition-all duration-350" id="originality-cert-module">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between animate-in slide-in-from-top duration-300">
                      <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                        Originality Certification
                      </h3>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-black font-mono">15 GEN</span>
                    </div>

                    {certMintState === 'idle' && (
                      <form onSubmit={handleMintCertificate} className="space-y-4 animate-in fade-in duration-300">
                        <p className="text-xs text-slate-400 leading-relaxed font-normal">
                          Notarize your generative or custom assets on-chain before publishing. Establishing a timestamped seal preempts future infringement claims.
                        </p>

                        <div className="space-y-3.5">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Art Title or Prompt Identity</label>
                            <input
                              type="text"
                              required
                              value={certTitle}
                              onChange={(e) => setCertTitle(e.target.value)}
                              placeholder="e.g. Obsidian Cathedral"
                              className="w-full bg-[#07090F] border border-[#1E232F] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Creator Wallet / ID</label>
                            <input
                              type="text"
                              required
                              value={certCreator}
                              onChange={(e) => setCertCreator(e.target.value)}
                              placeholder="e.g. yuyus, 0x58F3..."
                              className="w-full bg-[#07090F] border border-[#1E232F] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Asset Framework</label>
                            <div className="grid grid-cols-3 gap-1.5">
                              {['Image Prompt', 'Code/Script', 'Voice Audio'].map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setCertType(t)}
                                  className={cn(
                                    "py-1.5 rounded-lg border text-[10px] font-bold transition-all text-center",
                                    certType === t
                                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                      : "bg-[#07090F] border-[#1E232F] text-slate-400 hover:text-slate-300"
                                  )}
                                >
                                  {t.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 animate-pulse" /> Mint Aetheria Seal
                        </button>
                      </form>
                    )}

                    {certMintState === 'minting' && (
                      <div className="space-y-4 py-2 animate-in fade-in duration-300">
                        <div className="space-y-1 text-center">
                          <RotateCw className="w-7 h-7 text-emerald-400 animate-spin mx-auto mb-1.5" />
                          <h4 className="text-xs font-bold text-white tracking-tight">Constructing Cryptographic Seal...</h4>
                          <p className="text-[10px] text-slate-500">Dual-layer validation in progress</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono text-slate-500">
                            <span>REGISTRY PROGRESS</span>
                            <span>{certProgress}%</span>
                          </div>
                          <div className="w-full bg-[#161A25] h-1.5 rounded-full overflow-hidden border border-[#1E232F]/60">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300" style={{ width: `${certProgress}%` }} />
                          </div>
                        </div>

                        {/* Mini Logs Box */}
                        <div className="bg-[#05060A]/90 p-3 rounded-xl border border-[#1E232F]/50 font-mono text-[9.5px] text-slate-400 space-y-1.5 max-h-32 overflow-y-auto shadow-inner leading-relaxed">
                          {certLogs.map((log, index) => (
                            <div key={index} className={log && log.startsWith('🛡️') ? "text-emerald-400 font-bold" : "text-slate-350"}>
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {certMintState === 'success' && (
                      <div className="space-y-5 py-1 text-center animate-in zoom-in-95 duration-500">
                        {/* Beautiful Holographic Seal badge */}
                        <div className="relative w-fit mx-auto mb-1 flex items-center justify-center">
                          {/* Outer radiant particles */}
                          <div className="absolute inset-0 rounded-full bg-emerald-500/25 blur-xl animate-pulse scale-150" />
                          
                          {/* Main spinning emblem frame with borders */}
                          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#10B981] via-[#0D9488] to-[#6366F1] p-0.5 animate-gradient-spin">
                            <div className="w-full h-full rounded-full bg-[#080A10] flex flex-col items-center justify-center p-2 border border-black/80 relative overflow-hidden">
                              <ShieldCheck className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-bounce" />
                              <span className="text-[8px] font-mono font-bold tracking-widest text-[#10B981] mt-1">SEAL SECURED</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 leading-normal">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded inline-block">Registered Cert ID: {certifiedList[0]?.id}</span>
                          <h4 className="text-sm font-black text-white tracking-tight pt-1">{certifiedList[0]?.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">By <span className="font-bold text-white">{certifiedList[0]?.creator}</span> • Type: {certifiedList[0]?.type}</p>
                          <p className="text-[10px] text-indigo-400 font-mono mt-1 break-all bg-[#07090E] p-2 rounded-lg border border-[#1E232F]/60">Block #{certifiedList[0]?.block} • {certifiedList[0]?.hash}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCertTitle('');
                            setCertCreator('');
                            setCertMintState('idle');
                          }}
                          className="w-full py-2 bg-[#121622] hover:bg-[#1A2031] border border-[#1E232F] text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Mint Next Originality Seal
                        </button>
                      </div>
                    )}

                    {/* Verified Seals Vault Sub-list */}
                    {certifiedList.length > 0 && (
                      <div className="border-t border-[#1E232F]/45 pt-4.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Verified Seals Vault ({certifiedList.length})</span>
                          <span className="text-[9px] text-[#10B981] font-mono font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Ledger
                          </span>
                        </div>

                        <div className="space-y-2 max-h-44 overflow-y-auto divide-y divide-[#1E232F]/30 pr-1">
                          {certifiedList.map((cert) => (
                            <div key={cert.id} className="flex items-center justify-between text-xs pt-2.5 first:pt-0 first:border-t-0">
                              <div className="space-y-0.5 text-left">
                                <h5 className="font-bold text-slate-250 text-[11px] leading-tight flex items-center gap-1.5">
                                  {cert.title}
                                  <span className="text-[8.5px] font-normal text-slate-550">by {cert.creator}</span>
                                </h5>
                                <div className="text-[9.5px] text-slate-500 font-mono flex items-center gap-2 pt-0.5">
                                  <span className="text-indigo-400 font-semibold">{cert.id}</span>
                                  <span>Block {cert.block}</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono font-semibold bg-[#111624] px-1.5 py-0.5 border border-indigo-500/10 text-indigo-350 rounded">
                                {cert.type.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Volume Chart Block */}
                  <div className="bg-[#0B0D13]/75 backdrop-blur-md border border-[#1E232F]/45 rounded-2xl p-6 shadow-xl hover:border-[#312E81]/30 transition-all duration-300">
                    <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4 flex items-center gap-2 font-sans">
                      <TrendingUp className="w-4 h-4 text-pink-500 animate-pulse" />
                      Protocol Adoption Rate
                    </h3>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={TREND_DATA}>
                          <defs>
                            <linearGradient id="disputesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35}/>
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#161B28" vertical={false} opacity={0.5} />
                          <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#090D16', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#94a3b8' }} />
                          <Area type="monotone" dataKey="disputes" stroke="#818cf8" fill="url(#disputesGradient)" strokeWidth={2.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW: SUBMIT NEW CLAIM */}
          {activeView === 'submit' && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 max-w-4xl mx-auto"
              id="view-submit"
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">File an Originality Dispute</h2>
                  <p className="text-sm text-slate-400">Deploy a real-time Intelligent Contract to mediate your copyright, trademark, or AI attribution claim.</p>
                </div>

                <form onSubmit={handleCreateDispute} className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-8 space-y-6">
                  
                  {/* Two Column Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Claimant Agent Identity</label>
                      <input 
                        type="text"
                        value={newClaimant}
                        onChange={(e) => setNewClaimant(e.target.value)}
                        placeholder="e.g. CreatorName, Agent ID, or DAO alias"
                        className="w-full bg-[#07090F] border border-[#1E232F] rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
                        required
                        id="input-claimant"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Respondent / Alleged Infringer</label>
                      <input 
                        type="text"
                        value={newRespondent}
                        onChange={(e) => setNewRespondent(e.target.value)}
                        placeholder="e.g. SynthesizerNode, StudioName, or User key"
                        className="w-full bg-[#07090F] border border-[#1E232F] rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm"
                        required
                        id="input-respondent"
                      />
                    </div>
                  </div>

                  {/* Template Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Consensus Template Blueprint</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DISPUTE_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.type}
                          type="button"
                          onClick={() => setNewType(tmpl.type)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            newType === tmpl.type 
                              ? "bg-indigo-900/20 border-indigo-500/50 text-indigo-400" 
                              : "bg-[#07090E] border-[#1E232F] text-slate-400 hover:text-slate-300"
                          )}
                        >
                          <h4 className="text-xs font-bold mb-1 leading-tight">{tmpl.type}</h4>
                          <span className="text-[9px] text-slate-500 font-medium leading-normal line-clamp-2">Configure logic</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description Context */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Dispute Technical Narrative</label>
                    <textarea 
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Explain with context exactly where the similarity overlaps occur, when you first registered your creation, and why this violates your IP parameters or fair use rules..."
                      className="w-full h-32 bg-[#07090F] border border-[#1E232F] rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm resize-none"
                      required
                      id="input-description"
                    />
                  </div>

                  {/* Evidence Input URL or Code */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Disputed Evidence Links or Generation Prompts</label>
                    <input 
                      type="text"
                      value={newEvidence}
                      onChange={(e) => setNewEvidence(e.target.value)}
                      placeholder="e.g. IPFS hash, spectrogram audio link, diffusion seed outputs, comparison web pages"
                      className="w-full bg-[#07090F] border border-[#1E232F] rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-sm font-mono"
                      required
                      id="input-evidence"
                    />
                  </div>

                  {/* GEN Token Escrow Selector */}
                  <div className="space-y-3 bg-[#07090F] p-5 rounded-2xl border border-[#1E232F]/70">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-indigo-400" />
                          Escrow Target Staking Pool
                        </span>
                        <p className="text-[10px] text-slate-500">Must stake GEN to align validation incentives. Winners are fully refunded plus bonuses.</p>
                      </div>
                      <span className="font-mono text-indigo-400 text-lg font-bold">{newStaking} GEN</span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="5000" 
                      step="50"
                      value={newStaking} 
                      onChange={(e) => setNewStaking(Number(e.target.value))}
                      className="w-full h-1 bg-[#1A1E2D] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#1E232F]/40">
                    <button
                      type="button"
                      onClick={() => setActiveView('overview')}
                      className="px-5 py-2.5 rounded-xl border border-transparent hover:border-[#1E232F] text-slate-400 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all flex items-center gap-2"
                      id="btn-submit-dispute"
                    >
                      <Layers className="w-4 h-4" />
                      Commit Dispute to GenLayer
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          )}

          {/* VIEW: ADJUDICATION ARENA (SIMULATOR) */}
          {activeView === 'arena' && (
            <motion.div
              key="arena"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 space-y-8"
              id="view-arena"
            >
              {/* Heading */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">Adjudication Arena</h2>
                  <p className="text-sm text-slate-400">Trigger standard quorum checks or non-deterministic internet trace calculations through real-time Gemini validators.</p>
                </div>
                
                {/* Loader status */}
                {isSimulating && (
                  <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs text-indigo-400 font-bold animate-pulse">
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Consensus Consensus Underway...
                  </div>
                )}
              </div>

              {/* Main Arena Simulator Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Case Selector Left Menu */}
                <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-5 space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Active Claims Pipeline</span>
                  
                  <div className="space-y-2.5">
                    {disputes.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDispute(d)}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                          selectedDispute?.id === d.id 
                            ? "bg-[#181D2A] border-indigo-500/40 text-white shadow-md" 
                            : "bg-[#07090F]/30 border-transparent text-slate-400 hover:text-slate-300"
                        )}
                      >
                        <div className="space-y-1 pr-2">
                          <span className="text-[9px] font-mono text-indigo-400 font-medium">{d.id}</span>
                          <h4 className="text-xs font-bold truncate max-w-[140px] leading-tight">{d.claimant} vs {d.respondent}</h4>
                          <span className="text-[10px] text-slate-500 block">{d.disputeType}</span>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[8px] font-bold uppercase",
                          d.status === 'RESOLVED' ? "bg-emerald-500/15 text-emerald-400" :
                          "bg-amber-500/15 text-amber-400"
                        )}>
                          {d.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audit Content and Execution Controls */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedDispute ? (
                    <div className="space-y-6">
                      
                      {/* Dynamic Audit Execution Panel */}
                      <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl overflow-hidden shadow-xl">
                        <div className="bg-[#101421] p-6 border-b border-[#1E232F]/50 flex flex-wrap items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-mono text-indigo-400 font-bold">{selectedDispute.id} | Status: {selectedDispute.status}</span>
                            <h3 className="text-lg font-extrabold text-white tracking-tight">{selectedDispute.claimant} vs {selectedDispute.respondent}</h3>
                          </div>

                          {selectedDispute.status !== 'RESOLVED' ? (
                            <button
                              onClick={() => runConsensusSimulation(selectedDispute)}
                              disabled={isSimulating}
                              className="px-6 py-2.5 bg-[#4F46E5] hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02] flex items-center gap-1.5"
                              id="btn-hex-audit"
                            >
                              <Zap className="w-4 h-4" />
                              Invoke Optimistic Adjudication
                            </button>
                          ) : (
                            <button
                              onClick={() => exportToPDF(selectedDispute)}
                              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-900/35 hover:scale-[1.02] flex items-center gap-1.5 border border-emerald-500/10"
                              id="btn-export-pdf"
                            >
                              <Download className="w-4 h-4" />
                              Export PDF Report
                            </button>
                          )}
                        </div>

                        {/* Dispute Detail Body */}
                        <div className="p-6 space-y-5">
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case Classification</h4>
                            <span className="text-sm text-indigo-300 font-medium bg-[#141A29] px-3 py-1 rounded inline-block">
                              {selectedDispute.disputeType}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dispute Narrative Context</h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-normal bg-[#07090F] p-4 rounded-xl border border-[#1E232F]/40">
                              {selectedDispute.description}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submitted Creative Evidence</h4>
                            <div className="bg-[#07090F] p-4 rounded-xl border border-[#1E232F]/40 flex items-center justify-between gap-4">
                              <span className="font-mono text-xs text-slate-400 truncate max-w-lg leading-none select-text">
                                {selectedDispute.evidence}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded tracking-widest flex items-center gap-1">
                                <Globe className="w-3.5 h-3.5" /> Web Proof
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SIMULATION ACTIVE: Render Terminal Progress */}
                      {isSimulating && (
                        <div className="bg-[#040509] rounded-2xl border border-indigo-500/30 p-6 space-y-4 shadow-[0_0_25px_rgba(79,70,229,0.06)]">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">GenLayer Node Console</span>
                          </div>
                          
                          <div className="h-44 overflow-y-auto font-mono text-xs text-slate-400 space-y-2.5 scrollbar-thin scrollbar-thumb-indigo-900 leading-relaxed">
                            {simSteps.map((step, idx) => (
                              <div key={idx} className="animate-in fade-in slide-in-from-left-4 duration-300">
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* COMPLETED ADJUDICATION REVIEW OUTCOME DISPLAY */}
                      {selectedDispute.status === 'RESOLVED' && (
                        <div className="space-y-6">
                          
                          {/* Core Metrics Box */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            <div className="bg-[#0B0D13] p-5 rounded-2xl border border-emerald-500/20 shadow-md">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Consensus Verdict
                              </span>
                              <div className={cn(
                                "text-lg font-black mt-2 tracking-tight whitespace-nowrap leading-none",
                                selectedDispute.verdict === 'CLAIM_SUSTAINED' ? "text-emerald-400" : "text-rose-400"
                              )}>
                                {selectedDispute.verdict === 'CLAIM_SUSTAINED' ? "CLAIM SUSTAINED" : "CLAIM DISMISSED"}
                              </div>
                            </div>

                            <div className="bg-[#0B0D13] p-5 rounded-2xl border border-[#1E232F]/60">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <TrendingUp className="w-4 h-4 text-indigo-400" /> Quorum Certainty
                              </span>
                              <div className="text-2xl font-black mt-2 text-white font-mono leading-none">
                                {selectedDispute.confidence}%
                              </div>
                            </div>

                            <div className="bg-[#0B0D13] p-5 rounded-2xl border border-[#1E232F]/60">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                                <Coins className="w-4 h-4 text-pink-400" /> Escrow Allocation
                              </span>
                              <div className="text-sm font-black mt-2 text-indigo-300 font-mono leading-none">
                                x402 Reallocated
                              </div>
                            </div>

                          </div>

                          {/* Banner to Export PDF Report */}
                          <div className="bg-gradient-to-r from-indigo-950/40 via-indigo-900/15 to-transparent border border-indigo-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg hover:border-indigo-400/35 transition-all duration-300">
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 leading-none font-sans">
                                <FileText className="w-4 h-4 text-indigo-400 animate-pulse" />
                                Official Settlement Certificate & Report
                              </h4>
                              <p className="text-xs text-slate-400 leading-normal">
                                Download a cryptographically signed legal summary including originality indexes, quorum breakdown, and evidence timestamps.
                              </p>
                            </div>
                            <button
                              onClick={() => exportToPDF(selectedDispute)}
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0 self-start sm:self-auto font-sans"
                            >
                              <Download className="w-4 h-4" />
                              Export Adjudication Document
                            </button>
                          </div>

                          {/* 5-Validator Democractic Votes Break Down */}
                          {selectedDispute.votes && (
                            <Section label="Validator Quorum Vote Distribution">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedDispute.votes.details.map((v, i) => (
                                  <div key={i} className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-xl p-4 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-white tracking-tight">{v.validator}</span>
                                      <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-bold font-mono",
                                        v.vote === 'CLAIM_SUSTAINED' ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                      )}>
                                        {v.vote === 'CLAIM_SUSTAINED' ? "SUSTAIN" : "DISMISS"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-normal font-normal">
                                      {v.reason}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </Section>
                          )}

                          {/* Substantial Similarity Indicators & Fair Use legal write-up */}
                          {selectedDispute.analysis && (
                            <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-6 space-y-6">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Substantial Similarity & Legal Doctrines</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <SimilarityProgress label="Expression Originality" score={selectedDispute.analysis.originalityScore} color="emerald" />
                                <SimilarityProgress label="Substantial Similarity" score={selectedDispute.analysis.substantialSimilarity} color="indigo" />
                                <SimilarityProgress label="Transformative Nature" score={selectedDispute.analysis.transformativeFactor} color="amber" />
                              </div>

                              <div className="border-t border-[#1E232F]/40 pt-4 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed select-text">
                                <Markdown>{selectedDispute.analysis.summaryOfLaw}</Markdown>
                              </div>
                            </div>
                          )}

                          {/* Non-Deterministic Web Checks Link */}
                          {selectedDispute.evidenceChecks && (
                            <Section label="Nondeterministic Internet Verification Timeline">
                              <div className="space-y-3.5">
                                {selectedDispute.evidenceChecks.map((chk, i) => (
                                  <div key={i} className="flex items-center justify-between p-4 bg-[#0B0D13] border border-[#1E232F]/60 rounded-xl">
                                    <div className="space-y-1">
                                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <Globe className="w-3.5 h-3.5 text-indigo-400" />
                                        {chk.source}
                                      </span>
                                      <p className="text-xs text-slate-400 leading-normal">{chk.details}</p>
                                    </div>
                                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded leading-none">
                                      {chk.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </Section>
                          )}

                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center border border-[#1E232F]/40 bg-[#0B0D13]/50 rounded-2xl">
                      <div className="text-center">
                        <Scale className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-md">Select or create a copyright dispute case to trigger validation.</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* VIEW: ARCHITECTURE & SPECS */}
          {activeView === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 max-w-4xl mx-auto space-y-8"
              id="view-specs"
            >
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">Aetheria & GenLayer Protocol Stack</h2>
                <p className="text-sm text-slate-400 font-medium">Detailed integration roadmap describing how Natural Language Adjudication runs over GenLayer.</p>
              </div>

              {/* Specs Bento Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-md">Intelligent Contract Logic</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-normal">
                    Traditional blockchains represent deterministic VMs (EVM, SVM) which cannot evaluate language. Aetheria encapsulates dispute mediation rules directly within GenLayer Python-based contracts. Contracts programmatically route incoming claim logs directly to LLM validator sub-routines.
                  </p>
                </div>

                <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-md">Optimistic Democracy</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-normal">
                    Subjective parameters are resolved through democratic voting pools. Multiple independent validator nodes evaluate details of originality and parody simultaneously. Majority vote dictates the final consensus state transition, aligning decentralised authority protocols with subjective legal theories.
                  </p>
                </div>

                <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 mb-2">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-md">Nondeterministic Internet Verification</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-normal">
                    Using GenLayer's built-in <code className="text-pink-450 font-mono text-xs">gl.nondet.web.request</code> and <code className="text-pink-450 font-mono text-xs">gl.nondet.web.render</code> opcodes, nodes pull historical archive registry timestamps, public content hashes, or creative briefs on-chain to trace creation histories.
                  </p>
                </div>

                <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-md">ERC-8004 Agent Identity & x402 Payments</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-normal">
                    Designed to fully operate in an autonomous economy. AI content agents directly submit disputes via ERC-8004 trustless signatures, and cover contract costs/mediation fees via x402 Payment Required interfaces.
                  </p>
                </div>

              </div>

              {/* Protocol Enhancement Proposal Specs */}
              <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Aetherian Protocol Enhancements (GEP Specs)
                </h3>
                
                <div className="space-y-4 font-normal">
                  <div className="p-4 bg-[#07090F] border border-[#1E232F]/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">GEP-001: Hierarchical Intellectual Property Validation Pipeline</h4>
                      <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2.0 py-0.5 rounded uppercase font-bold">PROPOSED</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Defines a two-tiered settlement framework. Small dispute claims utilize fast execution models like Gemini Flash to minimize fees. Heavy intellectual property content automatically triggers wider quorum reviews (up to 21 validators) to guarantee integrity.
                    </p>
                  </div>

                  <div className="p-4 bg-[#07090F] border border-[#1E232F]/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">GEP-002: Vector Embedding Originality Memory Cache</h4>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-500/10 px-2.0 py-0.5 rounded uppercase font-bold">DRAFT</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Establishes standard vector memory embeddings across GenLayer nodes. Validators cache previous originality and attribution verdicts, allowing immediate semantic comparison logic when new clone art patterns emerge in circulation.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* VIEW: MONETIZATION STRATEGY */}
          {activeView === 'monetization' && (
            <motion.div
              key="monetization"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 max-w-6xl mx-auto space-y-8"
              id="view-monetization"
            >
              {/* Heading */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest border border-indigo-500/20">Aetheria Economics</span>
                    <span className="text-[10px] text-slate-500 font-medium">Author: yuyus</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">Monetization & Business Matrix</h2>
                  <p className="text-sm text-slate-400 font-medium">Capturing value across the entire AI content lifecycle—from creation certificates to platform APIs and decentralized validator networks.</p>
                </div>
                
                {/* Selector Tabs */}
                <div className="flex items-center gap-1.5 bg-[#0B0D13] p-1.5 rounded-xl border border-[#1E232F]/50 shrink-0">
                  {(['revenue', 'tiers', 'enterprise', 'ecosystem', 'calculator'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveMonetizationTab(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                        activeMonetizationTab === tab
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-slate-300"
                      )}
                    >
                      {tab === 'tiers' ? 'SaaS Tiers' : tab === 'ecosystem' ? 'Protocol Sink' : tab === 'enterprise' ? 'B2B API' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* VIEW: TAB - CORE REVENUE STREAMS */}
              {activeMonetizationTab === 'revenue' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-gradient-to-r from-indigo-900/10 to-transparent p-6 rounded-2xl border border-indigo-500/15">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Coins className="w-4 h-4 text-indigo-400" />
                      Capturing Value in the Agentic Economy
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed font-normal">
                      Aetheria’s monetization strategy is designed to capture value across the entire generative media lifecycle. 
                      By leveraging GenLayer’s unique adjudication capabilities, we supply services that traditional systems cannot support, 
                      providing clear pricing signals and on-chain guarantees that scale with AI agent-to-agent interactions.
                    </p>
                  </div>

                  {/* Pricing Matrix Table */}
                  <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-[#1E232F]/50">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Service Tier & Pricing Vectors</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="border-b border-[#1E232F]/50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider bg-[#07090F]">
                            <th className="p-4 pl-6">Revenue Stream</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Target Audience</th>
                            <th className="p-4 pr-6 text-right">Pricing Model</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1E232F]/30">
                          <tr className="hover:bg-[#121622]/25 transition-colors">
                            <td className="p-4 pl-6 font-bold text-white flex items-center gap-2">
                              <Scale className="w-4 h-4 text-indigo-400" />
                              Adjudication Fees
                            </td>
                            <td className="p-4 text-slate-400 font-normal">Fees paid for filing and processing a subjective content dispute.</td>
                            <td className="p-4 text-slate-450 font-medium font-mono">Individual Creators, Agents</td>
                            <td className="p-4 pr-6 text-right font-mono text-indigo-400 font-bold">Per-dispute (GEN tokens)</td>
                          </tr>
                          <tr className="hover:bg-[#121622]/25 transition-colors">
                            <td className="p-4 pl-6 font-bold text-white flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              Originality Certification
                            </td>
                            <td className="p-4 text-slate-400 font-normal">Issuing cryptographic on-chain "Seals of Originality" for validated pieces.</td>
                            <td className="p-4 text-slate-450 font-medium font-mono">Artists, Writers, Agencies</td>
                            <td className="p-4 pr-6 text-right font-mono text-emerald-400 font-bold">Per-certificate / Monthly</td>
                          </tr>
                          <tr className="hover:bg-[#121622]/25 transition-colors">
                            <td className="p-4 pl-6 font-bold text-white flex items-center gap-2">
                              <Globe className="w-4 h-4 text-pink-400" />
                              Enterprise API Access
                            </td>
                            <td className="p-4 text-slate-400 font-normal">Automated plagiarism, similarity trace and content dispute appeals APIs.</td>
                            <td className="p-4 text-slate-450 font-medium font-mono">Social Media, Stock Sites</td>
                            <td className="p-4 pr-6 text-right font-mono text-pink-400 font-bold">Tiered API Use / Monthly</td>
                          </tr>
                          <tr className="hover:bg-[#121622]/25 transition-colors">
                            <td className="p-4 pl-6 font-bold text-white flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-400" />
                              Premium Adjudication
                            </td>
                            <td className="p-4 text-slate-400 font-normal">Fastest verification times or specific high-powered core validator sets.</td>
                            <td className="p-4 text-slate-450 font-medium font-mono">High-value IP Holders</td>
                            <td className="p-4 pr-6 text-right font-mono text-amber-400 font-bold">Consensus Surcharge</td>
                          </tr>
                          <tr className="hover:bg-[#121622]/25 transition-colors">
                            <td className="p-4 pl-6 font-bold text-white flex items-center gap-2">
                              <Activity className="w-4 h-4 text-indigo-400" />
                              Data & Analytics
                            </td>
                            <td className="p-4 text-slate-400 font-normal">Proprietary insights into AI-model infringement patterns & training trends.</td>
                            <td className="p-4 text-slate-450 font-medium font-mono">Researchers, Law Firms</td>
                            <td className="p-4 pr-6 text-right font-mono text-indigo-400 font-bold">Subscription Access</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: TAB - SUBSCRIPTION TIERS */}
              {activeMonetizationTab === 'tiers' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Monthly/Yearly Trigger */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-extrabold text-white">SaaS Plans for Digital Creators</h3>
                      <p className="text-xs text-slate-400">Choose custom scales to protect continuous algorithmic outputs automatically.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-[#0B0D13] border border-[#1E232F]/50 p-1.5 rounded-xl">
                      <button
                        onClick={() => setBillingCycle('monthly')}
                        className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all", billingCycle === 'monthly' ? "bg-indigo-600/20 border border-indigo-500/25 text-indigo-400" : "text-slate-400")}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setBillingCycle('yearly')}
                        className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1", billingCycle === 'yearly' ? "bg-indigo-600/20 border border-indigo-500/25 text-indigo-400" : "text-slate-400")}
                      >
                        Yearly <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1 py-0.5 rounded leading-none">Save 20%</span>
                      </button>
                    </div>
                  </div>

                  {/* Plan Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Plan Card: Free */}
                    <div className="bg-[#0B0D13] border border-[#1E232F]/50 rounded-2xl p-6.5 space-y-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white">Free Plan</h4>
                          <p className="text-xs text-slate-500">Perfect for casual creators needing basic originality checkouts.</p>
                        </div>
                        <div className="text-3xl font-black text-white">$0 <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">forever</span></div>
                        <div className="h-px bg-[#1E232F]/50" />
                        <ul className="space-y-2.5 text-xs text-slate-400">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Basic dispute filing (pay-per-use)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Limited web evidence index
                          </li>
                          <li className="flex items-center gap-2 hover:line-through text-slate-600">
                            <XCircle className="w-4 h-4 text-slate-600 shrink-0" /> Included originality certificates
                          </li>
                          <li className="flex items-center gap-2 hover:line-through text-slate-600">
                            <XCircle className="w-4 h-4 text-slate-600 shrink-0" /> Automatic plagiarism alerts
                          </li>
                        </ul>
                      </div>
                      <button 
                        onClick={() => showToast("Free tier is active by default.", "info")}
                        className="w-full py-2.5 rounded-xl border border-[#1E232F]/80 text-xs font-bold hover:bg-[#121622] transition-colors mt-6"
                      >
                        Active Free Core
                      </button>
                    </div>

                    {/* Plan Card: Pro */}
                    <div className="bg-[#0B0D13] border border-indigo-500/45 rounded-2xl p-6.5 space-y-6 flex flex-col justify-between hover:border-indigo-400 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.05)] relative overflow-hidden">
                      <div className="absolute top-2 right-2 bg-indigo-500/10 border border-indigo-500/30 text-[9px] font-bold text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">
                        Popular
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white">Pro Studio</h4>
                          <p className="text-xs text-slate-500">For active artists, designers, and small digital media brands.</p>
                        </div>
                        <div className="text-3xl font-black text-white font-mono">
                          ${billingCycle === 'monthly' ? '29' : '23'} <span className="text-xs text-slate-500 font-bold uppercase">/ month</span>
                        </div>
                        <div className="h-px bg-[#1E232F]/50" />
                        <ul className="space-y-2.5 text-xs text-slate-400">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Includes 50 "Originality Seeds" / mo
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Priority consensus queue allocation
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> 1-click evidence archive download
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Continuous plagiarism monitoring
                          </li>
                        </ul>
                      </div>
                      <button 
                        onClick={() => showToast("Pro Studio checkout triggered over simulated gateway.", "success")}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold shadow-md hover:scale-[1.01] transition-all mt-6"
                      >
                        Upgrade to Pro
                      </button>
                    </div>

                    {/* Plan Card: Agency */}
                    <div className="bg-[#0B0D13] border border-[#1E232F]/50 rounded-2xl p-6.5 space-y-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white">Agency & DAO</h4>
                          <p className="text-xs text-slate-500">Built for algorithmic studios & large-scale AI agent swarms.</p>
                        </div>
                        <div className="text-3xl font-black text-white font-mono">
                          ${billingCycle === 'monthly' ? '199' : '159'} <span className="text-xs text-slate-500 font-bold uppercase">/ month</span>
                        </div>
                        <div className="h-px bg-[#1E232F]/50" />
                        <ul className="space-y-2.5 text-xs text-slate-400">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Bulk originality certification rules
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> API workflow keys (unlimited)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Dedicated Custom disputes templates
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Multi-agent wallet authorization
                          </li>
                        </ul>
                      </div>
                      <button 
                        onClick={() => showToast("Connected agent-wallet to coordinate recurring licensing contracts.", "success")}
                        className="w-full py-2.5 rounded-xl border border-indigo-500/30 text-[11px] text-indigo-400 font-bold hover:bg-[#121622] hover:border-indigo-500/50 transition-colors mt-6"
                      >
                        License Agency Matrix
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* VIEW: TAB - B2B ENTERPRISE API */}
              {activeMonetizationTab === 'enterprise' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* B2B Explanations */}
                    <div className="space-y-5">
                      <h3 className="text-md font-extrabold text-white">White-Label API & Enterprise Integrations</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Large distribution channels can plug Aetheria’s adjudication or originality auditing engine directly into their native digital interfaces via a white-label REST gateway. This saves significant overhead costs for internal moderation teams.
                      </p>

                      <div className="space-y-4 pt-3">
                        <div className="p-4 bg-[#07090E] border border-[#1E232F] rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">MODERATION APPEALS</span>
                          <h4 className="text-sm font-bold text-white mt-1">Automated Social Media Appeals</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Centralized social networks outsource subjective content takedown complaints. Users contest automated censorship directly using GenLayer validators.
                          </p>
                        </div>

                        <div className="p-4 bg-[#07090E] border border-[#1E232F] rounded-xl space-y-2">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ORIGINALITY LOCK</span>
                          <h4 className="text-sm font-bold text-white mt-1">Marketplace Pre-Verification</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Websites selling visual assets, templates or synthesized music models use Aetheria as the final notary checkpoint prior to listing on marketplace registries.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Live Sandbox Console Simulation */}
                    <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#1E232F]/50 pb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Enterprise API Test Runner</span>
                        <span className="text-[10.5px] font-mono text-emerald-400">SSL SECURITY ENABLED</span>
                      </div>

                      {apiTestStatus === 'idle' ? (
                        <div className="bg-[#07090F] p-4 rounded-xl border border-[#1E232F]/60 space-y-2.5 font-mono text-xs select-text">
                          <div className="text-slate-600">// Initiate automated model plagiarism check</div>
                          <div className="text-slate-100">
                            <span className="text-indigo-400">POST</span> https://api.aetheria.network/v1/adjudicate
                          </div>
                          <div className="text-slate-500">{`{`}</div>
                          <div className="text-slate-100 pl-4">
                            <span className="text-pink-400">"originalityThreshold"</span>: <span className="text-emerald-400">85</span>,
                          </div>
                          <div className="text-slate-100 pl-4 font-normal">
                            <span className="text-pink-400">"mediaHash"</span>: <span className="text-rose-400">"ipfs://QmR6e4..."</span>,
                          </div>
                          <div className="text-slate-100 pl-4 font-normal">
                            <span className="text-pink-400">"verifyWebTimestamps"</span>: <span className="text-indigo-400">true</span>
                          </div>
                          <div className="text-slate-500">{`}`}</div>
                        </div>
                      ) : (
                        <div className="bg-[#05070B] p-4 rounded-xl border border-[#1E232F]/60 space-y-2 font-mono text-[11px] h-48 overflow-y-auto select-text scrollbar-thin">
                          <div className="text-indigo-400 font-bold mb-1">// API TEST RESPONSE GATEWAY</div>
                          {apiTestLogs.map((log, index) => (
                            <div 
                              key={index} 
                              className={cn(
                                "flex items-start gap-1 p-0.5",
                                log && (log.startsWith('✅') || log.startsWith('📊')) ? "text-emerald-400" :
                                log && log.startsWith('⏳') ? "text-slate-400 animate-pulse" :
                                log && log.startsWith('🔒') ? "text-indigo-300 font-bold" :
                                "text-slate-300"
                              )}
                            >
                              <span className="text-slate-600 inline shrink-0 select-none">$&gt;</span>
                              <span className="leading-5">{log}</span>
                            </div>
                          ))}
                          {apiTestStatus === 'running' && (
                            <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 pl-4.5 animate-pulse">
                              <RotateCw className="w-3 h-3 animate-spin" /> Querying validator subnets...
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={apiTestStatus === 'completed' ? () => setApiTestStatus('idle') : runApiTestCall}
                        disabled={apiTestStatus === 'running'}
                        className={cn(
                          "w-full py-2.5 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md",
                          apiTestStatus === 'running' ? "bg-[#141A29] text-indigo-500 cursor-not-allowed border border-[#1E232F]" :
                          apiTestStatus === 'completed' ? "bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400" :
                          "bg-indigo-650 hover:bg-indigo-650/80 text-white shadow-indigo-600/20"
                        )}
                      >
                        {apiTestStatus === 'running' ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" /> Executing Plagiarism Query...
                          </>
                        ) : apiTestStatus === 'completed' ? (
                          <>
                            <Terminal className="w-4 h-4" /> Reset API Playground
                          </>
                        ) : (
                          <>
                            <Terminal className="w-4 h-4" /> Send Test Check API Call
                          </>
                        )}
                      </button>

                      <div className="text-[11px] text-slate-500 text-center leading-normal pt-1 flex items-center justify-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Bulk Pricing: flat rate of $0.50 per automated check
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* VIEW: TAB - PROTOCOL ECONOMY & ECOSYSTEM */}
              {activeMonetizationTab === 'ecosystem' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="bg-[#0B0D13] p-6 rounded-2xl border border-indigo-500/20 space-y-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">Validator Incentives</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        A massive 75% of every basic Adjudication and Appeal Fee is immediately distributed directly to the consensus majority validators, ensuring long-term node alignment and high-integrity answers.
                      </p>
                    </div>

                    <div className="bg-[#0B0D13] p-6 rounded-2xl border border-emerald-500/20 space-y-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Plus className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">DAO Treasury Accrual</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        A persistent 10% fee on every simulated transaction is redirected straight to the Aetheria DAO Treasury, funding core developers, marketing programs and open research initiatives.
                      </p>
                    </div>

                    <div className="bg-[#0B0D13] p-6 rounded-2xl border border-pink-500/20 space-y-3">
                      <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                        <Coins className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-tight">Constant Token Sink</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-normal">
                        Since all platform fees and certifications must occur strictly inside GEN tokens, Aetheria acts as an absolute utility sink, removing circulating supply as demand for AI resolution expands.
                      </p>
                    </div>

                  </div>

                  {/* Additional Notary SEAL info */}
                  <div className="bg-[#0B0D13] border border-[#1E232F]/60 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded tracking-wider uppercase">NOTARY LOCKUP</span>
                        <h4 className="text-sm font-bold text-white">Originality Token Seal</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Creators can submit digital masterpieces prior to publishing to claim an <strong>On-Chain Seal of Originality</strong>. This immutable metadata proof asserts the chronological timestamp of your training prompt factors to defend against downstream derivative imitators.
                      </p>
                    </div>
                    <div className="border border-indigo-500/30 bg-[#070911]/80 rounded-xl px-5 py-4 shrink-0 text-center w-52 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Seal Mint Cost</span>
                      <span className="text-lg font-mono font-black text-indigo-400 block">15 GEN</span>
                      <span className="text-[9.5px] text-slate-500 font-normal block leading-tight">(~ $2.25 USD)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: TAB - INTERACTIVE CALCULATOR */}
              {activeMonetizationTab === 'calculator' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="bg-[#0B0D13] border border-[#1E232F]/60 rounded-2xl p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ecosystem Revenue & Treasury Projection Model</h3>
                      <p className="text-xs text-slate-400 mt-1">Adjust platform utilization parameters to trace projected cash flows and GEN token ecosystem locks.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      {/* Sliders Area */}
                      <div className="space-y-5.5">
                        
                        {/* Slider 1: Disputes */}
                        <div className="space-y-2 bg-[#07090F] p-4.5 rounded-xl border border-[#1E232F]/60">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                              <Scale className="w-4 h-4 text-indigo-400" />
                              Monthly Disputes Resolved
                            </label>
                            <span className="font-mono text-white text-sm font-bold">{montyDisputes} cases / mo</span>
                          </div>
                          <input 
                            type="range"
                            min="50"
                            max="5000"
                            step="50"
                            value={montyDisputes} 
                            onChange={(e) => setMontyDisputes(Number(e.target.value))}
                            className="w-full h-1 bg-[#1A1E2D] rounded-lg appearance-none cursor-pointer accent-indigo-550" 
                          />
                        </div>

                        {/* Slider 2: Certificates */}
                        <div className="space-y-2 bg-[#07090F] p-4.5 rounded-xl border border-[#1E232F]/60">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              Originality Certificates Issued
                            </label>
                            <span className="font-mono text-white text-sm font-bold">{montyCertifications} seals / mo</span>
                          </div>
                          <input 
                            type="range"
                            min="100"
                            max="25000"
                            step="200"
                            value={montyCertifications} 
                            onChange={(e) => setMontyCertifications(Number(e.target.value))}
                            className="w-full h-1 bg-[#1A1E2D] rounded-lg appearance-none cursor-pointer accent-emerald-550" 
                          />
                        </div>

                        {/* Slider 3: API checks */}
                        <div className="space-y-2 bg-[#07090F] p-4.5 rounded-xl border border-[#1E232F]/60">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                              <Globe className="w-4 h-4 text-pink-400" />
                              Enterprise API Inquiries
                            </label>
                            <span className="font-mono text-white text-sm font-bold">{montyEnterpriseWeb.toLocaleString()} checks / mo</span>
                          </div>
                          <input 
                            type="range"
                            min="1000"
                            max="200000"
                            step="5000"
                            value={montyEnterpriseWeb} 
                            onChange={(e) => setMontyEnterpriseWeb(Number(e.target.value))}
                            className="w-full h-1 bg-[#1A1E2D] rounded-lg appearance-none cursor-pointer accent-pink-550" 
                          />
                        </div>

                      </div>

                      {/* Display Outputs Panel */}
                      <div className="bg-[#07090E]/80 border border-[#1E232F]/80 rounded-2xl p-6 space-y-5 shadow-inner">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold block">Estimated Monthly Allocations</span>

                        <div className="space-y-3.5 divide-y divide-[#1E232F]/40 text-sm">
                          
                          {/* Row 1: Adjudication GEN */}
                          <div className="flex items-center justify-between pt-0">
                            <span className="text-slate-400 font-medium">Adjudication Fees:</span>
                            <span className="font-mono text-white font-bold text-right">
                              {(montyDisputes * 50).toLocaleString()} GEN <span className="text-[10px] text-slate-500">(~ ${(montyDisputes * 50 * 0.15).toLocaleString()} USD)</span>
                            </span>
                          </div>

                          {/* Row 2: Certificates GEN */}
                          <div className="flex items-center justify-between pt-3.5">
                            <span className="text-slate-400 font-medium font-sans">Certificates Revenue:</span>
                            <span className="font-mono text-white font-bold text-right">
                              {(montyCertifications * 15).toLocaleString()} GEN <span className="text-[10px] text-slate-500">(~ ${(montyCertifications * 15 * 0.15).toLocaleString()} USD)</span>
                            </span>
                          </div>

                          {/* Row 3: API checks in USD */}
                          <div className="flex items-center justify-between pt-3.5">
                            <span className="text-slate-400 font-medium font-sans">Enterprise API Income:</span>
                            <span className="font-mono text-white font-bold text-right text-emerald-400">
                              ${(montyEnterpriseWeb * 0.40).toLocaleString()} USD <span className="text-[10px] text-slate-500">(at $0.40 / call)</span>
                            </span>
                          </div>

                          {/* Row 4: DAO Treasury Growth */}
                          <div className="flex items-center justify-between pt-3.5 border-t border-indigo-500/30">
                            <span className="text-slate-400 font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide">
                              <Plus className="w-3.5 h-3.5 text-indigo-400" />
                              DAO Treasury Gross (10%):
                            </span>
                            <span className="font-mono text-indigo-300 font-extrabold text-right">
                              {(( (montyDisputes * 50) + (montyCertifications * 15) ) * 0.10).toLocaleString()} GEN <span className="text-[10px] text-slate-500 font-normal">/ mo</span>
                            </span>
                          </div>

                          {/* Row 5: Total Token Lock Lockups */}
                          <div className="flex items-center justify-between pt-3.5">
                            <span className="text-slate-400 font-bold flex items-center gap-1.5 text-xs uppercase tracking-wide">
                              <Coins className="w-3.5 h-3.5 text-emerald-400" />
                              Total GEN Token Flow Sink:
                            </span>
                            <span className="font-mono text-emerald-400 font-extrabold text-right">
                              {( (montyDisputes * 50) + (montyCertifications * 15) ).toLocaleString()} GEN <span className="text-[10px] text-slate-500 font-normal">/ mo</span>
                            </span>
                          </div>

                        </div>

                        {/* Interactive trigger */}
                        <button
                          onClick={() => showToast(`Consensus economic scenario cached! Token lockup velocity: ${(( (montyDisputes * 50) + (montyCertifications * 15) )).toLocaleString()} GEN.`, "success")}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/30"
                        >
                          Commit Scenario parameters to Protocol sandbox
                        </button>

                      </div>

                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* x402 Trustless Escrow Payment Simulation Modal */}
      <AnimatePresence>
        {showX402Modal && pendingDispute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
            id="x402-modal-container"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#0B0D13] border border-[#1E232F] text-white max-w-lg w-full rounded-2xl p-6.5 shadow-2xl relative overflow-hidden"
              id="x402-modal-card"
            >
              {/* Decorative Gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 via-indigo-500 to-emerald-500" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-pink-500/10 text-pink-400 p-1.5 rounded-lg border border-pink-500/25">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500 block">HTTP STATUS CODE</span>
                    <h3 className="text-sm font-black text-rose-400 font-mono tracking-tight leading-none flex items-center gap-1.5">
                      402: PAYMENT REQUIRED
                    </h3>
                  </div>
                </div>
                {x402State === 'idle' && (
                  <button
                    onClick={() => {
                      setShowX402Modal(false);
                      setPendingDispute(null);
                    }}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Subheading text info */}
              <p className="text-xs text-slate-400 leading-relaxed font-normal mb-5 bg-[#141824]/60 p-3 rounded-xl border border-[#1E232F]/50">
                Deploying this dispute requires a trustless validation escrow to prevent spam on the GenLayer virtual ledger. Stake inputs must align with x402 standards.
              </p>

              {/* HTTP Request details console box */}
              <div className="bg-[#07090F] p-3 rounded-xl border border-[#1E232F]/80 font-mono text-[10.5px] text-slate-500 space-y-1 select-text mb-5">
                <div><span className="text-indigo-400">HTTP/1.1</span> <span className="text-pink-400">402 Payment Required</span></div>
                <div><span className="text-slate-500">Location:</span> <span className="text-emerald-400">genlayer://x402-escrow-contract-v1</span></div>
                <div><span className="text-slate-500">X-Aetheria-Filing-ID:</span> <span className="text-indigo-400">{pendingDispute.id}</span></div>
              </div>

              {/* Staking Fee details card matrix */}
              <div className="space-y-4 mb-6">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Filing Fee Specification</span>

                <div className="bg-[#07090E]/60 border border-[#1E232F]/50 rounded-xl p-4 divide-y divide-[#1E232F]/40 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-3 pt-0">
                    <span className="text-slate-400">Claim Details:</span>
                    <span className="text-slate-200 font-bold font-mono">
                      {pendingDispute.claimant} vs {pendingDispute.respondent}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-3">
                    <span className="text-slate-400">Base Staking Escrow:</span>
                    <span className="text-white font-mono font-bold">
                      {pendingDispute.stakingAmount} GEN
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-3">
                    <span className="text-slate-400">Aetheria Network Service Fee:</span>
                    <span className="text-indigo-400 font-mono font-semibold">
                      15 GEN
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 font-semibold text-white">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-400" />
                      Total Staking & Gas Fee:
                    </span>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-black text-md">
                        {pendingDispute.stakingAmount + 15} GEN
                      </span>
                      <span className="text-[10px] text-slate-500 block font-normal">
                        (~ ${((pendingDispute.stakingAmount + 15) * 0.15).toFixed(2)} USD)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive payment channel selection */}
              {x402State === 'idle' && (
                <div className="space-y-3.5 mb-6">
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Select Payment Channel</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setX402SelectedProvider('web3')}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20",
                        x402SelectedProvider === 'web3'
                          ? "bg-indigo-900/10 border-indigo-500/50 text-indigo-400"
                          : "bg-[#07090F] border-[#1E232F] text-slate-400 hover:text-slate-300"
                      )}
                    >
                      <Globe className="w-4 h-4 shrink-0" />
                      <div>
                        <h4 className="text-[10.5px] font-bold leading-tight">Web3 Wallet</h4>
                        <span className="text-[9px] text-slate-500">Browser Proxy</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setX402SelectedProvider('agent-wallet')}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20",
                        x402SelectedProvider === 'agent-wallet'
                          ? "bg-indigo-900/10 border-indigo-500/50 text-indigo-400"
                          : "bg-[#07090F] border-[#1E232F] text-slate-400 hover:text-slate-300"
                      )}
                    >
                      <Terminal className="w-4 h-4 shrink-0" />
                      <div>
                        <h4 className="text-[10.5px] font-bold leading-tight">Agent Wallet</h4>
                        <span className="text-[9px] text-slate-500">Autonomous API</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setX402SelectedProvider('gen-governance')}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-20",
                        x402SelectedProvider === 'gen-governance'
                          ? "bg-indigo-900/10 border-indigo-500/50 text-indigo-400"
                          : "bg-[#07090F] border-[#1E232F] text-slate-400 hover:text-slate-300"
                      )}
                    >
                      <Cpu className="w-4 h-4 shrink-0" />
                      <div>
                        <h4 className="text-[10.5px] font-bold leading-tight">Gen Core Pool</h4>
                        <span className="text-[9px] text-slate-500">Direct Governance</span>
                      </div>
                    </button>
                  </div>

                  {/* Failure Injection Slider */}
                  <div className="flex items-center justify-between p-3.5 bg-[#07090D] border border-red-500/15 rounded-xl">
                    <div className="space-y-0.5">
                      <span className="text-[10.5px] font-bold text-slate-300 block">Inject Simulation Failure</span>
                      <p className="text-[9px] text-slate-500 font-normal">Test standard insufficient funds / reject x402 handling state.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={x402SimulateFailure}
                        onChange={(e) => setX402SimulateFailure(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-[#1E232F] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 peer-checked:after:bg-white" />
                    </label>
                  </div>
                </div>
              )}

              {/* Authorization active logs pipeline state */}
              {x402State !== 'idle' && (
                <div className="space-y-4.5 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500 block">Active Escrow Log Pipeline</span>
                    <span className="font-mono text-[10px] text-indigo-400 font-bold">{x402Progress}% Completed</span>
                  </div>

                  <div className="bg-[#05060A] border border-[#1E232F]/50 rounded-xl p-4.5 space-y-2.5 font-mono text-xs max-h-48 overflow-y-auto shadow-inner leading-relaxed">
                    {x402Logs.map((log, index) => (
                      <div
                        key={index}
                        className={cn(
                          "text-[11px]",
                          log && log.startsWith('❌') ? "text-red-400" :
                          log && log.startsWith('⚠️') ? "text-amber-400" :
                          log && (log.startsWith('✨') || log.startsWith('✅')) ? "text-emerald-400 font-bold" :
                          "text-slate-300"
                        )}
                      >
                        {log}
                      </div>
                    ))}
                    {x402State === 'authorizing' && (
                      <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-semibold animate-pulse">
                        <RotateCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                        Awaiting micro-escrow block confirmations...
                      </div>
                    )}
                  </div>

                  <div className="w-full bg-[#181D2A] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        x402State === 'failed' ? "bg-red-500" :
                        x402State === 'success' ? "bg-emerald-400" :
                        "bg-indigo-500"
                      )} 
                      style={{ width: `${x402Progress}%` }} 
                    />
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-3.5 border-t border-[#1E232F]/40 animate-duration-300 animate-in fade-in">
                {x402State === 'idle' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowX402Modal(false);
                        setPendingDispute(null);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-transparent hover:border-[#1E232F] text-slate-400 text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={startX402AdjudicationPayment}
                      className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      <Lock className="w-3.5 h-3.5 animate-pulse" /> Confirm & Authorize Escrow
                    </button>
                  </>
                )}

                {x402State === 'failed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setX402State('idle');
                        setX402Progress(0);
                        setX402Logs([]);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-[#1E232F] text-slate-300 text-xs font-bold transition-all hover:bg-[#141A29]"
                    >
                      Retry Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowX402Modal(false);
                        setPendingDispute(null);
                        setX402State('idle');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-red-650/40 hover:bg-red-600/60 border border-red-500/30 text-white text-xs font-bold transition-all"
                    >
                      Dismiss Dispute
                    </button>
                  </>
                )}

                {x402State === 'success' && (
                  <div className="text-xs text-emerald-400 font-extrabold flex items-center gap-2 animate-pulse pr-2">
                    <CheckCircle2 className="w-4 h-4 animate-bounce" /> Locking blocks... forwarding to Adjudication logs.
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Absolute Floating Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4.5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm font-sans",
              toast.type === 'success' ? "bg-emerald-950/95 border-emerald-500/35 text-emerald-300 shadow-emerald-500/5" :
              toast.type === 'error' ? "bg-red-950/95 border-red-500/35 text-red-300 shadow-red-500/5" :
              "bg-[#090D1A]/95 border-indigo-500/35 text-indigo-300 shadow-indigo-500/5"
            )}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
            <span className="text-xs font-semibold leading-relaxed tracking-wide">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Helper Component: Numerical Stat Card
function StatMetric({ label, value, desc, icon: Icon, color }: { label: string; value: string; desc: string; icon: any; color: 'indigo' | 'emerald' | 'amber' | 'pink' }) {
  const colorMap = {
    indigo: 'from-indigo-600/15 via-indigo-600/5 to-transparent text-indigo-400 border-indigo-500/20 hover:border-indigo-400/40 shadow-indigo-950/20',
    emerald: 'from-emerald-600/15 via-emerald-600/5 to-transparent text-emerald-400 border-emerald-500/20 hover:border-emerald-400/40 shadow-emerald-950/20',
    pink: 'from-pink-600/15 via-pink-600/5 to-transparent text-pink-400 border-pink-500/20 hover:border-pink-400/40 shadow-pink-950/20',
    amber: 'from-amber-600/15 via-amber-600/5 to-transparent text-amber-400 border-amber-500/20 hover:border-amber-400/40 shadow-amber-950/20',
  };

  const glowMap = {
    indigo: 'rgba(99,102,241,0.06)',
    emerald: 'rgba(16,185,129,0.06)',
    pink: 'rgba(236,72,153,0.06)',
    amber: 'rgba(245,158,11,0.06)',
  };

  return (
    <div 
      className={cn(
        "bg-gradient-to-br px-5 py-5 border rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 relative overflow-hidden backdrop-blur-md shadow-lg group", 
        colorMap[color]
      )}
      style={{
        boxShadow: `0 4px 20px rgba(0,0,0,0.45), 0 0 15px ${glowMap[color]}`
      }}
    >
      {/* Background Interactive Radial Ring */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 bg-current blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">{label}</span>
        <div className="p-1.5 bg-[#0F111A]/80 rounded-lg border border-white/5 group-hover:border-white/10 transition-all duration-300">
          <Icon className="w-4 h-4 leading-none" />
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight text-white mb-1.5 leading-none font-sans">
        {value}
      </div>
      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-none">
        {desc}
      </p>
    </div>
  );
}

// Simple Helper Component: Substantial Similarity Score Progress Display
function SimilarityProgress({ label, score, color }: { label: string; score: number; color: 'emerald' | 'indigo' | 'amber' }) {
  const barColors = {
    emerald: 'bg-emerald-400',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-400'
  };

  return (
    <div className="space-y-2 bg-[#07090F] p-4 rounded-xl border border-[#1E232F]/40">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{label}</span>
        <span className="font-mono text-white font-bold">{score}%</span>
      </div>
      <div className="w-full bg-[#181D2A] h-2 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-300", barColors[color])} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// Simple Section grouping component
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</h3>
        <div className="h-px flex-1 bg-[#1E232F]/60" />
      </div>
      {children}
    </div>
  );
}

