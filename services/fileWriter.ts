import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const writeConfigFile = async (
  filePath: string,
  data: Record<string, string | number | boolean>,
): Promise<void> => {
  const content = Object.entries(data)
    .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
    .join('\n');
  await fs.writeFile(filePath, content, 'utf8');
  console.info(`Configuration written to ${filePath}`);
};

export const writeSecretsFile = async (
  filePath: string,
  data: Record<string, string | number | boolean>,
): Promise<void> => {
  const content = Object.entries(data)
    .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
    .join('\n');
  await fs.writeFile(filePath, content, 'utf8');
  console.info(`Sensitive data written to ${filePath}`);
};

export const ensureDirectoryExists = async (
  filePath: string,
): Promise<void> => {
  const directoryName = path.dirname(filePath);
  await fs.mkdir(directoryName, { recursive: true });
};

export const ensureGitignoreHasTerraformIgnores = async (
  directoryPath: string,
): Promise<void> => {
  const gitignorePath = path.join(directoryPath, '.gitignore');

  let existing = '';
  try {
    existing = await fs.readFile(gitignorePath, 'utf8');
  } catch {
    existing = '';
  }

  const terraformIgnores = [
    '.terraform/',
    '*.tfstate',
    '*.tfstate.*',
    'crash.log',
    'crash.*.log',
    '.terraform.lock.hcl',
    '*.tfvars',
    '*.tfvars.json',
  ];

  const existingLines = new Set(existing.split('\n').map((l) => l.trimEnd()));

  const linesToAdd = terraformIgnores.filter(
    (entry) => !existingLines.has(entry),
  );
  if (linesToAdd.length === 0) {
    return;
  }

  const prefix = existing ? existing.replace(/\n?$/, '\n') : '';
  const newContent = `${prefix}${linesToAdd.join('\n')}\n`;
  await fs.writeFile(gitignorePath, newContent, 'utf8');
  console.info(`Updated ${gitignorePath} with Terraform ignores`);
};
