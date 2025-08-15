import inquirer from 'inquirer';

import { initQuestions } from '../prompts/initQuestions.js';
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

  await Promise.all([vpcConfigPromise]);

  // Placeholder: future steps will generate files and call services
  console.info('Interactive initialization complete (placeholder).');
};
