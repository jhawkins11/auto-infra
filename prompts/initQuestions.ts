import { InitAnswers, PromptQuestion } from '../types/prompts.js';

export const initQuestions: PromptQuestion<InitAnswers>[] = [
  {
    type: 'input',
    name: 'projectName',
    message: 'Project name:',
    default: 'my-project',
  },
  {
    type: 'input',
    name: 'awsRegion',
    message: 'AWS region:',
    default: 'us-east-1',
  },
  {
    type: 'input',
    name: 'domain',
    message: 'Domain (optional):',
    default: '',
  },
  {
    type: 'list',
    name: 'dbSize',
    message: 'Database size:',
    choices: ['small', 'medium', 'large'],
    default: 'small',
  },
];
