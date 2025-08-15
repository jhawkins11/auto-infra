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
  default?: string | ((answers: T) => string);
  choices?: string[];
  validate?: (input: string) => boolean | string;
  filter?: (input: string) => string;
};
