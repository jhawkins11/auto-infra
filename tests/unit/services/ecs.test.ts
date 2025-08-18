jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

import * as fs from 'node:fs/promises';

import { generateEcsConfig } from '../../../services/ecs.js';
import { mustExist } from '../../utils/assertions.js';
import { createTestAnswers } from '../../utils/createTestAnswers.js';

describe('generateEcsConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should write an ecs.tfvars file with the correct content', async () => {
    const answers = createTestAnswers({
      projectName: 'ecs-project',
      awsRegion: 'us-west-1',
      ecsTaskSize: 'medium',
      containerImageUrl: 'ghcr.io/example/app:1.2.3',
      containerPort: 4000,
      desiredCount: 4,
      healthCheckPath: '/hc',
    });

    await generateEcsConfig(answers);

    const mkdirMock = jest.mocked(fs.mkdir);
    const writeFileMock = jest.mocked(fs.writeFile);

    expect(mkdirMock).toHaveBeenCalledTimes(1);
    expect(mkdirMock).toHaveBeenCalledWith(`./${answers.projectName}`, {
      recursive: true,
    });

    const writeCalls = writeFileMock.mock.calls as Array<[string, string]>;
    const ecsCall = writeCalls.find((c) =>
      String(c[0]).endsWith('/ecs.tfvars'),
    );
    if (!ecsCall) {
      throw new Error('ecs.tfvars not written');
    }
    const [pathArgument, contentArgument] = ecsCall as [string, string];
    expect(pathArgument).toBe(`./${answers.projectName}/ecs.tfvars`);
    expect(contentArgument).toMatchSnapshot();
  });

  it('should use default values when optional fields are missing', async () => {
    const answers = createTestAnswers({ projectName: 'ecs-defaults' });
    // remove optional fields
    delete (answers as Partial<typeof answers>).ecsTaskSize;
    delete (answers as Partial<typeof answers>).containerPort;

    await generateEcsConfig(answers);

    const writeFileMock = jest.mocked(fs.writeFile);
    const writeCalls = writeFileMock.mock.calls as Array<[string, string]>;
    const ecsCall = mustExist(
      writeCalls.find((c) => String(c[0]).endsWith('/ecs.tfvars')),
    );
    const [, contentArgument] = ecsCall as [string, string];

    expect(String(contentArgument)).toContain('task_cpu');
    expect(String(contentArgument)).toContain('task_memory');
    expect(String(contentArgument)).toContain('container_port = 3000');
  });
});
