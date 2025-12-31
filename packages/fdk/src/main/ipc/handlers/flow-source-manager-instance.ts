/**
 * Flow Source Manager Instance
 * Shared singleton instance of FlowSourceManager
 */
import { app } from "electron";
import * as path from "path";
import { FlowSourceManager } from "../../loaders";

// Initialize FlowSourceManager with flows directory
// In dev mode: __dirname is packages/fdk/out/main, flows is at packages/fdk/flows
// In prod mode: flows is bundled in resources
const flowsDir = app.isPackaged
  ? path.join(process.resourcesPath, "flows")
  : path.join(__dirname, "../../flows");

export const flowSourceManager = new FlowSourceManager(flowsDir);
