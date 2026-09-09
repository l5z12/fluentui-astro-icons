# Security

Please report vulnerabilities privately. Do not open a public issue.

Use [GitHub private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repository if it is enabled, or email the maintainers through the GitHub profile that owns the package.

This library inlines SVG from published `fluentui-web-icons` family modules. Reports that matter most:

- Script execution, external resource loads, or unexpected network access from icon data.
- Path traversal or loader imports outside `fluentui-web-icons/dist/generated/icons/`.
- Supply-chain issues in the publish workflow.

Artwork issues that are not specific to this wrapper should also be reported to
`fluentui-web-icons` or Microsoft's Fluent System Icons.
