jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

import * as fs from 'node:fs/promises';

import { generateVpcConfig } from '../../../services/vpc.js';
import { mustExist } from '../../utils/assertions.js';
import { createTestAnswers, createTestAnswersOmit } from '../../utils/createTestAnswers.js';

describe('generateVpcConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a vpc.tfvars file with the correct content', async () => {
    const answers = createTestAnswers({
      projectName: 'test-project',
      awsRegion: 'us-west-2',
      domain: 'example.org',
    });

    await generateVpcConfig(answers);

    const mkdirMock = jest.mocked(fs.mkdir);
    const writeFileMock = jest.mocked(fs.writeFile);

    expect(mkdirMock).toHaveBeenCalledTimes(1);
    expect(mkdirMock).toHaveBeenCalledWith(`./${answers.projectName}`, {
      recursive: true,
    });

    // find the writeFile call that wrote the vpc.tfvars file
    const writeCalls = writeFileMock.mock.calls as Array<[string, string]>;
    const vpcCall = writeCalls.find((c) =>
      String(c[0]).endsWith('/vpc.tfvars'),
    );
    if (!vpcCall) {
      throw new Error('vpc.tfvars not written');
    }
    const [pathArgument, contentArgument] = vpcCall as [string, string];
    expect(pathArgument).toBe(`./${answers.projectName}/vpc.tfvars`);
    expect(contentArgument).toMatchSnapshot();
  });

  it('should omit domain_name when domain is not provided', async () => {
    // create an answers object without the domain to simulate missing optional field
    const answersWithoutDomain = createTestAnswersOmit(['domain'], {
      projectName: 'no-domain',
    });

    await generateVpcConfig(answersWithoutDomain);

    const writeFileMock = jest.mocked(fs.writeFile);
    const writeCalls = writeFileMock.mock.calls as Array<[string, string]>;
    const vpcCall = mustExist(
      writeCalls.find((c) => String(c[0]).endsWith('/vpc.tfvars')),
    );
    const [, contentArgument] = vpcCall as [string, string];

    expect(String(contentArgument)).not.toContain('domain_name');
  });
});
