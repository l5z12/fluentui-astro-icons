import { describe, expect, test } from 'bun:test';
import { renderIcon } from '../src/render.ts';

describe('renderIcon', () => {
  test('regular icons serialize to inline SVG with inherited color and 1em size', async () => {
    const html = await renderIcon({ name: 'home' });
    expect(html.startsWith('<svg ')).toBe(true);
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('focusable="false"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('fill:currentColor');
    expect(html).toContain('width:var(--fluent-icon-size,var(--_fluent-icon-size,1em))');
    expect(html).toContain('<path d="');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('fluent-icon>');
    expect(html).not.toContain('role="img"');
  });

  test('color icons keep gradients and unique IDs across repeats', async () => {
    const first = await renderIcon({ name: 'mail', variant: 'color', size: 24, label: 'Inbox' });
    const second = await renderIcon({ name: 'mail', variant: 'color', size: 24 });
    expect(first).toContain('role="img"');
    expect(first).toContain('aria-label="Inbox"');
    expect(first).toContain('linearGradient');
    expect(first).toContain('fill:none');
    expect(first).toContain('--_fluent-icon-size:24px');

    const ids = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]!);
    const refs = (html: string) => [...html.matchAll(/url\(#([^)]+)\)/g)].map((match) => match[1]!);
    const firstIds = ids(first);
    const secondIds = ids(second);
    expect(firstIds.length).toBeGreaterThan(0);
    expect(new Set(firstIds).size).toBe(firstIds.length);
    expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
    for (const ref of refs(first)) expect(firstIds).toContain(ref);
    for (const ref of refs(second)) expect(secondIds).toContain(ref);
  });

  test('unknown and invalid names throw at build time', async () => {
    await expect(renderIcon({ name: 'not-a-real-fluent-icon' })).rejects.toThrow('Unknown Fluent icon');
    await expect(renderIcon({ name: '../home' })).rejects.toThrow('Unknown Fluent icon');
    await expect(renderIcon({ name: '' })).rejects.toThrow('Unknown Fluent icon');
    await expect(renderIcon({ name: '__proto__' })).rejects.toThrow('Unknown Fluent icon');
  });

  test('labels are HTML-escaped and flipRtl is a CSS hook, not JavaScript', async () => {
    const html = await renderIcon({ name: 'arrow-left', flipRtl: true, label: 'Go "home" <here>' });
    expect(html).toContain('flip-rtl');
    expect(html).toContain('aria-label="Go &quot;home&quot; &lt;here&gt;"');
    expect(html).not.toContain('dir=');
    expect(html).not.toContain('<script');
  });
});
