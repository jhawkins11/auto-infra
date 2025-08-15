import { InitAnswers } from '../types/prompts.js';
import { ensureDirectoryExists, writeConfigFile } from './fileWriter.js';

const taskSizeToResources: Record<
  NonNullable<InitAnswers['ecsTaskSize']>,
  { cpu: number; memory: number }
> = {
  small: { cpu: 512, memory: 1024 },
  medium: { cpu: 1024, memory: 2048 },
  large: { cpu: 2048, memory: 4096 },
};

export const generateEcsConfig = async (
  answers: InitAnswers,
): Promise<void> => {
  const configDirectory = `./${answers.projectName}`;
  const ecsConfigPath = `${configDirectory}/ecs.tfvars`;

  const resources = taskSizeToResources[answers.ecsTaskSize ?? 'small'];

  const ecsConfig = {
    project_name: answers.projectName,
    aws_region: answers.awsRegion,
    container_image: answers.containerImageUrl ?? '',
    container_port: Number(answers.containerPort ?? 3000),
    task_cpu: resources.cpu,
    task_memory: resources.memory,
    desired_count: Number(answers.desiredCount ?? 2),
    health_check_path: answers.healthCheckPath ?? '/healthz',
  };

  await ensureDirectoryExists(ecsConfigPath);
  await writeConfigFile(ecsConfigPath, ecsConfig);
};
