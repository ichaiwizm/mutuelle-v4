#!/usr/bin/env node
/**
 * FDK CLI - Flow Development Kit Command Line Interface
 * Test, export, and validate flows without Electron UI
 */
import { testCommand } from './commands/test';
import { exportCommand } from './commands/export';
import { validateCommand } from './commands/validate';
import { listCommand, getAllFlowIds } from './commands/list';
import { error, info, bold } from './utils/console';

const VERSION = '1.0.0';

function parseArgs(args: string[]) {
  const command = args[0] || 'help';
  const flowKey = args[1] && !args[1].startsWith('--') ? args[1] : undefined;
  const options: Record<string, string | boolean> = {};
  for (const arg of args.slice(flowKey ? 2 : 1)) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value ?? true;
    }
  }
  return { command, flowKey, options };
}

function showHelp(): void {
  console.log(`\n${bold('FDK CLI')} v${VERSION}\n
${bold('Usage:')} fdk <command> [flowKey] [options]

${bold('Commands:')}
  test <flowKey>      Run flow with test data
  export <flowKey>    Export flow to YAML
  validate <flowKey>  Validate flow definition
  publish <flowKey>   Publish flow to database (requires DB)
  published           List all published flows (requires DB)
  list                List all available flows

${bold('Options:')}
  --lead-id=X      Lead ID for testing    --headed        Visible browser
  --output=path    Output path for export --version=X.Y.Z Version for publish

${bold('Flows:')} ${getAllFlowIds().join(', ')}`);
}

async function main(): Promise<void> {
  const { command, flowKey, options } = parseArgs(process.argv.slice(2));
  switch (command) {
    case 'test':
      if (!flowKey) { error('Usage: fdk test <flowKey>'); process.exit(1); }
      await testCommand(flowKey, { leadId: options['lead-id'] as string, headed: !!options.headed });
      break;
    case 'export':
      if (!flowKey) { error('Usage: fdk export <flowKey>'); process.exit(1); }
      exportCommand(flowKey, options.output as string | undefined);
      break;
    case 'validate':
      if (!flowKey) { error('Usage: fdk validate <flowKey>'); process.exit(1); }
      validateCommand(flowKey);
      break;
    case 'publish': {
      if (!flowKey) { error('Usage: fdk publish <flowKey>'); process.exit(1); }
      // Dynamic import to avoid loading DB dependencies for other commands
      const { publishCommand } = await import('./commands/publish');
      publishCommand(flowKey, options.version as string | undefined);
      break;
    }
    case 'published': {
      // Dynamic import to avoid loading DB dependencies for other commands
      const { publishedListCommand } = await import('./commands/publish');
      publishedListCommand();
      break;
    }
    case 'list': listCommand(); break;
    case 'version': case '--version': case '-v': info(`FDK CLI v${VERSION}`); break;
    case 'help': case '--help': case '-h': showHelp(); break;
    default: error(`Unknown command: ${command}`); showHelp(); process.exit(1);
  }
}

main().catch((e: Error) => { error(e.message); process.exit(1); });
