/**
 * Form Schema Types
 * Types for exposing form metadata via IPC to enable dynamic form rendering
 */

/**
 * Supported field types
 */
export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "date" // Format DD/MM/YYYY
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "slider"; // For levels 1-4

/**
 * Operators for conditional logic
 */
export type ConditionOperator =
  | "eq" // equal
  | "neq" // not equal
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "empty" // undefined/null/empty string
  | "notEmpty" // not empty
  | "in" // value in array
  | "matches"; // regex match

/**
 * Single condition for a rule
 */
export type FieldCondition = {
  field: string; // Field path (e.g., "subscriber.nombreEnfants")
  operator: ConditionOperator;
  value?: unknown; // Comparison value (optional for empty/notEmpty)
};

/**
 * Group of conditions with logical operator
 */
export type ConditionGroup = {
  operator: "and" | "or";
  conditions: Array<FieldCondition | ConditionGroup>;
};

/**
 * Condition type (single or group)
 */
export type Condition = FieldCondition | ConditionGroup;

/**
 * Options for select/radio fields
 */
export type FieldOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

/**
 * Validation rule types
 */
export type ValidationRuleType =
  | "required"
  | "pattern"
  | "min"
  | "max"
  | "minLength"
  | "maxLength"
  | "custom";

/**
 * Validation rule definition
 */
export type ValidationRule = {
  type: ValidationRuleType;
  value?: string | number;
  message: string;
  condition?: Condition; // Conditional validation
};

/**
 * Computed field types
 */
export type ComputedFieldType = "age";

/**
 * Computed field definition
 */
export type ComputedField = {
  type: ComputedFieldType;
  sourceField: string;
  targetField?: string;
};

/**
 * Complete field definition
 */
export type FieldDefinition = {
  // Identification
  name: string; // Technical name (e.g., "dateNaissance")
  path: string; // Full path (e.g., "subscriber.dateNaissance")

  // Display
  label: string;
  placeholder?: string;
  helpText?: string;

  // Type and options
  type: FieldType;
  options?: FieldOption[];

  // Value constraints
  min?: number;
  max?: number;
  step?: number;

  // Validation
  required?: boolean | Condition;
  validations?: ValidationRule[];
  pattern?: string;
  patternMessage?: string;

  // Visibility and state
  visible?: boolean | Condition;
  disabled?: boolean | Condition;
  readOnly?: boolean;

  // Values
  defaultValue?: unknown;
  computed?: ComputedField;

  // Ordering and grouping
  order?: number;
  section: string;
};

/**
 * Section definition for form grouping
 */
export type SectionDefinition = {
  id: string;
  label: string;
  description?: string;
  icon?: string; // Lucide icon name
  order: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  visible?: boolean | Condition;

  // For repeatable sections (e.g., children)
  repeatable?: boolean;
  minItems?: number;
  maxItems?: number;
  itemLabel?: string; // e.g., "Enfant {index}"
};

/**
 * Complete form schema
 */
export type LeadFormSchema = {
  version: string;
  sections: SectionDefinition[];
  fields: FieldDefinition[];
  computedFields?: ComputedField[];
};

/**
 * IPC result type for getFormSchema
 */
export type LeadFormSchemaResult = {
  schema: LeadFormSchema;
};
