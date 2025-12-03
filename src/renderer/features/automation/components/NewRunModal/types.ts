import type { ProductConfiguration } from "@/shared/types/product";
import type { Lead } from "@/shared/types/lead";

export interface NewRunModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preSelectedLeadIds?: string[];
}

export interface UseNewRunModalOptions {
  isOpen: boolean;
  preSelectedLeadIds?: string[];
  onSuccess?: () => void;
  onClose: () => void;
}

export interface NewRunModalState {
  products: ProductConfiguration[];
  leads: Lead[];
  loadingProducts: boolean;
  loadingLeads: boolean;
  selectedFlows: Set<string>;
  selectedLeads: Set<string>;
  searchQuery: string;
  submitting: boolean;
}
