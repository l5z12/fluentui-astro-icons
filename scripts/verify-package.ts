import { mkdtemp, rm } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dir, '..');
const temporary = await mkdtemp(join(tmpdir(), 'fluent-astro-icons-consumer-'));
const npm = Bun.which('npm') ?? 'npm';

async function run(command: string[], cwd = temporary) {
  const child = Bun.spawn(command, { cwd, stdout: 'pipe', stderr: 'pipe' });
  const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited]);
  if (code !== 0) throw new Error(`${command.join(' ')} failed\n${stdout}\n${stderr}`);
  return stdout;
}

try {
  const packedManifest = await Bun.file(join(root, 'package.json')).json();
  await run([npm, 'pack', '--ignore-scripts', `--pack-destination=${temporary}`], root);
  const archive = join(temporary, `${packedManifest.name}-${packedManifest.version}.tgz`);
  if (!await Bun.file(archive).exists()) throw new Error(`npm pack did not write ${archive}`);
  await Bun.write(join(temporary, 'package.json'), JSON.stringify({
    name: 'fluent-astro-icons-consumer',
    private: true,
    type: 'module',
    dependencies: { 'fluentui-astro-icons': `file:${archive.replaceAll('\\', '/')}` },
  }));
  await run([npm, 'install', '--ignore-scripts', '--no-fund', '--no-audit']);
  const packedRoot = join(temporary, 'node_modules/fluentui-astro-icons');
  for (const file of ['Icon.astro', 'src/render.ts', 'src/load.ts', 'src/serialize.ts', 'LICENSE', 'CHANGELOG.md', 'THIRD_PARTY_NOTICES.md', 'README.md']) {
    if (!await Bun.file(join(packedRoot, file)).exists()) throw new Error(`Missing published file: ${file}`);
  }
  if (await Bun.file(join(packedRoot, 'playground/src/pages/index.astro')).exists()) throw new Error('Package includes the playground');
  if (await Bun.file(join(packedRoot, 'scripts/publish-first.ts')).exists()) throw new Error('Package includes publish scripts');
  if (await Bun.file(join(packedRoot, 'tests/render.test.ts')).exists()) throw new Error('Package includes tests');
  const packedPackage = await Bun.file(join(packedRoot, 'package.json')).json();
  if (packedPackage.private) throw new Error('Package is marked private and cannot be published');
  if (packedPackage.type !== 'module') throw new Error('Published package must be ESM');
  if (packedPackage.license !== 'MIT') throw new Error('Published package must keep the MIT license');
  if (packedPackage.exports?.['.'] !== './Icon.astro') throw new Error('Package root export must be Icon.astro');
  const upstream = await Bun.file(join(root, 'node_modules/fluentui-web-icons/package.json')).json();
  if (packedPackage.version !== upstream.version) throw new Error(`Package version ${packedPackage.version} must match fluentui-web-icons ${upstream.version}`);
  if (packedPackage.dependencies?.['fluentui-web-icons'] !== upstream.version) {
    throw new Error(`Published dependency fluentui-web-icons ${packedPackage.dependencies?.['fluentui-web-icons']} must match ${upstream.version}`);
  }
  await Bun.write(join(temporary, 'consumer.ts'), `
import { renderIcon } from 'fluentui-astro-icons/render';
const html = await renderIcon({ name: 'home', size: 24, label: 'Home' });
if (!html.includes('<svg') || !html.includes('aria-label="Home"') || html.includes('<script')) throw new Error('Packed render export is broken');
`);
  await run(['bun', 'consumer.ts']);
  await run(['bun', 'x', '--no-install', 'publint', '--pack', 'npm'], root);
  const packedBytes = Bun.file(archive).size;
  if (packedBytes > 2 * 1024 * 1024) throw new Error(`Tarball is ${(packedBytes / 1024).toFixed(1)} KiB; the Astro wrapper should stay small`);
  console.log(`Packed consumer can import fluentui-astro-icons/render. Archive: ${(packedBytes / 1024).toFixed(1)} KiB.`);
} finally {
  const parent = resolve(tmpdir());
  if (!resolve(temporary).startsWith(parent + sep) || !temporary.split(sep).at(-1)?.startsWith('fluent-astro-icons-consumer-')) throw new Error('Unsafe cleanup path');
  await rm(temporary, { recursive: true, force: true });
}
