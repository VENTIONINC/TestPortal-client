import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const { NODE_ENV, YARN_PRODUCTION, npm_config_omit } = process.env;
const omittedDependencies = npm_config_omit?.split(',');

if (
  NODE_ENV === 'production' ||
  YARN_PRODUCTION === 'true' ||
  omittedDependencies?.includes('dev') ||
  !existsSync('src/theme/system.ts')
) {
  process.exit(0);
}

const result = spawnSync('yarn', ['typegen'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
