import { normalizeIconName, selectGlyph } from 'fluentui-web-icons';
import type { IconDefinition, IconGlyph, IconName, IconSvgNode, IconVariant } from 'fluentui-web-icons';
import { loadIconDefinition } from './load.ts';
import { serializeGlyph } from './serialize.ts';

export { normalizeIconName, selectGlyph } from 'fluentui-web-icons';
export { flipRtlCss } from './serialize.ts';
export type { IconDefinition, IconGlyph, IconName, IconSvgNode, IconVariant };

export interface RenderIconOptions {
  name: string;
  variant?: IconVariant | string;
  size?: number | string;
  label?: string;
  flipRtl?: boolean;
}

function resolveSize(value: number | string | undefined): number | undefined {
  const size = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(size) && size > 0 ? size : undefined;
}

function resolveVariant(value: IconVariant | string | undefined): IconVariant {
  return value === 'filled' || value === 'color' ? value : 'regular';
}

/** Server-side SVG markup for one Fluent System Icon. Unknown names throw. */
export async function renderIcon(options: RenderIconOptions): Promise<string> {
  const name = normalizeIconName(String(options.name ?? ''));
  if (!name) throw new Error(`Unknown Fluent icon: ${String(options.name ?? '')}`);
  const definition = await loadIconDefinition(name);
  const size = resolveSize(options.size);
  const glyph = selectGlyph(definition, size ?? 24, resolveVariant(options.variant));
  if (!glyph) throw new Error(`No glyph available for ${name}`);
  return serializeGlyph(glyph, { label: options.label, size, flipRtl: Boolean(options.flipRtl) });
}
