import type { IconGlyph, IconPath, IconSvgNode } from 'fluentui-web-icons';

const referencePattern = /^url\(#([\w-]+)\)$/;
let svgInstance = 0;

function escapeAttr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function serializeNodes(nodes: readonly IconSvgNode[], prefix: string): string {
  let html = '';
  for (const node of nodes) {
    let attrs = '';
    for (const [key, value] of Object.entries(node.attributes)) {
      const resolved = key === 'id' ? prefix + value : value.replace(referencePattern, `url(#${prefix}$1)`);
      attrs += ` ${key}="${escapeAttr(resolved)}"`;
    }
    const children = node.children?.length ? serializeNodes(node.children, prefix) : '';
    html += `<${node.tag}${attrs}>${children}</${node.tag}>`;
  }
  return html;
}

function serializePaths(paths: readonly IconPath[]): string {
  let html = '';
  for (const data of paths) {
    let attrs = ` d="${escapeAttr(data.d)}"`;
    if (data.fillRule) attrs += ` fill-rule="${escapeAttr(data.fillRule)}"`;
    if (data.clipRule) attrs += ` clip-rule="${escapeAttr(data.clipRule)}"`;
    if (data.opacity !== undefined) attrs += ` opacity="${escapeAttr(String(data.opacity))}"`;
    if (data.fill !== undefined) attrs += ` fill="${escapeAttr(data.fill)}"`;
    if (data.stroke !== undefined) attrs += ` stroke="${escapeAttr(data.stroke)}"`;
    html += `<path${attrs}></path>`;
  }
  return html;
}

export interface SerializeGlyphOptions {
  label?: string;
  size?: number;
  flipRtl?: boolean;
}

/** Serialize a glyph to an inline SVG string. IDs are unique per call. */
export function serializeGlyph(glyph: IconGlyph, options: SerializeGlyphOptions = {}): string {
  const prefix = `fi${++svgInstance}-`;
  const viewBox = glyph.viewBox?.join(' ') ?? `0 0 ${glyph.size} ${glyph.size}`;
  const label = options.label?.trim() ?? '';
  const style = [
    options.size !== undefined ? `--_fluent-icon-size:${options.size}px` : undefined,
    'display:inline-flex',
    'flex:none',
    'width:var(--fluent-icon-size,var(--_fluent-icon-size,1em))',
    'height:var(--fluent-icon-size,var(--_fluent-icon-size,1em))',
    'vertical-align:-0.125em',
    'overflow:hidden',
    'color:inherit',
    glyph.fill !== undefined ? `fill:${glyph.fill}` : 'fill:currentColor',
  ].filter((part): part is string => part !== undefined).join(';');

  const attrs = [
    'class="fluent-icon"',
    `viewBox="${escapeAttr(viewBox)}"`,
    'focusable="false"',
    label
      ? `role="img" aria-label="${escapeAttr(label)}"`
      : 'aria-hidden="true"',
    options.flipRtl ? 'flip-rtl' : undefined,
    `style="${escapeAttr(style)}"`,
  ].filter((part): part is string => part !== undefined);

  return `<svg ${attrs.join(' ')}>${serializePaths(glyph.paths)}${glyph.nodes ? serializeNodes(glyph.nodes, prefix) : ''}</svg>`;
}

/** CSS used by Icon.astro so flipRtl mirrors under inherited RTL without JavaScript. */
export const flipRtlCss = 'svg.fluent-icon[flip-rtl]:dir(rtl){transform:scaleX(-1)}';
