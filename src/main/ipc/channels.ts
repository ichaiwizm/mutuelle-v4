export const IPC_CHANNEL = {
  FLOWS_LIST: "flows:list",
  LEADS_LIST: "leads:list",
  LEADS_CREATE: "leads:create",
  LEADS_REMOVE: "leads:remove",
  CREDS_UPSERT: "credentials:upsert",
  CREDS_TEST: "credentials:test",
  AUTO_ENQUEUE: "automation:enqueue",
} as const;
