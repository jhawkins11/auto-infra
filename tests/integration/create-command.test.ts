jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

import inquirer from 'inquirer';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

import { runInitInteractive } from '../../commands/init.js';

describe('The "create" command flow', () => {
  it('should take user prompts and generate all the correct .tfvars files', async () => {
    const temporaryDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), 'auto-infra-int-'),
    );
    const originalCwd = process.cwd();
    process.chdir(temporaryDirectory);

    try {
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

      jest
        .mocked(inquirer.prompt)
        .mockResolvedValue(fakeAnswers as unknown as Record<string, unknown>);

      await runInitInteractive();

      const projectDirectory = path.join(
        temporaryDirectory,
        fakeAnswers.projectName,
      );

      const vpcPath = path.join(projectDirectory, 'vpc.tfvars');
      const ecsPath = path.join(projectDirectory, 'ecs.tfvars');
      const databasePath = path.join(projectDirectory, 'db.tfvars');

      const vpcContent = await fs.readFile(vpcPath, 'utf8');
      const ecsContent = await fs.readFile(ecsPath, 'utf8');
      const databaseContent = await fs.readFile(databasePath, 'utf8');

      const parseTfvars = (content: string): Record<string, unknown> =>
        Object.fromEntries(
          content
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .map((line) => {
              const index = line.indexOf(' = ');
              const key = line.slice(0, index).trim();
              const raw = line.slice(index + 3).trim();
              return [key, JSON.parse(raw)];
            }),
        );

      const actualVpc = parseTfvars(vpcContent);
      const actualEcs = parseTfvars(ecsContent);
      const actualDatabase = parseTfvars(databaseContent);

      const expectedVpcObject = {
        project_name: fakeAnswers.projectName,
        aws_region: fakeAnswers.awsRegion,
        domain_name: fakeAnswers.domain,
      } as const;

      const expectedEcsObject = {
        project_name: fakeAnswers.projectName,
        aws_region: fakeAnswers.awsRegion,
        container_image: fakeAnswers.containerImageUrl,
        container_port: Number(fakeAnswers.containerPort),
        task_cpu: 512,
        task_memory: 1024,
        desired_count: Number(fakeAnswers.desiredCount),
        health_check_path: fakeAnswers.healthCheckPath,
      } as const;

      const expectedDatabaseObject = {
        project_name: fakeAnswers.projectName,
        aws_region: fakeAnswers.awsRegion,
        db_engine: fakeAnswers.dbEngine,
        db_instance_class: 'db.t4g.small',
      } as const;

      expect(actualVpc).toEqual(expectedVpcObject);
      expect(actualEcs).toEqual(expectedEcsObject);
      expect(actualDatabase).toEqual(expectedDatabaseObject);
    } finally {
      process.chdir(originalCwd);
      await fs.rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
