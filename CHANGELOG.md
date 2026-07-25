# Changelog

All notable changes to the epithet.json specification are documented here. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the
spec is versioned per its own [versioning policy](./spec/v1/spec.md#4-versioning-policy).

## [1.0.0] — 2026-07-24

Initial public release of the epithet.json open standard.

### Added

- **Spec v1** — [`spec/v1/spec.md`](./spec/v1/spec.md): the human-readable field
  reference covering `$schema`, `$version`, `mood`, `rationale`, `palette`,
  `typography`, `layout`, `cohesion`, and `principles`, with required/optional
  status, validation rules, Argus provenance mapping, and the versioning policy.
- **JSON Schema** — [`spec/v1/epithet.schema.json`](./spec/v1/epithet.schema.json):
  the authoritative machine artifact (JSON Schema draft 2020-12), a closed root
  identified by `https://epithet.brkdllc.com/schema/v1`.
- **Examples** — three worked, schema-valid documents:
  [`botanical-brand.json`](./examples/botanical-brand.json) (D2C),
  [`tech-startup.json`](./examples/tech-startup.json) (B2B SaaS), and
  [`editorial-magazine.json`](./examples/editorial-magazine.json) (publication).
- **Validator** — [`tools/validate.js`](./tools/validate.js): a zero-dependency
  Node.js validator that checks a document against the schema and reports
  field-level errors.

[1.0.0]: https://github.com/brkdllc/epithet/releases/tag/v1.0.0
