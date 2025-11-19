import type { Page, Route } from 'playwright';

/**
 * Interception centralisée des domaines OneTrust (CookieLaw) pour empêcher l'apparition
 * du bandeau de consentement pendant toute la session Playwright.
 *
 * Idempotent: on n'installe qu'une seule fois par Page grâce à WeakSet.
 */
const installedPages = new WeakSet<Page>();

const ONETRUST_ROUTE_PATTERNS = [
  '**/*cookielaw.org/**',
  '**/*cdn.cookielaw.org/**',
  '**/*onetrust.com/**',
] as const;

type InterceptionOptions = {
  debug?: boolean;
};

export async function setupCookieInterception(page: Page, options?: InterceptionOptions): Promise<void> {
  if (installedPages.has(page)) {
    return;
  }
  installedPages.add(page);

  const context = page.context();

  const abortAndMaybeLog = async (route: Route, tag: string): Promise<void> => {
    if (options?.debug) {
      const req = route.request();
      console.log(`[COOKIES][ABORT ${tag}] ${req.method()} ${req.url()}`);
    }
    await route.abort();
  };

  // Installer les routes sur la page (courante) et sur le context (persiste aux navigations)
  await Promise.all([
    ...ONETRUST_ROUTE_PATTERNS.map((pattern) =>
      page.route(pattern, (route) => abortAndMaybeLog(route, `page:${pattern}`))
    ),
    ...ONETRUST_ROUTE_PATTERNS.map((pattern) =>
      context.route(pattern, (route) => abortAndMaybeLog(route, `ctx:${pattern}`))
    ),
  ]);
}
