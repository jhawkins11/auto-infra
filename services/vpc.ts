import { InitAnswers } from '../types/prompts.js';
import {
  ensureDirectoryExists,
  ensureGitignoreHasTerraformIgnores,
  writeConfigFile,
} from './fileWriter.js';

export const generateVpcConfig = async (
  answers: InitAnswers,
): Promise<void> => {
  const configDirectory = `./${answers.projectName}`;
  const vpcConfigPath = `${configDirectory}/vpc.tfvars`;

  const vpcConfig = {
    project_name: answers.projectName,
    aws_region: answers.awsRegion,
    ...(answers.domain && { domain_name: answers.domain }),
  };

  await ensureDirectoryExists(vpcConfigPath);
  await writeConfigFile(vpcConfigPath, vpcConfig);
  await ensureGitignoreHasTerraformIgnores(configDirectory);
  console.info('VPC configuration generated.');
};
