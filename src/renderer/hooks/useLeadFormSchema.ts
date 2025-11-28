import { useEffect, useState, useCallback, useMemo } from "react";
import type {
  LeadFormSchema,
  FieldDefinition,
  SectionDefinition,
  FieldCondition,
  ConditionGroup,
  Condition,
} from "@/shared/types/form-schema";
import type { Lead } from "@/shared/types/lead";

type PartialLead = Partial<Lead> & { project?: Partial<Lead["project"]> };

interface UseLeadFormSchemaResult {
  schema: LeadFormSchema | null;
  loading: boolean;
  error: Error | null;

  // Field helpers
  getFieldsForSection: (sectionId: string) => FieldDefinition[];
  getFieldByPath: (path: string) => FieldDefinition | undefined;

  // Section helpers
  getSortedSections: () => SectionDefinition[];

  // Condition evaluation
  isFieldVisible: (field: FieldDefinition, data: PartialLead) => boolean;
  isFieldRequired: (field: FieldDefinition, data: PartialLead) => boolean;
  isFieldDisabled: (field: FieldDefinition, data: PartialLead) => boolean;
  isSectionVisible: (section: SectionDefinition, data: PartialLead) => boolean;

  // Computed helpers
  computeAge: (dateString: string) => number | null;
}

/**
 * Get a nested value from an object by path
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;

  const parts = path.split(".");
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Check if a condition group is a ConditionGroup (not a FieldCondition)
 */
function isConditionGroup(condition: Condition): condition is ConditionGroup {
  return "conditions" in condition;
}

/**
 * Hook for accessing and working with the Lead form schema
 */
export function useLeadFormSchema(): UseLeadFormSchemaResult {
  const [schema, setSchema] = useState<LeadFormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch schema on mount
  useEffect(() => {
    window.api.leads
      .getFormSchema()
      .then((result) => setSchema(result.schema))
      .catch((err) =>
        setError(err instanceof Error ? err : new Error("Failed to load schema"))
      )
      .finally(() => setLoading(false));
  }, []);

  // Create a map of fields by path for quick lookup
  const fieldsByPath = useMemo(() => {
    if (!schema) return new Map<string, FieldDefinition>();
    return new Map(schema.fields.map((f) => [f.path, f]));
  }, [schema]);

  /**
   * Evaluate a single field condition
   */
  const evaluateFieldCondition = useCallback(
    (condition: FieldCondition, data: PartialLead): boolean => {
      const value = getNestedValue(data, condition.field);

      switch (condition.operator) {
        case "eq":
          return value === condition.value;
        case "neq":
          return value !== condition.value;
        case "gt":
          return Number(value) > Number(condition.value);
        case "gte":
          return Number(value) >= Number(condition.value);
        case "lt":
          return Number(value) < Number(condition.value);
        case "lte":
          return Number(value) <= Number(condition.value);
        case "empty":
          return value === undefined || value === null || value === "";
        case "notEmpty":
          return value !== undefined && value !== null && value !== "";
        case "in":
          return Array.isArray(condition.value) && condition.value.includes(value);
        case "matches":
          return new RegExp(String(condition.value)).test(String(value ?? ""));
        default:
          return true;
      }
    },
    []
  );

  /**
   * Evaluate a condition (single or group)
   */
  const evaluateCondition = useCallback(
    (condition: Condition, data: PartialLead): boolean => {
      if (isConditionGroup(condition)) {
        const group = condition;
        if (group.operator === "and") {
          return group.conditions.every((c) => evaluateCondition(c, data));
        } else {
          return group.conditions.some((c) => evaluateCondition(c, data));
        }
      }

      return evaluateFieldCondition(condition, data);
    },
    [evaluateFieldCondition]
  );

  /**
   * Get fields for a specific section, sorted by order
   */
  const getFieldsForSection = useCallback(
    (sectionId: string): FieldDefinition[] => {
      if (!schema) return [];
      return schema.fields
        .filter((f) => f.section === sectionId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    [schema]
  );

  /**
   * Get all sections sorted by order
   */
  const getSortedSections = useCallback((): SectionDefinition[] => {
    if (!schema) return [];
    return [...schema.sections].sort((a, b) => a.order - b.order);
  }, [schema]);

  /**
   * Check if a field is visible based on its condition
   */
  const isFieldVisible = useCallback(
    (field: FieldDefinition, data: PartialLead): boolean => {
      if (field.visible === undefined || field.visible === true) return true;
      if (field.visible === false) return false;
      return evaluateCondition(field.visible, data);
    },
    [evaluateCondition]
  );

  /**
   * Check if a field is required based on its condition
   */
  const isFieldRequired = useCallback(
    (field: FieldDefinition, data: PartialLead): boolean => {
      if (field.required === undefined || field.required === false) return false;
      if (field.required === true) return true;
      return evaluateCondition(field.required, data);
    },
    [evaluateCondition]
  );

  /**
   * Check if a field is disabled based on its condition
   */
  const isFieldDisabled = useCallback(
    (field: FieldDefinition, data: PartialLead): boolean => {
      if (field.disabled === undefined || field.disabled === false) return false;
      if (field.disabled === true) return true;
      return evaluateCondition(field.disabled, data);
    },
    [evaluateCondition]
  );

  /**
   * Check if a section is visible based on its condition
   */
  const isSectionVisible = useCallback(
    (section: SectionDefinition, data: PartialLead): boolean => {
      if (section.visible === undefined || section.visible === true) return true;
      if (section.visible === false) return false;
      return evaluateCondition(section.visible, data);
    },
    [evaluateCondition]
  );

  /**
   * Get a field by its path
   */
  const getFieldByPath = useCallback(
    (path: string): FieldDefinition | undefined => {
      return fieldsByPath.get(path);
    },
    [fieldsByPath]
  );

  /**
   * Compute age from a DD/MM/YYYY date string
   */
  const computeAge = useCallback((dateString: string): number | null => {
    const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    const birthDate = new Date(Number(year), Number(month) - 1, Number(day));

    // Validate date is valid
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }, []);

  return {
    schema,
    loading,
    error,
    getFieldsForSection,
    getSortedSections,
    isFieldVisible,
    isFieldRequired,
    isFieldDisabled,
    isSectionVisible,
    getFieldByPath,
    computeAge,
  };
}
