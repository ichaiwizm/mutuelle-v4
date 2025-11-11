export type LeadCandidate = { subscriber: Record<string, any>; source?: string };

export type Mail = { id: string; subject: string; from: string; date: number; text: string };

export interface Detector { detect(m: Mail): LeadCandidate[] }

import { GenericFormDetector } from './genericForm';

export const Detectors: Detector[] = [GenericFormDetector];

