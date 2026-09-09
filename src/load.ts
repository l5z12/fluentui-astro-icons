import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizeIconName } from 'fluentui-web-icons';
import type { IconDefinition } from 'fluentui-web-icons';

const require = createRequire(import.meta.url);
const iconNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const loaded = new Map<string, Promise<IconDefinition>>();

function iconsDirectory(): string {
  return join(dirname(require.resolve('fluentui-web-icons/package.json')), 'dist', 'generated', 'icons');
}

function iconFile(name: string): string {
  const file = join(iconsDirectory(), `${name}.js`);
  if (basename(file, '.js') !== name) throw new Error(`Unknown Fluent icon: ${name}`);
  return file;
}

async function importIcon(name: string): Promise<IconDefinition> {
  try {
    const href = pathToFileURL(iconFile(name)).href;
    const module = await import(/* @vite-ignore */ href) as { default?: IconDefinition };
    const definition = module.default;
    if (!definition || normalizeIconName(definition.name) !== name) {
      throw new Error(`Unknown Fluent icon: ${name}`);
    }
    return definition;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unknown Fluent icon:')) throw error;
    throw new Error(`Unknown Fluent icon: ${name}`);
  }
}

/** Load one published family module. Invalid names throw; failed loads are retryable. */
export function loadIconDefinition(name: string): Promise<IconDefinition> {
  const id = normalizeIconName(name);
  if (!iconNamePattern.test(id)) throw new Error(`Unknown Fluent icon: ${name}`);
  let pending = loaded.get(id);
  if (!pending) {
    pending = importIcon(id);
    loaded.set(id, pending);
    pending.catch(() => {
      if (loaded.get(id) === pending) loaded.delete(id);
    });
  }
  return pending;
}
