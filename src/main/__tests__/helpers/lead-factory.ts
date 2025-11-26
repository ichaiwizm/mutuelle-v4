import { randomUUID } from 'node:crypto';
import type { Lead } from '@/shared/types/lead';

/**
 * Default subscriber data for test leads
 */
const DEFAULT_SUBSCRIBER = {
  civilite: 'M.',
  nom: 'Test',
  prenom: 'User',
  dateNaissance: '10/08/1980',
  profession: 'Salarie',
  regimeSocial: 'Salarie (ou retraite)',
  codePostal: '75001',
  ville: 'PARIS',
  email: 'test@example.com',
  telephone: '06.12.34.56.78',
  nombreEnfants: 0,
};

/**
 * Default project data for test leads
 */
const DEFAULT_PROJECT = {
  dateEffet: '01/01/2026',
  actuellementAssure: false,
  source: 'manual' as const,
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface CreateLeadOptions {
  id?: string;
  subscriber?: DeepPartial<typeof DEFAULT_SUBSCRIBER>;
  project?: DeepPartial<typeof DEFAULT_PROJECT> & {
    conjoint?: {
      dateNaissance?: string;
      profession?: string;
      regimeSocial?: string;
    };
  };
  children?: Array<{ dateNaissance: string }>;
}

/**
 * Create a test lead with sensible defaults
 * @param options - Override any default values
 * @returns A Lead object ready for testing
 */
export function createTestLead(options: CreateLeadOptions = {}): Lead {
  return {
    id: options.id ?? randomUUID(),
    subscriber: {
      ...DEFAULT_SUBSCRIBER,
      ...options.subscriber,
    },
    project: {
      ...DEFAULT_PROJECT,
      ...options.project,
    },
    children: options.children,
  };
}

/**
 * Preset factories for common test scenarios
 */
export const presets = {
  /**
   * A solo lead (no conjoint, no children)
   */
  solo: (overrides: CreateLeadOptions = {}) =>
    createTestLead({
      ...overrides,
      subscriber: {
        nom: 'Solo',
        prenom: 'Jean',
        ...overrides.subscriber,
      },
    }),

  /**
   * A TNS (independent worker) lead - eligible for Alptis
   */
  tns: (overrides: CreateLeadOptions = {}) =>
    createTestLead({
      ...overrides,
      subscriber: {
        nom: 'Independant',
        prenom: 'Pierre',
        profession: 'Chef d\'entreprise',
        regimeSocial: 'TNS : regime des independants',
        ...overrides.subscriber,
      },
    }),

  /**
   * A senior lead (60+ years old) - eligible for Alptis
   */
  senior: (overrides: CreateLeadOptions = {}) =>
    createTestLead({
      ...overrides,
      subscriber: {
        nom: 'Senior',
        prenom: 'Paul',
        dateNaissance: '10/08/1960',
        profession: 'Retraite',
        ...overrides.subscriber,
      },
    }),

  /**
   * A lead with a conjoint
   */
  withConjoint: (
    conjointData: Partial<{
      dateNaissance: string;
      profession: string;
      regimeSocial: string;
    }> = {},
    overrides: CreateLeadOptions = {}
  ) =>
    createTestLead({
      ...overrides,
      subscriber: {
        nom: 'Couple',
        prenom: 'Marie',
        civilite: 'Mme',
        ...overrides.subscriber,
      },
      project: {
        ...overrides.project,
        conjoint: {
          dateNaissance: '15/06/1982',
          profession: 'Salarie',
          regimeSocial: 'Salarie (ou retraite)',
          ...conjointData,
        },
      },
    }),

  /**
   * A lead with children
   */
  withChildren: (
    childrenDates: string[] = ['01/01/2015', '15/06/2018'],
    overrides: CreateLeadOptions = {}
  ) =>
    createTestLead({
      ...overrides,
      subscriber: {
        nom: 'Parent',
        prenom: 'Sophie',
        civilite: 'Mme',
        nombreEnfants: childrenDates.length,
        ...overrides.subscriber,
      },
      children: childrenDates.map((dateNaissance) => ({ dateNaissance })),
    }),

  /**
   * A complete family lead (conjoint + children)
   */
  family: (overrides: CreateLeadOptions = {}) =>
    createTestLead({
      ...overrides,
      subscriber: {
        nom: 'Famille',
        prenom: 'Thomas',
        nombreEnfants: 2,
        ...overrides.subscriber,
      },
      project: {
        ...overrides.project,
        conjoint: {
          dateNaissance: '20/03/1985',
          profession: 'Salarie',
          regimeSocial: 'Salarie (ou retraite)',
        },
      },
      children: [{ dateNaissance: '10/05/2012' }, { dateNaissance: '22/09/2016' }],
    }),
};
