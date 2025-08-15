import inquirer from 'inquirer';

import { initQuestions } from '../prompts/initQuestions.js';
import { generateDatabaseConfig } from '../services/database.js';
import { generateEcsConfig } from '../services/ecs.js';
import { generateVpcConfig } from '../services/vpc.js';
import { InitAnswers } from '../types/prompts.js';

export const runInitInteractive = async (): Promise<void> => {
  console.info('\nWelcome to Auto-Infra!');
  console.info(
    'This tool will guide you through creating infrastructure configuration for your project.\n',
  );

  const answers = await inquirer.prompt<InitAnswers>(initQuestions);

  console.info(
    `\nInitializing project ${answers.projectName} in ${answers.awsRegion}...`,
  );

  const vpcConfigPromise = generateVpcConfig(answers);
  const ecsConfigPromise = generateEcsConfig(answers);
  const databaseConfigPromise = generateDatabaseConfig(answers);

  await Promise.all([
    vpcConfigPromise,
    ecsConfigPromise,
    databaseConfigPromise,
  ]);

  console.info('Interactive initialization complete.');
};
