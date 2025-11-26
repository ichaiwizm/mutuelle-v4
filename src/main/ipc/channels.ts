export const IPC_CHANNEL = {
  // Mail
  MAIL_STATUS: "mail:status",
  MAIL_CONNECT: "mail:connect",
  MAIL_DISCONNECT: "mail:disconnect",
  MAIL_FETCH: "mail:fetch",

  // Fixtures (dev only)
  FIXTURES_EXPORT: "fixtures:export",

  // Flows
  FLOWS_LIST: "flows:list",

  // Leads
  LEADS_LIST: "leads:list",
  LEADS_GET: "leads:get",
  LEADS_CREATE: "leads:create",
  LEADS_UPDATE: "leads:update",
  LEADS_REMOVE: "leads:remove",

  // Credentials
  CREDS_UPSERT: "credentials:upsert",
  CREDS_GET: "credentials:get",
  CREDS_LIST: "credentials:list",
  CREDS_DELETE: "credentials:delete",
  CREDS_TEST: "credentials:test",

  // Automation
  AUTO_ENQUEUE: "automation:enqueue",
  AUTO_GET: "automation:get",
  AUTO_LIST: "automation:list",
  AUTO_CANCEL: "automation:cancel",
} as const;
