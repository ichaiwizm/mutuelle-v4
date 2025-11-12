import { buildGmailQuery } from '@/main/mail/query';
import type { GmailClient } from '@/main/mail/google/client';
import { createGmailClientFromTokens } from '@/main/mail/google/client';
import { matchesProvider } from '@/main/mail/filters';
import { LEAD_PROVIDERS } from '@/main/mail/providers';
import { GMAIL_CONFIG } from '@/main/mail/constants';
import { MailAuthService } from './mailAuthService';
import { isLead, detectProvider } from '@/main/leads/detection/detector';
import { parseLead } from '@/main/leads/parsing/parser';
import { LeadsService } from './leadsService';

async function ensureClient(provided: GmailClient | undefined): Promise<GmailClient> {
  if (provided) return provided;

  // Use centralized token access
  const token = await MailAuthService.requireToken();
  return createGmailClientFromTokens({
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiry: new Date(token.expiry),
    accountEmail: token.accountEmail,
  });
}

export const MailService = {
  async fetch(days: number, client?: GmailClient, options?: { verbose?: boolean; concurrency?: number }) {
    const q = buildGmailQuery(days);
    const c = await ensureClient(client);
    const ids = await c.listMessages(q);
    const matchedEmails: Array<{ from: string; subject: string; provider?: string; isLead?: boolean }> = [];

    // Traitement en parallèle avec limite de concurrence
    const concurrency = options?.concurrency ?? GMAIL_CONFIG.DEFAULT_CONCURRENCY;
    let matched = 0;
    let detected = 0;
    let parsed = 0;
    let saved = 0;
    const errors: string[] = [];

    for (let i = 0; i < ids.length; i += concurrency) {
      const batch = ids.slice(i, i + concurrency);
      const messages = await Promise.all(batch.map(id => c.getMessage(id)));

      for (const m of messages) {
        if (matchesProvider(m.from, LEAD_PROVIDERS)) {
          matched++;

          // Detect if this is a valid lead
          const leadDetected = isLead(m);
          if (leadDetected) {
            detected++;

            // Detect provider
            const providerDetection = detectProvider({ text: m.text, subject: m.subject });

            // Parse lead
            const lead = parseLead(
              { text: m.text, subject: m.subject },
              { emailId: m.id, source: 'email' }
            );
            if (lead) {
              parsed++;

              // Save to database
              try {
                await LeadsService.create(lead);
                saved++;
              } catch (error) {
                errors.push(`Failed to save lead from ${m.subject}: ${error}`);
              }
            }

            if (options?.verbose) {
              matchedEmails.push({
                from: m.from,
                subject: m.subject,
                provider: providerDetection.provider,
                isLead: leadDetected,
              });
            }
          } else if (options?.verbose) {
            matchedEmails.push({ from: m.from, subject: m.subject, isLead: false });
          }
        }
      }

      // Log progression si verbose
      if (options?.verbose && ids.length > 20 && (i + concurrency) % GMAIL_CONFIG.PROGRESS_LOG_INTERVAL === 0) {
        const progress = Math.min(i + concurrency, ids.length);
        console.log(`   Processing... ${progress}/${ids.length} (${detected} leads, ${saved} saved)`);
      }
    }

    return {
      fetched: ids.length,
      matched,
      detected,
      parsed,
      saved,
      errors: errors.length > 0 ? errors : undefined,
      matchedEmails: options?.verbose ? matchedEmails : undefined,
    };
  },
};
