import { describe, it, expect } from "vitest";
import { LeadFormSchemaService } from "@/main/services/leadFormSchemaService";
import { LEAD_FORM_SCHEMA } from "@/main/leads/schema/lead-form-schema";
import type {
  FieldDefinition,
  SectionDefinition,
  FieldCondition,
  ConditionGroup,
  Condition,
} from "@/shared/types/form-schema";

describe("LeadFormSchemaService", () => {
  describe("getSchema", () => {
    it("returns the schema with correct structure", () => {
      const result = LeadFormSchemaService.getSchema();

      expect(result).toHaveProperty("schema");
      expect(result.schema).toHaveProperty("version");
      expect(result.schema).toHaveProperty("sections");
      expect(result.schema).toHaveProperty("fields");
    });

    it("returns version 1.0.0", () => {
      const result = LeadFormSchemaService.getSchema();
      expect(result.schema.version).toBe("1.0.0");
    });
  });

  describe("getSchemaVersion", () => {
    it("returns the current version", () => {
      expect(LeadFormSchemaService.getSchemaVersion()).toBe("1.0.0");
    });
  });
});

describe("LEAD_FORM_SCHEMA", () => {
  describe("sections", () => {
    it("has 5 sections", () => {
      expect(LEAD_FORM_SCHEMA.sections).toHaveLength(5);
    });

    it("has all required sections", () => {
      const sectionIds = LEAD_FORM_SCHEMA.sections.map((s) => s.id);
      expect(sectionIds).toContain("subscriber");
      expect(sectionIds).toContain("project");
      expect(sectionIds).toContain("conjoint");
      expect(sectionIds).toContain("children");
      expect(sectionIds).toContain("coverage");
    });

    it("sections have correct order", () => {
      const sorted = [...LEAD_FORM_SCHEMA.sections].sort((a, b) => a.order - b.order);
      expect(sorted[0].id).toBe("subscriber");
      expect(sorted[1].id).toBe("project");
      expect(sorted[2].id).toBe("conjoint");
      expect(sorted[3].id).toBe("children");
      expect(sorted[4].id).toBe("coverage");
    });

    it("children section is repeatable", () => {
      const childrenSection = LEAD_FORM_SCHEMA.sections.find((s) => s.id === "children");
      expect(childrenSection?.repeatable).toBe(true);
      expect(childrenSection?.minItems).toBe(0);
      expect(childrenSection?.maxItems).toBe(10);
    });

    it("conjoint section has visibility condition", () => {
      const conjointSection = LEAD_FORM_SCHEMA.sections.find((s) => s.id === "conjoint");
      expect(conjointSection?.visible).toBeDefined();
      expect(typeof conjointSection?.visible).toBe("object");

      const condition = conjointSection?.visible as FieldCondition;
      expect(condition.field).toBe("project.conjoint");
      expect(condition.operator).toBe("notEmpty");
    });

    it("children section has visibility condition based on nombreEnfants", () => {
      const childrenSection = LEAD_FORM_SCHEMA.sections.find((s) => s.id === "children");
      expect(childrenSection?.visible).toBeDefined();

      const condition = childrenSection?.visible as FieldCondition;
      expect(condition.field).toBe("subscriber.nombreEnfants");
      expect(condition.operator).toBe("gt");
      expect(condition.value).toBe(0);
    });
  });

  describe("fields", () => {
    it("has fields for all sections", () => {
      const sectionIds = new Set(LEAD_FORM_SCHEMA.fields.map((f) => f.section));
      expect(sectionIds).toContain("subscriber");
      expect(sectionIds).toContain("project");
      expect(sectionIds).toContain("conjoint");
      expect(sectionIds).toContain("children");
      expect(sectionIds).toContain("coverage");
    });

    it("subscriber section has required fields", () => {
      const subscriberFields = LEAD_FORM_SCHEMA.fields.filter(
        (f) => f.section === "subscriber"
      );
      const fieldNames = subscriberFields.map((f) => f.name);

      expect(fieldNames).toContain("civilite");
      expect(fieldNames).toContain("nom");
      expect(fieldNames).toContain("prenom");
      expect(fieldNames).toContain("dateNaissance");
      expect(fieldNames).toContain("email");
      expect(fieldNames).toContain("telephone");
      expect(fieldNames).toContain("codePostal");
      expect(fieldNames).toContain("nombreEnfants");
    });

    it("coverage section has slider fields with min/max 1-4", () => {
      const coverageFields = LEAD_FORM_SCHEMA.fields.filter(
        (f) => f.section === "coverage"
      );

      expect(coverageFields.length).toBe(4);

      for (const field of coverageFields) {
        expect(field.type).toBe("slider");
        expect(field.min).toBe(1);
        expect(field.max).toBe(4);
        expect(field.step).toBe(1);
      }
    });

    it("date fields have correct pattern", () => {
      const dateFields = LEAD_FORM_SCHEMA.fields.filter((f) => f.type === "date");

      expect(dateFields.length).toBeGreaterThan(0);

      for (const field of dateFields) {
        expect(field.pattern).toBeDefined();
        expect(field.patternMessage).toContain("JJ/MM/AAAA");
      }
    });

    it("codePostal field has 5-digit pattern", () => {
      const codePostalField = LEAD_FORM_SCHEMA.fields.find(
        (f) => f.path === "subscriber.codePostal"
      );

      expect(codePostalField).toBeDefined();
      expect(codePostalField?.pattern).toBe("^\\d{5}$");
      expect(codePostalField?.required).toBe(true);
    });

    it("assureurActuel field has conditional visibility", () => {
      const assureurField = LEAD_FORM_SCHEMA.fields.find(
        (f) => f.path === "project.assureurActuel"
      );

      expect(assureurField).toBeDefined();
      expect(assureurField?.visible).toBeDefined();

      const condition = assureurField?.visible as FieldCondition;
      expect(condition.field).toBe("project.actuellementAssure");
      expect(condition.operator).toBe("eq");
      expect(condition.value).toBe(true);
    });

    it("children fields use array notation in path", () => {
      const childrenFields = LEAD_FORM_SCHEMA.fields.filter(
        (f) => f.section === "children"
      );

      for (const field of childrenFields) {
        expect(field.path).toContain("children[]");
      }
    });

    it("all fields have required properties", () => {
      for (const field of LEAD_FORM_SCHEMA.fields) {
        expect(field.name).toBeDefined();
        expect(field.path).toBeDefined();
        expect(field.label).toBeDefined();
        expect(field.type).toBeDefined();
        expect(field.section).toBeDefined();
      }
    });

    it("select fields have options", () => {
      const selectFields = LEAD_FORM_SCHEMA.fields.filter(
        (f) => f.type === "select"
      );

      for (const field of selectFields) {
        expect(field.options).toBeDefined();
        expect(Array.isArray(field.options)).toBe(true);
        expect(field.options!.length).toBeGreaterThan(0);

        for (const option of field.options!) {
          expect(option.value).toBeDefined();
          expect(option.label).toBeDefined();
        }
      }
    });
  });

  describe("computedFields", () => {
    it("has computed fields for age calculation", () => {
      expect(LEAD_FORM_SCHEMA.computedFields).toBeDefined();
      expect(LEAD_FORM_SCHEMA.computedFields!.length).toBeGreaterThan(0);

      const ageFields = LEAD_FORM_SCHEMA.computedFields!.filter(
        (f) => f.type === "age"
      );
      expect(ageFields.length).toBe(2);

      const sourceFields = ageFields.map((f) => f.sourceField);
      expect(sourceFields).toContain("subscriber.dateNaissance");
      expect(sourceFields).toContain("project.conjoint.dateNaissance");
    });
  });
});

