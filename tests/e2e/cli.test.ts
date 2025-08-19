import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const buildCliPath = path.resolve(__dirname, '../../build/bin/index.js');

describe('Auto-Infra CLI end-to-end test', () => {
  it('should successfully run the interactive session and create the project directory and config files', async () => {
    // Create an isolated temporary directory
    const temporaryDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'auto-infra-e2e-'),
    );
    const projectName = 'e2e-test-project';
    const projectDirectory = path.join(temporaryDirectory, projectName);

    // Answers must match the input order of `initQuestions`
    const answers = [
      projectName, // projectName
      'us-east-1', // awsRegion
      '', // domain
      'nginx:latest', // containerImageUrl
      '3000', // containerPort
      '', // ecsTaskSize (enter for default 'small')
      '2', // desiredCount
      '/healthz', // healthCheckPath
      '', // dbEngine (default 'postgresql')
      '', // dbInstanceSize (default 'small')
      'admin', // dbUsername
      'StrongP@ssw0rd!', // dbPassword
    ];

    // Spawn the CLI process and pipe stdin, stdout, and stderr.
    const child = spawn(process.execPath, [buildCliPath, 'init'], {
      cwd: temporaryDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, HOME: temporaryDirectory },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Wait for each prompt to appear before sending its answer
    const expectedPrompts = [
      /Project name:/,
      /AWS region:/,
      /Domain to use \(optional\):/,
      /Container image URL \(Docker Hub or ECR\):/,
      /Container port to expose:/,
      /ECS task size:/,
      /Desired number of container instances:/,
      /Application health check path:/,
      /Database engine:/,
      /Database instance size:/,
      /Database username:/,
      /Database password:/,
    ];

    // Poll stdout for the expected prompt to synchronize
    // test input with the CLI prompt output.
    const waitForPrompt = (regex: RegExp, timeout = 5000) =>
      new Promise<void>((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
          if (regex.test(stdout)) {
            clearInterval(interval);
            resolve();
            return;
          }
          if (Date.now() - start > timeout) {
            clearInterval(interval);
            reject(new Error(`Timed out waiting for prompt: ${regex}`));
          }
        }, 50);
      });

    for (let index = 0; index < answers.length; index++) {
      const promptRegex = expectedPrompts[index];
      if (!promptRegex) {
        throw new Error(
          `No expected prompt registered for answer index ${index}`,
        );
      }
      // wait for the CLI to print the prompt before sending the answer
      await waitForPrompt(promptRegex);
      child.stdin.write(`${answers[index]}\n`);
    }

    // Close stdin to signal end of input
    child.stdin.end();

    // Wait for the CLI process to exit so we can assert success and inspect
    // any generated files.
    const exitCode: number = await new Promise((resolve) => {
      child.on('close', (code) => resolve(typeof code === 'number' ? code : 1));
    });

    if (exitCode !== 0) {
      // If the CLI fails, print captured output to aid debugging in CI.
      console.error('CLI process exited with code', exitCode);
      console.error('STDOUT:\n', stdout);
      console.error('STDERR:\n', stderr);
    }

    expect(exitCode).toBe(0);

    // Verify the interactive greeting and that prompts were printed.
    expect(stdout).toMatch(/Welcome to Auto-Infra/);
    expect(stdout).toMatch(/Project name:/);

    // Check that project directory and expected files exist
    expect(fs.existsSync(projectDirectory)).toBe(true);
    expect(fs.existsSync(path.join(projectDirectory, 'vpc.tfvars'))).toBe(true);
    expect(fs.existsSync(path.join(projectDirectory, 'ecs.tfvars'))).toBe(true);
    expect(fs.existsSync(path.join(projectDirectory, 'db.tfvars'))).toBe(true);

    // Confirm the CLI created Terraform variable files for the project.
    const files = fs.readdirSync(projectDirectory);
    const tfvars = files.filter((f: string) => f.endsWith('.tfvars'));
    expect(tfvars.length).toBeGreaterThan(0);

    // Ensure generated tfvars are non-empty to validate file writing.
    const firstTfvar = tfvars[0];
    if (!firstTfvar) {
      throw new Error('Expected at least one .tfvars file to be generated');
    }

    const sample = path.join(projectDirectory, firstTfvar);
    const content = fs.readFileSync(sample, 'utf8');
    expect(content.length).toBeGreaterThan(0);

    // Assert that the vpc.tfvars file specifically contains the expected
    // project name to ensure values are written into the correct file.
    const vpcPath = path.join(projectDirectory, 'vpc.tfvars');
    expect(fs.existsSync(vpcPath)).toBe(true);
    const vpcContent = fs.readFileSync(vpcPath, 'utf8');
    const projectNamePattern = `project_name\\s*=\\s*"${projectName}"`;
    expect(vpcContent).toMatch(new RegExp(projectNamePattern));

    // Remove the temporary workspace to avoid leaving artifacts.
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }, 20000);
});
