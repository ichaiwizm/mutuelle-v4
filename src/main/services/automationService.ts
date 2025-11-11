export const AutomationService = {
  async enqueue(_items: Array<{ flowKey: string; leadId: string }>) {
    // TODO: créer run + run_items, status "queued"
    return { runId: "TODO-run-uuid" };
  },
};
