import { InitAnswers } from '../../types/prompts.js';

const defaults: InitAnswers = {
  projectName: 'test-project',
  awsRegion: 'us-east-1',
  domain: 'example.com',
  containerImageUrl: 'ghcr.io/example/image:latest',
  containerPort: 3000,
  ecsTaskSize: 'small',
  desiredCount: 2,
  healthCheckPath: '/healthz',
  dbEngine: 'postgresql',
  dbInstanceSize: 'small',
  dbUsername: 'admin',
  dbPassword: 'secret',
};

export const createTestAnswers = (
  overrides: Partial<InitAnswers> = {},
): InitAnswers => ({
  ...defaults,
  ...overrides,
});

// Return an answers object but with some keys omitted (useful to test defaulting behavior)
export const createTestAnswersOmit = (
  omitKeys: Array<keyof InitAnswers>,
  overrides: Partial<InitAnswers> = {},
): InitAnswers => {
  const base: Record<string, unknown> = { ...defaults, ...overrides };
  for (const k of omitKeys) {
    delete base[k as string];
  }
  return base as InitAnswers;
};
