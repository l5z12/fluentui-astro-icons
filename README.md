# fluentui-astro-icons

Microsoft's Fluent System Icons as real `<svg>` in Astro HTML. No client
JavaScript, custom elements, or Shadow DOM.

This is an independent wrapper, not an official Microsoft package. The artwork
is from [Fluent System Icons](https://github.com/microsoft/fluentui-system-icons),
served through [fluentui-web-icons](https://www.npmjs.com/package/fluentui-web-icons)
`1.1.339`. Family data is imported on the server; the page gets markup.

[![npm](https://img.shields.io/npm/v/fluentui-astro-icons.svg)](https://www.npmjs.com/package/fluentui-astro-icons)
[![license](https://img.shields.io/npm/l/fluentui-astro-icons.svg)](LICENSE)

The web-component sibling is [fluentui-web-icons](https://github.com/l5z12/fluentui-web-icons)
([explorer](https://icons.l5z12.dev)). Use that when you want `<fluent-icon>` in
the browser. Use this package when Astro should bake SVG into the HTML.

## Install

```sh
npm install fluentui-astro-icons
```

Also works with `pnpm add`, `yarn add`, and `bun add`. Peer: Astro 4 or later.
Designed for static builds and Node SSR.

## Quick start

```astro
---
import Icon from 'fluentui-astro-icons';
---
<Icon name="home" />
<Icon name="mail" variant="color" size={32} label="Inbox" />
<Icon name="arrow-left" flipRtl />
```

Do **not** add `client:*` to this component. It loads families with Node APIs
and must stay on the server. Unknown or invalid names throw at build time.

Each family is one module (`home` never loads `mail`). Markup is an `<svg>`
element: `viewBox`, paths, and color trees (gradients, filters, clipping) match
`fluentui-web-icons`. Repeated color icons get unique ID prefixes so paint
servers do not clash.

### Markup helper

```ts
import { renderIcon } from 'fluentui-astro-icons/render';

const html = await renderIcon({ name: 'home', size: 24, label: 'Home' });
```

If you use `flipRtl` with the helper, include the same CSS `Icon.astro` emits:

```css
svg.fluent-icon[flip-rtl]:dir(rtl) {
  transform: scaleX(-1);
}
```

## Component API

| Prop | Default | Behavior |
| --- | --- | --- |
| `name` | required | Kebab-case family; upstream underscores also work. |
| `variant` | `regular` | `regular`, `filled`, or `color`; invalid values use regular. |
| `size` | `undefined` | Positive pixel size; omission/invalid values use `1em`. |
| `label` | `''` | Accessible name; omit for decorative icons. |
| `flipRtl` | `false` | Mirrors when inherited direction is RTL, via CSS `:dir(rtl)`. |

The optical design defaults to 24. An explicit size selects the nearest
available design in that variant; ties prefer the larger design. Missing
variants fall back to regular, then filled, then color. Original SVG view
boxes are kept.

### Styling and accessibility

```css
.fluent-icon {
  color: rebeccapurple;
  --fluent-icon-size: 1.5rem;
}
```

`--fluent-icon-size` overrides visual size only; use the `size` prop to choose
the optical design. Monochrome paths inherit `currentColor`. The `color`
variant keeps its original palette.

Give meaningful standalone icons a `label`. For icon-only buttons, label the
**button** and leave the icon decorative:

```astro
<button aria-label="Open inbox">
  <Icon name="mail" size={20} />
</button>
```

Mirroring is opt-in. Some upstream icons have distinct RTL artwork; use those
named families instead of flipping them.

## Playground

```sh
bun install
bun run dev
```

```sh
bun run check
bun run verify:package
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for pull requests and [SECURITY.md](SECURITY.md)
for vulnerability reports.

## Release

The first npm version has to be published from a maintainer machine. npm
cannot attach [trusted publishers](https://docs.npmjs.com/trusted-publishers/)
until the package exists.

```sh
npm login
bun run verify:package
bun run release:first
```

Then add trusted publishers on npm for this repository and both `publish.yml`
and `sync-icons.yml`. Provenance needs a public GitHub repository. After that,
later versions publish from GitHub Actions.

This package's version **matches `fluentui-web-icons`**. Every six hours,
`.github/workflows/sync-icons.yml` checks npm, updates when that package
publishes, tags `v{version}`, and publishes — only once this package is already
on the registry.

```sh
git tag v1.1.339
git push origin v1.1.339
```

## License

MIT for the wrapper and Microsoft artwork. See [LICENSE](LICENSE) and
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
