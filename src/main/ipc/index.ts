/**
 * IPC Registration - Entry Point
 *
 * This module registers all IPC handlers for communication between
 * the main process and the renderer process.
 *
 * Handlers are organized by domain in the handlers/ directory:
 * - mailHandlers: Gmail OAuth, fetch, status
 * - leadsHandlers: Lead CRUD, parsing
 * - credentialsHandlers: Platform credentials
 * - automationHandlers: Run management, screenshots
 * - productsHandlers: Product configs and status
 * - flowStatesHandlers: Pause/resume state management
 * - dashboardHandlers: Dashboard overview
 * - flowsHandlers: Flow listing
 * - fixturesHandlers: Dev fixtures export
 * - shellHandlers: System utilities (open path)
 */

import {
  registerMailHandlers,
  registerLeadsHandlers,
  registerCredentialsHandlers,
  registerAutomationHandlers,
  registerProductsHandlers,
  registerFlowStatesHandlers,
  registerDashboardHandlers,
  registerFlowsHandlers,
  registerFixturesHandlers,
  registerShellHandlers,
  registerAutomationSettingsHandlers,
  registerDataHandlers,
  registerAppHandlers,
  registerDevisHandlers,
  registerSupportHandlers,
} from "./handlers";

export function registerIpc() {
  registerMailHandlers();
  registerFixturesHandlers();
  registerFlowsHandlers();
  registerLeadsHandlers();
  registerCredentialsHandlers();
  registerAutomationHandlers();
  registerProductsHandlers();
  registerFlowStatesHandlers();
  registerDashboardHandlers();
  registerShellHandlers();
  registerAutomationSettingsHandlers();
  registerDataHandlers();
  registerAppHandlers();
  registerDevisHandlers();
  registerSupportHandlers();
}
