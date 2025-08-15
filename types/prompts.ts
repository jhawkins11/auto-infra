export type InitAnswers = {
  projectName: string;
  awsRegion: string;
  domain?: string;
  containerImageUrl?: string;
  containerPort?: number;
  ecsTaskSize?: 'small' | 'medium' | 'large';
  desiredCount?: number;
  healthCheckPath?: string;
  dbEngine?: 'postgresql' | 'mysql';
  dbInstanceSize?: 'micro' | 'small' | 'medium' | 'large' | 'xlarge';
  dbUsername?: string;
  dbPassword?: string;
};

export type PromptQuestion<T> = {
  type: string;
  name: keyof T | string;
  message: string;
  default?: string | ((answers: T) => string);
  choices?: string[];
  validate?: (input: string) => boolean | string;
  filter?: (input: string) => string;
  mask?: string | boolean;
};
