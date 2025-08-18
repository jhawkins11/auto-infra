jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  readFile: jest.fn().mockRejectedValue(new Error('not found')),
}));

import * as fs from 'node:fs/promises';

import { generateVpcConfig } from '../../../services/vpc.js';
import { InitAnswers } from '../../../types/prompts.js';

describe('generateVpcConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a vpc.tfvars file with the correct content', async () => {
    const answers = {
      projectName: 'test-project',
      awsRegion: 'us-west-2',
      domain: 'example.org',
    } as InitAnswers;

    await generateVpcConfig(answers);

    const mkdirMock = fs.mkdir as unknown as jest.Mock;
    const writeFileMock = fs.writeFile as unknown as jest.Mock;

    expect(mkdirMock).toHaveBeenCalledTimes(1);
    expect(mkdirMock).toHaveBeenCalledWith(`./${answers.projectName}`, {
      recursive: true,
    });

    // find the writeFile call that wrote the vpc.tfvars file
    const vpcCall = writeFileMock.mock.calls.find((c: any[]) =>
      String(c[0]).endsWith('/vpc.tfvars'),
    );
    expect(vpcCall).toBeDefined();

    const [pathArg, contentArg] = vpcCall;
    expect(pathArg).toBe(`./${answers.projectName}/vpc.tfvars`);
    expect(contentArg).toMatchSnapshot();
  });
});