describe("Condition evaluation helpers", () => {
  // Helper function to evaluate conditions (same logic as in the hook)
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

  function isConditionGroup(condition: Condition): condition is ConditionGroup {
    return "conditions" in condition;
  }

  function evaluateFieldCondition(
    condition: FieldCondition,
    data: Record<string, unknown>
  ): boolean {
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
  }

  function evaluateCondition(
    condition: Condition,
    data: Record<string, unknown>
  ): boolean {
    if (isConditionGroup(condition)) {
      if (condition.operator === "and") {
        return condition.conditions.every((c) => evaluateCondition(c, data));
      } else {
        return condition.conditions.some((c) => evaluateCondition(c, data));
      }
    }
    return evaluateFieldCondition(condition, data);
  }

  describe("getNestedValue", () => {
    it("gets top-level values", () => {
      expect(getNestedValue({ name: "test" }, "name")).toBe("test");
    });

    it("gets nested values", () => {
      expect(
        getNestedValue({ subscriber: { nom: "Dupont" } }, "subscriber.nom")
      ).toBe("Dupont");
    });

    it("returns undefined for missing paths", () => {
      expect(getNestedValue({ a: 1 }, "b")).toBeUndefined();
      expect(getNestedValue({ a: { b: 1 } }, "a.c")).toBeUndefined();
    });
  });

  describe("evaluateFieldCondition", () => {
    it("evaluates eq operator", () => {
      expect(
        evaluateFieldCondition(
          { field: "status", operator: "eq", value: "active" },
          { status: "active" }
        )
      ).toBe(true);
      expect(
        evaluateFieldCondition(
          { field: "status", operator: "eq", value: "active" },
          { status: "inactive" }
        )
      ).toBe(false);
    });

    it("evaluates neq operator", () => {
      expect(
        evaluateFieldCondition(
          { field: "status", operator: "neq", value: "deleted" },
          { status: "active" }
        )
      ).toBe(true);
    });

    it("evaluates gt operator", () => {
      expect(
        evaluateFieldCondition(
          { field: "subscriber.nombreEnfants", operator: "gt", value: 0 },
          { subscriber: { nombreEnfants: 2 } }
        )
      ).toBe(true);
      expect(
        evaluateFieldCondition(
          { field: "subscriber.nombreEnfants", operator: "gt", value: 0 },
          { subscriber: { nombreEnfants: 0 } }
        )
      ).toBe(false);
    });

    it("evaluates empty operator", () => {
      expect(
        evaluateFieldCondition({ field: "name", operator: "empty" }, { name: "" })
      ).toBe(true);
      expect(
        evaluateFieldCondition({ field: "name", operator: "empty" }, { name: null })
      ).toBe(true);
      expect(
        evaluateFieldCondition({ field: "name", operator: "empty" }, {})
      ).toBe(true);
      expect(
        evaluateFieldCondition(
          { field: "name", operator: "empty" },
          { name: "test" }
        )
      ).toBe(false);
    });

    it("evaluates notEmpty operator", () => {
      expect(
        evaluateFieldCondition(
          { field: "project.conjoint", operator: "notEmpty" },
          { project: { conjoint: { dateNaissance: "01/01/1990" } } }
        )
      ).toBe(true);
      expect(
        evaluateFieldCondition(
          { field: "project.conjoint", operator: "notEmpty" },
          { project: {} }
        )
      ).toBe(false);
    });

    it("evaluates matches operator", () => {
      expect(
        evaluateFieldCondition(
          { field: "email", operator: "matches", value: "^[^@]+@[^@]+$" },
          { email: "test@example.com" }
        )
      ).toBe(true);
      expect(
        evaluateFieldCondition(
          { field: "email", operator: "matches", value: "^[^@]+@[^@]+$" },
          { email: "invalid" }
        )
      ).toBe(false);
    });
  });

  describe("evaluateCondition with groups", () => {
    it("evaluates AND condition group", () => {
      const condition: ConditionGroup = {
        operator: "and",
        conditions: [
          { field: "age", operator: "gte", value: 18 },
          { field: "age", operator: "lte", value: 110 },
        ],
      };

      expect(evaluateCondition(condition, { age: 30 })).toBe(true);
      expect(evaluateCondition(condition, { age: 15 })).toBe(false);
      expect(evaluateCondition(condition, { age: 120 })).toBe(false);
    });

    it("evaluates OR condition group", () => {
      const condition: ConditionGroup = {
        operator: "or",
        conditions: [
          { field: "status", operator: "eq", value: "active" },
          { field: "status", operator: "eq", value: "pending" },
        ],
      };

      expect(evaluateCondition(condition, { status: "active" })).toBe(true);
      expect(evaluateCondition(condition, { status: "pending" })).toBe(true);
      expect(evaluateCondition(condition, { status: "deleted" })).toBe(false);
    });
  });

  describe("real schema conditions", () => {
    it("children section visible when nombreEnfants > 0", () => {
      const childrenSection = LEAD_FORM_SCHEMA.sections.find(
        (s) => s.id === "children"
      );
      const condition = childrenSection?.visible as FieldCondition;

      expect(
        evaluateCondition(condition, { subscriber: { nombreEnfants: 2 } })
      ).toBe(true);
      expect(
        evaluateCondition(condition, { subscriber: { nombreEnfants: 0 } })
      ).toBe(false);
      expect(evaluateCondition(condition, { subscriber: {} })).toBe(false);
    });

    it("conjoint section visible when conjoint is not empty", () => {
      const conjointSection = LEAD_FORM_SCHEMA.sections.find(
        (s) => s.id === "conjoint"
      );
      const condition = conjointSection?.visible as FieldCondition;

      expect(
        evaluateCondition(condition, {
          project: { conjoint: { dateNaissance: "01/01/1990" } },
        })
      ).toBe(true);
      expect(evaluateCondition(condition, { project: {} })).toBe(false);
      expect(
        evaluateCondition(condition, { project: { conjoint: null } })
      ).toBe(false);
    });

    it("assureurActuel visible when actuellementAssure is true", () => {
      const assureurField = LEAD_FORM_SCHEMA.fields.find(
        (f) => f.path === "project.assureurActuel"
      );
      const condition = assureurField?.visible as FieldCondition;

      expect(
        evaluateCondition(condition, { project: { actuellementAssure: true } })
      ).toBe(true);
      expect(
        evaluateCondition(condition, { project: { actuellementAssure: false } })
      ).toBe(false);
      expect(evaluateCondition(condition, { project: {} })).toBe(false);
    });
  });
});

