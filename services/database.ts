import { InitAnswers } from '../types/prompts.js';
import {
  ensureDirectoryExists,
  writeConfigFile,
  writeSecretsFile,
} from './fileWriter.js';

const instanceSizeToClass: Record<
  NonNullable<InitAnswers['dbInstanceSize']>,
  string
> = {
  micro: 'db.t4g.micro',
  small: 'db.t4g.small',
  medium: 'db.t4g.medium',
  large: 'db.t4g.large',
  xlarge: 'db.t4g.xlarge',
};

export const generateDatabaseConfig = async (
  answers: InitAnswers,
): Promise<void> => {
  const configDirectory = `./${answers.projectName}`;
  const databaseConfigPath = `${configDirectory}/db.tfvars`;
  const secretsConfigPath = `${configDirectory}/secrets.db.tfvars`;

  const engine = answers.dbEngine ?? 'postgresql';
  const sizeKey = answers.dbInstanceSize ?? 'small';

  const nonSensitive = {
    project_name: answers.projectName,
    aws_region: answers.awsRegion,
    db_engine: engine,
    db_instance_class: instanceSizeToClass[sizeKey],
  } as const;

  const sensitive = {
    db_username: answers.dbUsername ?? 'admin',
    db_password: answers.dbPassword ?? '',
  } as const;

  await ensureDirectoryExists(databaseConfigPath);
  await writeConfigFile(
    databaseConfigPath,
    nonSensitive as unknown as Record<string, string | number | boolean>,
  );
  await writeSecretsFile(
    secretsConfigPath,
    sensitive as unknown as Record<string, string | number | boolean>,
  );
};
