import { existsSync } from 'node:fs';

const { HUSKY, CI, NODE_ENV, YARN_PRODUCTION, npm_config_omit } = process.env;
const omittedDependencies = npm_config_omit?.split(',');

if (
  HUSKY === '0' ||
  CI ||
  NODE_ENV === 'production' ||
  YARN_PRODUCTION === 'true' ||
  omittedDependencies?.includes('dev') ||
  !existsSync('.git')
) {
  process.exit(0);
}

const { default: install } = await import('husky');
const error = install();
if (error) {
  console.error(error.trim());
  console.error('Husky hooks could not be activated. Check Git configuration and retry with `yarn postinstall`.');
  process.exitCode = 1;
}
