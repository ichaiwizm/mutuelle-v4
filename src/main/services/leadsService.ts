import { db, schema } from "../db";
import { eq } from "drizzle-orm";

export const LeadsService = {
  async list() {
    // TODO: SELECT id FROM leads
    return [];
  },
  async create(_lead: unknown) {
    // TODO: validate Zod + INSERT
    return { id: "TODO-uuid" };
  },
  async remove(_id: string) {
    // TODO: DELETE
  },
};
