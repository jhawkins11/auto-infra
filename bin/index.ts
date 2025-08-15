#!/usr/bin/env node

import { Command } from 'commander';

import { runInitInteractive } from '../commands/init.js';

const program = new Command();

program
  .name('auto-infra')
  .description('infrastructure auto-generator CLI tool')
  .version('1.0.0');

program
  .command('init')
  .description('initialize a new infrastructure (interactive)')
  .action(async () => {
    await runInitInteractive();
  });

program.parse(process.argv);
