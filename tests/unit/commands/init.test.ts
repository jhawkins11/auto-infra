jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

jest.mock('../../../services/vpc.ts', () => ({
  generateVpcConfig: jest.fn(),
}));

jest.mock('../../../services/ecs.ts', () => ({
  generateEcsConfig: jest.fn(),
}));

jest.mock('../../../services/database.ts', () => ({
  generateDatabaseConfig: jest.fn(),
}));

import inquirer from 'inquirer';

import { runInitInteractive } from '../../../commands/init.js';
import { generateDatabaseConfig } from '../../../services/database.js';
import { generateEcsConfig } from '../../../services/ecs.js';
import { generateVpcConfig } from '../../../services/vpc.js';

describe('runInitInteractive', () => {
  const fakeAnswers = {
    projectName: 'my-project',
    awsRegion: 'us-east-1',
    domain: 'example.com',
    ecsTaskSize: 'small',
    containerImageUrl: 'ghcr.io/example/image:latest',
    containerPort: '8080',
    desiredCount: '3',
    healthCheckPath: '/health',
    dbEngine: 'postgresql',
    dbInstanceSize: 'small',
    dbUsername: 'admin',
    dbPassword: 'secret',
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(generateVpcConfig).mockResolvedValue(undefined);
    jest.mocked(generateEcsConfig).mockResolvedValue(undefined);
    jest.mocked(generateDatabaseConfig).mockResolvedValue(undefined);
  });

  it('should call all config generation services with the correct answers on success', async () => {
    jest.mocked(inquirer.prompt).mockResolvedValue(fakeAnswers);

    await runInitInteractive();

    expect(generateVpcConfig).toHaveBeenCalledTimes(1);
    expect(generateVpcConfig).toHaveBeenCalledWith(fakeAnswers);

    expect(generateEcsConfig).toHaveBeenCalledTimes(1);
    expect(generateEcsConfig).toHaveBeenCalledWith(fakeAnswers);

    expect(generateDatabaseConfig).toHaveBeenCalledTimes(1);
    expect(generateDatabaseConfig).toHaveBeenCalledWith(fakeAnswers);
  });

  it('should log the correct sequence of messages to the console', async () => {
    (inquirer.prompt as unknown as jest.Mock).mockResolvedValue(fakeAnswers);

    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});

    await runInitInteractive();

    const normalize = (s: string) => String(s).replace(/\s+/g, ' ').trim();
    const normalizedCalls = infoSpy.mock.calls.map((c) => normalize(c[0]));

    const expected = [
      'Welcome to Auto-Infra!',
      'This tool will guide you through creating infrastructure configuration for your project.',
      `Initializing project ${fakeAnswers.projectName} in ${fakeAnswers.awsRegion}...`,
      'Interactive initialization complete.',
    ];

    expect(normalizedCalls).toEqual(expected);

    infoSpy.mockRestore();
  });

  it('should throw an error and not call any services if the user cancels the prompt', async () => {
    (inquirer.prompt as unknown as jest.Mock).mockRejectedValue(
      new Error('User cancelled'),
    );

    await expect(runInitInteractive()).rejects.toThrow('User cancelled');

    expect(generateVpcConfig).not.toHaveBeenCalled();
    expect(generateEcsConfig).not.toHaveBeenCalled();
    expect(generateDatabaseConfig).not.toHaveBeenCalled();
  });
});
