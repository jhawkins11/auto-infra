#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('auto-infra')
  .description('infrastructure auto-generator CLI tool')
  .version('1.0.0');

program
  .command('init <name>')
  .description('initialize a new infrastructure')
  .action((name) => {
    // Use allowed console methods per ESLint config for simple CLI feedback
    console.info(`Initializing infrastructure for ${name}...`);
  });

program.parse(process.argv);
