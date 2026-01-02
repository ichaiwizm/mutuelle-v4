/**
 * Credential-related utilities for the renderer process.
 */

/**
 * Extract the platform from a flowKey.
 * flowKey format: "{platform}_{product}" (e.g., "alptis_sante_select")
 */
export function getPlatformFromFlowKey(flowKey: string): string | null {
  if (flowKey.startsWith("alptis_")) return "alptis";
  if (flowKey.startsWith("swisslife_")) return "swisslife";
  if (flowKey.startsWith("entoria_")) return "entoria";
  return null;
}

/**
 * Get the set of platforms that are missing credentials.
 */
export function getMissingPlatforms(
  flowKeys: Iterable<string>,
  configuredPlatforms: Set<string>
): Set<string> {
  const missing = new Set<string>();
  for (const flowKey of flowKeys) {
    const platform = getPlatformFromFlowKey(flowKey);
    if (platform && !configuredPlatforms.has(platform)) {
      missing.add(platform);
    }
  }
  return missing;
}
