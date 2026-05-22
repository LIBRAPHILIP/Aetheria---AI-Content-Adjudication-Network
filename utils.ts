/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Performance metrics for Intelligent Contracts
 */
export interface PerformanceMetric {
  timestamp: string;
  latency: number; // in ms
  tokens: number;
  tps: number;
  successRate: number;
}

/**
 * Security Vulnerability
 */
export interface Vulnerability {
  id: string;
  name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  remediation: string;
}

/**
 * Protocol Specification
 */
export interface ProtocolSpec {
  id: string;
  title: string;
  status: 'DRAFT' | 'PROPOSED' | 'IMPLEMENTED';
  content: string;
}
