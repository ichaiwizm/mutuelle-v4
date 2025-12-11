export const IPC_CHANNEL = {
  // Mail
  MAIL_STATUS: "mail:status",
  MAIL_CONNECT: "mail:connect",
  MAIL_DISCONNECT: "mail:disconnect",
  MAIL_FETCH: "mail:fetch",
  MAIL_CANCEL: "mail:cancel",
  MAIL_IS_CONNECTING: "mail:isConnecting",
  MAIL_CANCEL_CONNECT: "mail:cancelConnect",

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
  LEADS_PARSE_FROM_TEXT: "leads:parseFromText",
  LEADS_PARSE_AND_CREATE_FROM_TEXT: "leads:parseAndCreateFromText",
  LEADS_GET_FORM_SCHEMA: "leads:getFormSchema",

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
  AUTO_DELETE: "automation:delete",
  AUTO_RETRY: "automation:retry",
  AUTO_RETRY_ITEM: "automation:retryItem",
  AUTO_PROGRESS: "automation:progress", // Push channel (main -> renderer)
  AUTO_GET_ITEM: "automation:getItem",
  AUTO_READ_SCREENSHOT: "automation:readScreenshot",
  AUTO_BRING_TO_FRONT: "automation:bringToFront", // Bring browser window to front for manual takeover

  // Products
  PRODUCTS_LIST_CONFIGS: "products:listConfigs",
  PRODUCTS_GET_CONFIG: "products:getConfig",
  PRODUCTS_LIST_STATUSES: "products:listStatuses",
  PRODUCTS_GET_STATUS: "products:getStatus",
  PRODUCTS_SAVE_STATUS: "products:saveStatus",
  PRODUCTS_UPDATE_STATUS: "products:updateStatus",
  PRODUCTS_LIST_ACTIVE_CONFIGS: "products:listActiveConfigs",

  // Flow states (pause/resume inspection)
  FLOW_STATES_LIST_PAUSED: "flowStates:listPaused",
  FLOW_STATES_GET: "flowStates:get",
  FLOW_STATES_DELETE: "flowStates:delete",
  FLOW_STATES_RESUME: "flowStates:resume",

  // Dashboard
  DASHBOARD_OVERVIEW: "dashboard:overview",

  // Shell (system utilities)
  SHELL_OPEN_PATH: "shell:openPath",

  // Automation Settings
  AUTO_SETTINGS_GET: "automationSettings:get",
  AUTO_SETTINGS_LIST: "automationSettings:list",
  AUTO_SETTINGS_SAVE: "automationSettings:save",

  // Data Export/Backup
  DATA_EXPORT_LEADS: "data:exportLeads",
  DATA_EXPORT_DB: "data:exportDb",
  DATA_GET_LOGS_PATH: "data:getLogsPath",

  // Feedback
  FEEDBACK_SEND: "feedback:send",
} as const;