describe("Age computation", () => {
  function computeAge(dateString: string): number | null {
    const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    const birthDate = new Date(Number(year), Number(month) - 1, Number(day));

    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  it("computes age from DD/MM/YYYY format", () => {
    const today = new Date();
    const birthYear = today.getFullYear() - 30;
    const age = computeAge(`01/01/${birthYear}`);

    // Should be 29 or 30 depending on current date
    expect(age).toBeGreaterThanOrEqual(29);
    expect(age).toBeLessThanOrEqual(30);
  });

  it("returns null for invalid format", () => {
    expect(computeAge("2000-01-01")).toBeNull();
    expect(computeAge("01-01-2000")).toBeNull();
    expect(computeAge("invalid")).toBeNull();
    expect(computeAge("")).toBeNull();
  });

  it("returns null for clearly invalid date format", () => {
    // Note: JavaScript Date is permissive with overflow values (32/01 becomes 01/02)
    // The function only validates format, not calendar validity
    // Calendar validation should be done at the form validation level
    expect(computeAge("ab/cd/efgh")).toBeNull(); // Non-numeric
    expect(computeAge("1/1/2000")).toBeNull(); // Wrong format (missing leading zeros)
  });

  it("accounts for birthday not yet passed this year", () => {
    const today = new Date();
    const futureMonth = today.getMonth() + 2; // 2 months from now

    if (futureMonth <= 11) {
      const birthYear = today.getFullYear() - 25;
      const month = String(futureMonth + 1).padStart(2, "0");
      const age = computeAge(`15/${month}/${birthYear}`);
      expect(age).toBe(24); // Birthday not yet passed
    }
  });
});
