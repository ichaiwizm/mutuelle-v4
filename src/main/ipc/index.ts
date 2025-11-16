import { ipcMain } from "electron";
import { IPC_CHANNEL } from "./channels";
import { LeadsService } from "../services/leadsService";
import { CredentialsService } from "../services/credentialsService";
import { AutomationService } from "../services/automationService";
import { FlowsService } from "../services/flowsService";
import { MailAuthService } from "../services/mailAuthService";
import { MailService } from "../services/mailService";
import { FixtureExporter } from "../services/fixtureExporter";

export function registerIpc() {
  ipcMain.handle(IPC_CHANNEL.MAIL_STATUS, () => MailAuthService.status());
  ipcMain.handle(IPC_CHANNEL.MAIL_CONNECT, async () => ({ ok: false, error: 'not_implemented_yet' }));
  ipcMain.handle(IPC_CHANNEL.MAIL_FETCH, (_e, days: number) => MailService.fetch(days).catch(err => ({ fetched:0, scanned:0, matched:0, created:0, error:String(err) })));
  ipcMain.handle(IPC_CHANNEL.FIXTURES_EXPORT, (_e, days: number) => FixtureExporter.exportEmailsToFixtures(days));
  ipcMain.handle(IPC_CHANNEL.FLOWS_LIST, () => FlowsService.list());
  ipcMain.handle(IPC_CHANNEL.LEADS_LIST, () => LeadsService.list());
  ipcMain.handle(IPC_CHANNEL.LEADS_CREATE, (_e, lead) => LeadsService.create(lead));
  ipcMain.handle(IPC_CHANNEL.LEADS_REMOVE, (_e, id) => LeadsService.remove(id));
  ipcMain.handle(IPC_CHANNEL.CREDS_UPSERT, (_e, p) => CredentialsService.upsert(p));
  ipcMain.handle(IPC_CHANNEL.CREDS_TEST, (_e, platform) => CredentialsService.test(platform));
  ipcMain.handle(IPC_CHANNEL.AUTO_ENQUEUE, (_e, items) => AutomationService.enqueue(items));
}
