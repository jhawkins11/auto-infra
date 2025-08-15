export type InitAnswers = {
  projectName: string;
  awsRegion: string;
  domain?: string;
  dbSize?: string;
};

export type PromptQuestion<T> = {
  type: string;
  name: keyof T | string;
  message: string;
  default?: string;
  choices?: string[];
};
