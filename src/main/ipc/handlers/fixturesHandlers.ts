import { ipcMain } from "electron";
import { IPC_CHANNEL } from "../channels";
import { FixtureExporter } from "../../services/fixtureExporter";
import { FixturesExportSchema } from "@/shared/validation/ipc.zod";
import { handler } from "./utils";

export function registerFixturesHandlers() {
  ipcMain.handle(
    IPC_CHANNEL.FIXTURES_EXPORT,
    handler(FixturesExportSchema, async ({ days }) => {
      return FixtureExporter.exportEmailsToFixtures(days);
    })
  );
}
