import { InitAnswers, PromptQuestion } from '../types/prompts.js';

export const initQuestions: PromptQuestion<InitAnswers>[] = [
  {
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    default: 'my-project',
    validate: (input: string) =>
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(input) ||
      'Project name must be a valid DNS-compatible name (lowercase alphanumeric and hyphens, max 63 chars, starts/ends with alphanumeric).',
  },
  {
    type: 'input',
    name: 'awsRegion',
    message: 'AWS region:',
    default: 'us-east-1',
    validate: (input: string) =>
      /^[a-z]{2}-[a-z]+-[1-9]{1}$/.test(input) ||
      'Please enter a valid AWS region (e.g., us-east-1).',
  },
  {
    type: 'input',
    name: 'domain',
    message: 'Domain to use (optional):',
    default: '',
    filter: (input: string) => input.toLowerCase(),
    validate: (input: string) => {
      if (!input) {
        return true;
      }
      // Basic regex for domain validation (allows subdomains)
      return (
        /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(
          input,
        ) ||
        'Please enter a valid domain name (e.g., example.com or sub.example.com).'
      );
    },
  },
  {
    type: 'list',
    name: 'dbSize',
    message: 'Database size:',
    choices: ['small', 'medium', 'large'],
    default: 'small',
  },
];
