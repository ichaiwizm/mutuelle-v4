import type { Page } from "playwright";

/** Window status in the registry */
export type WindowStatus = "active" | "waiting_user";

/** Entry stored in the window registry */
export type WindowEntry = {
  itemId: string;
  runId: string;
  flowKey: string;
  page: Page;
  status: WindowStatus;
  registeredAt: number;
};
