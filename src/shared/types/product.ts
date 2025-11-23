export type ProductStatusValue = "active" | "inactive" | "beta" | "deprecated";

export type ProductStatus = {
  platform: string;
  product: string;
  status: ProductStatusValue;
  updatedAt: number;
  updatedBy?: string;
};

// Product categories (insurance types)
export type ProductCategory = "sante" | "prevoyance" | "retraite" | "vie";

// Step types in a flow
export type StepType = "auth" | "navigation" | "form-fill" | "validation" | "submission";

// Definition of a single step in a flow
export type StepDefinition = {
  id: string;                    // Unique step identifier (e.g., "auth", "form-section-1")
  name: string;                  // Human-readable name
  description?: string;          // Optional description
  type: StepType;                // Type of step
  required: boolean;             // Whether this step is mandatory
  method: string;                // Method name to call on the orchestrator
  conditional?: string;          // Condition for execution (e.g., "hasConjoint", "hasEnfants")
  estimatedDuration?: number;    // Estimated duration in milliseconds
};

// Complete configuration for a product
export type ProductConfiguration = {
  platform: string;              // Platform identifier (e.g., "alptis", "swisslife")
  product: string;               // Product identifier (e.g., "sante_select", "slsis")
  flowKey: string;               // Flow key (e.g., "alptis_sante_select")
  category: ProductCategory;     // Product category
  displayName: string;           // Human-readable product name
  description?: string;          // Product description
  steps: StepDefinition[];       // Ordered list of steps
  metadata?: {                   // Additional metadata
    formUrl?: string;
    totalSections?: number;
    supportsPartialFill?: boolean;
  };
};
