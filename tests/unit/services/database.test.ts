jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

import * as fs from 'node:fs/promises';

import { generateDatabaseConfig } from '../../../services/database.js';
import { mustExist } from '../../utils/assertions.js';
import { createTestAnswers } from '../../utils/createTestAnswers.js';

describe('generateDatabaseConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should write db.tfvars and secrets.db.tfvars files with correct content', async () => {
    const answers = createTestAnswers({
      projectName: 'db-project',
      awsRegion: 'us-east-2',
      dbEngine: 'postgresql',
      dbInstanceSize: 'small',
      dbUsername: 'dbadmin',
      dbPassword: 'supersecret',
    });

    await generateDatabaseConfig(answers);

    const mkdirMock = jest.mocked(fs.mkdir);
    const writeFileMock = jest.mocked(fs.writeFile);

    expect(mkdirMock).toHaveBeenCalledTimes(1);
    expect(mkdirMock).toHaveBeenCalledWith(`./${answers.projectName}`, {
      recursive: true,
    });

    const writeCalls = writeFileMock.mock.calls as Array<[string, string]>;
    const nonSecretCall = mustExist(
      writeCalls.find((c) => String(c[0]).endsWith('/db.tfvars')),
    );
    const secretCall = mustExist(
      writeCalls.find((c) => String(c[0]).endsWith('/secrets.db.tfvars')),
    );

    const [, nonSecretContent] = nonSecretCall as [string, string];
    const [, secretContent] = secretCall as [string, string];

    expect(nonSecretContent).toMatchSnapshot('db-non-sensitive');
    expect(secretContent).toMatchSnapshot('db-sensitive');
  });

  it('should apply defaults when engine/size are missing', async () => {
    const answers = createTestAnswers({ projectName: 'db-defaults' });
    // remove optional properties so defaults apply
    delete (answers as Partial<typeof answers>).dbEngine;
    delete (answers as Partial<typeof answers>).dbInstanceSize;

    await generateDatabaseConfig(answers);

    const writeFileMock = jest.mocked(fs.writeFile);
    const writeCalls = writeFileMock.mock.calls as Array<[string, string]>;
    const nonSecretCall = mustExist(
      writeCalls.find((c) => String(c[0]).endsWith('/db.tfvars')),
    );
    const [, nonSecretContent] = nonSecretCall as [string, string];

    expect(String(nonSecretContent)).toContain('db_engine = "postgresql"');
    expect(String(nonSecretContent)).toContain(
      'db_instance_class = "db.t4g.small"',
    );
  });
});
