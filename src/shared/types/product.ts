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
  stepClass?: string;            // Class name of the Step implementation
  needsLead?: boolean;           // Whether this step requires lead data (default: false)
  needsCredentials?: boolean;    // Whether this step requires credentials (default: false)
  maxRetries?: number;           // Maximum number of retries on failure (default: 0)
};

// Conditional rule function type - evaluates if a step should execute
export type ConditionalRule<T = any> = (data: T) => boolean;

// Conditional rules mapping for a product
export type ConditionalRules<T = any> = Record<string, ConditionalRule<T>>;

// Complete configuration for a product
export type ProductConfiguration<T = any> = {
  platform: string;              // Platform identifier (e.g., "alptis", "swisslife")
  product: string;               // Product identifier (e.g., "sante_select", "slsis")
  flowKey: string;               // Flow key (e.g., "alptis_sante_select")
  category: ProductCategory;     // Product category
  displayName: string;           // Human-readable product name
  description?: string;          // Product description
  steps: StepDefinition[];       // Ordered list of steps
  conditionalRules?: ConditionalRules<T>;  // Rules to evaluate step conditionals
  metadata?: {                   // Additional metadata
    formUrl?: string;
    totalSections?: number;
    supportsPartialFill?: boolean;
  };
};
