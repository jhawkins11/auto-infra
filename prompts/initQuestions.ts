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
    type: 'input',
    name: 'containerImageUrl',
    message: 'Container image URL (Docker Hub or ECR):',
    validate: (input: string) =>
      /^(?:[a-z0-9]+(?:[._-][a-z0-9]+)*\/?)+(?::[\w][\w.-]{0,127})?(?:@[A-Za-z0-9+_.-]+:[A-Fa-f0-9]{32,})?$/.test(
        input,
      ) ||
      'Enter a valid container image reference (e.g., nginx:latest or 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:1.0.0).',
  },
  {
    type: 'input',
    name: 'containerPort',
    message: 'Container port to expose:',
    default: '3000',
    validate: (input: string) => {
      const n = Number(input);
      if (!Number.isInteger(n) || n < 1 || n > 65535) {
        return 'Enter a valid port between 1 and 65535.';
      }
      return true;
    },
    filter: (input: string) => String(Number(input)),
  },
  {
    type: 'list',
    name: 'ecsTaskSize',
    message: 'ECS task size:',
    choices: ['small', 'medium', 'large'],
    default: 'small',
  },
  {
    type: 'input',
    name: 'desiredCount',
    message: 'Desired number of container instances:',
    default: '2',
    validate: (input: string) => {
      const n = Number(input);
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        return 'Enter an integer between 1 and 100.';
      }
      return true;
    },
    filter: (input: string) => String(Number(input)),
  },
  {
    type: 'input',
    name: 'healthCheckPath',
    message: 'Application health check path:',
    default: '/healthz',
    validate: (input: string) =>
      /^\/[A-Za-z0-9._~/-]*$/.test(input) ||
      'Enter a valid URL path starting with / (e.g., /healthz).',
  },
  {
    type: 'list',
    name: 'dbEngine',
    message: 'Database engine:',
    choices: ['postgresql', 'mysql'],
    default: 'postgresql',
  },
  {
    type: 'list',
    name: 'dbInstanceSize',
    message: 'Database instance size:',
    choices: ['micro', 'small', 'medium', 'large', 'xlarge'],
    default: 'small',
  },
  {
    type: 'input',
    name: 'dbUsername',
    message: 'Database username:',
    default: 'admin',
    validate: (input: string) =>
      /^[A-Za-z][A-Za-z0-9_-]{2,31}$/.test(input) ||
      'Use 3-32 chars, start with a letter, letters/numbers/_/- allowed.',
  },
  {
    type: 'password',
    name: 'dbPassword',
    message: 'Database password:',
    mask: true,
    default: (): string => {
      const alphabet =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]<>?';
      const length = 20;
      let output = '';
      for (let index = 0; index < length; index++) {
        output += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
      }
      return output;
    },
    validate: (input: string) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/.test(input) ||
      'Min 12 chars with upper, lower, number, and symbol.',
  },
];
