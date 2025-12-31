/**
 * Console output utilities with colors and formatting
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
} as const;

export function error(msg: string): void {
  console.error(`${COLORS.red}Error:${COLORS.reset} ${msg}`);
}

export function success(msg: string): void {
  console.log(`${COLORS.green}Success:${COLORS.reset} ${msg}`);
}

export function warn(msg: string): void {
  console.log(`${COLORS.yellow}Warning:${COLORS.reset} ${msg}`);
}

export function info(msg: string): void {
  console.log(`${COLORS.blue}Info:${COLORS.reset} ${msg}`);
}

export function dim(msg: string): void {
  console.log(`${COLORS.gray}${msg}${COLORS.reset}`);
}

export function bold(msg: string): string {
  return `${COLORS.bold}${msg}${COLORS.reset}`;
}

export function progress(step: number, total: number, msg: string): void {
  console.log(`${COLORS.cyan}[${step}/${total}]${COLORS.reset} ${msg}`);
}
