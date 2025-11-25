import { register } from 'tsconfig-paths';
import { join } from 'node:path';

// Register TypeScript path mappings
register({
  baseUrl: '.',
  paths: {
    '@/*': ['./src/*'],
  },
});
