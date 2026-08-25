# epithet.json

**An open, machine-readable creative-identity format.** One `epithet.json`
document describes a creative identity — a brand, character, persona, product,
or place — through its palette, typography, layout, mood, cohesion, and
composition principles, precisely enough for an AI agent to generate output that
stays true to that identity without a human translating it into a prompt. It is
the contract between a creative identity and the agents that create for it.

> **Define any identity once — brand, character, persona, or product — and every
> agent speaks the same language.**

- **Spec:** [`spec/v1/spec.md`](./spec/v1/spec.md)
- **Schema:** [`spec/v1/epithet.schema.json`](./spec/v1/epithet.schema.json) (JSON Schema draft 2020-12)
- **Examples:** [`examples/`](./examples/)
- **Reference implementation:** [Argus](https://argus.build) — every identity analysis exports a valid `epithet.json`.

---

## Who is it for?

Anyone who needs an AI agent to create *as* a consistent identity — not just brands.

- **Brand teams** — hand every agent one file and get on-brand decks, social
  posts, and landing pages without re-briefing the look each time.
- **Game & film studios** — pin a *character's* visual identity (a hero's
  palette, a faction's typography) so concept art and marketing stay in canon.
- **Content creators** — define a *persona's* look once and keep thumbnails,
  channel art, and shorts recognizably yours across every tool.
- **Product & place** — capture a product line or a venue's identity so its
  visuals hold together wherever they're generated.

Same schema, different subject. `epithet.json` describes the identity; the agent
does the creating.

---

## Why not just design tokens?

Design tokens ([W3C DTCG](https://www.designtokens.org/)) answer *"what is the
value of `color.brand.primary`?"* They are the atoms a UI is built from, resolved
by a human designer who already knows the intent.

epithet.json answers a different question: *"what is this identity, and how should
an agent create for it?"* It carries the **intent** a token file assumes you
already have — which color draws the eye and why, how tightly the system should
hold together, the composition rules the identity never breaks. It is written
**for a model to read before it generates**, not for a build pipeline to compile.

| | Design tokens | epithet.json |
|---|---|---|
| **Question answered** | What is this value? | What is this identity, and how do I create for it? |
| **Primary consumer** | Build tools, humans | AI generation agents |
| **Unit** | Atomic value (`#4f7cff`) | Named role + semantics ("accent — the single action color") |
| **Carries intent?** | No — values only | Yes — `rationale`, `semantic`, `principles`, `mood` |
| **Cohesion / constraints** | Out of scope | First-class (`cohesion`, `principles`) |
| **Honest empty states** | N/A | `cohesion: null` when there wasn't enough signal |
| **Scope** | One design system's values | An identity's whole creative direction |

They are complementary. Tokens are the resolved values; epithet.json is the
direction an agent needs to *choose* values that stay true to the identity.

---

## Quickstart

A minimal valid document needs five keys — `$schema`, `$version`, `rationale`,
`palette`, and `typography` (the last two may be empty arrays):

```json
{
  "$schema": "https://epithet.brkdllc.com/schema/v1",
  "$version": "1.0",
  "rationale": "Warm, editorial, grounded — a single serif and a rationed rust accent.",
  "palette": [
    { "role": "background", "color": "#faf6f0", "semantic": "Warm paper — the base canvas." },
    { "role": "accent", "color": "#b4471f", "semantic": "Rust — rationed for links and calls to action." }
  ],
  "typography": [
    { "role": "heading", "family": "Fraunces", "semantic": "A high-contrast serif for editorial headlines." }
  ]
}
```

See [`examples/`](./examples/) for three fully-worked documents: a D2C
[botanical brand](./examples/botanical-brand.json), a B2B SaaS
[tech startup](./examples/tech-startup.json), and an
[editorial magazine](./examples/editorial-magazine.json).

## Field reference

Every field, its type, whether it's required, and its validation rules are
documented in **[`spec/v1/spec.md`](./spec/v1/spec.md)**. The
[JSON Schema](./spec/v1/epithet.schema.json) is authoritative where the two ever
disagree.

## Validate a document

A zero-dependency Node.js validator ships in this repo — no `npm install`:

```bash
node tools/validate.js my-identity.json
```

It prints a pass/fail summary with field-level errors and exits `0` on pass,
`1` on fail:

```
PASS  my-identity.json
  valid epithet.json (v1)
```

You can also validate against the schema with any compliant JSON Schema
validator (e.g. [ajv](https://ajv.js.org/)) — see [§5 of the spec](./spec/v1/spec.md#5-validation).

## Reference implementation

[**Argus**](https://argus.build) is the reference implementation. Every identity
analysis Argus produces exports a valid `epithet.json`, and Argus consumes the
format to generate deliverables that stay true to the source. If you want to see
the format produced from a real identity, that's the fastest path.

## Contributing

The spec is open and governed in the open.

- **Found a bug or gap?** Open an issue.
- **Have a field proposal?** Open an issue that references the relevant section of
  [`spec/v1/spec.md`](./spec/v1/spec.md), describes the field, and explains what
  an agent does with it that it can't do today. Additive, backward-compatible
  proposals target a minor version; see the
  [versioning policy](./spec/v1/spec.md#4-versioning-policy).
- **PRs welcome** for the spec text, schema, examples, and tooling. Keep examples
  schema-valid — run `node tools/validate.js` before you open the PR.

## License

[MIT](./LICENSE). Use it, extend it, build on it.
