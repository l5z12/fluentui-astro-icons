import { join, resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const upstream = await Bun.file(join(root, 'node_modules/fluentui-web-icons/package.json')).json();
const version = String(upstream.version ?? '');
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Unexpected fluentui-web-icons version: ${version}`);

const packagePath = join(root, 'package.json');
const pkg = await Bun.file(packagePath).json();
if (pkg.version !== version || pkg.dependencies['fluentui-web-icons'] !== version) {
  pkg.version = version;
  pkg.dependencies = { ...pkg.dependencies, 'fluentui-web-icons': version };
  await Bun.write(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
}

const readmePath = join(root, 'README.md');
const readme = await Bun.file(readmePath).text();
await Bun.write(readmePath, readme.replace(/`\d+\.\d+\.\d+`\. Family data/, `\`${version}\`. Family data`));

const changelogPath = join(root, 'CHANGELOG.md');
const changelog = await Bun.file(changelogPath).text();
const heading = `## ${version}`;
if (!changelog.includes(`\n${heading}\n`) && !changelog.startsWith(`${heading}\n`)) {
  const entry = `${heading}\n\n- Sync icon artwork from \`fluentui-web-icons\` ${version}.\n`;
  await Bun.write(changelogPath, changelog.replace('# Changelog\n', `# Changelog\n\n${entry}`));
}
console.log(`Package version set to ${version} to match fluentui-web-icons.`);
