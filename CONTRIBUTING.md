# Contributing

Thanks for helping with this unofficial Fluent System Icons Astro wrapper.

## Setup

Install [Bun](https://bun.sh) 1.3.14 or later (see `.bun-version`).

```sh
bun install
bun run dev
```

The playground is the Astro app under `playground/`. Pushing `main` deploys it
to [GitHub Pages](https://l5z12.github.io/fluentui-astro-icons/).

## What belongs here

- Server-side SVG rendering, the Astro `<Icon>` component, tests, and packaging.
- Bug reports against this wrapper (markup, accessibility, types, publish).

New artwork, missing sizes, and icon design issues belong in
[microsoft/fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons).
Runtime `<fluent-icon>` issues belong in
[fluentui-web-icons](https://github.com/l5z12/fluentui-web-icons).

Do not add client `<script>` tags or `client:*` usage to `Icon.astro`.

## Checks

```sh
bun run check
bun run verify:package
```

The package version must match the installed `fluentui-web-icons` version.
The first npm release is `bun run release:first` after `npm login`. Later icon
catalog updates are automated once trusted publishers are configured.

## License

Contributions are MIT, same as [LICENSE](LICENSE). Upstream SVG artwork remains
Microsoft's MIT-licensed Fluent System Icons.
