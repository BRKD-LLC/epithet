# Roadmap

Shipping the core now. The protocol comes later.

Dates are targets, not guarantees. The spec is MIT-licensed and governed in the
open — field proposals are issues, and every phase can be shaped before it ships.

---

## v1.0 — Now · The Core Contract

Everything an agent needs to generate output that stays true to a creative
identity, from a single structured document.

### Core fields

| Field | What it adds | Why an agent cares |
|---|---|---|
| `palette` | Named color roles (`primary`, `accent`, `background`, …) with CSS values and a semantic note per color | The agent reads a role and knows the color's job — which anchors surfaces, which draws the eye — instead of guessing from a hex dump. |
| `typography` | Font families paired to roles (`heading`, `body`, …), plus directly-usable CSS declarations when present | Typesets a layout without asking what size or weight the headline should be. |
| `layout` | Named composition patterns with container CSS | Composes pages the way the identity composes them, not the way a template does. |
| `mood` | A short, human-readable mood descriptor | Calibrates copy register, image selection, and layout density before generating. |
| `rationale` | The overall creative direction, in a statement written to be read first | Primes the model on intent before it generates — the agent's first read of the document. |
| `cohesion` | A 0–100 score and a summary of how tightly the elements relate; `null` when there wasn't enough signal | Tells the agent how much creative latitude is appropriate — minimal variation, or deliberate eclecticism. |
| `principles` | Titled composition rules with application notes | Hard constraints the agent honors, not suggestions to soften. |

### MIT license

Use it, extend it, build on it — no legal review before adoption. The format
is free to wire into commercial products, and the license matches the
open-governance model of the spec.

### JSON Schema validation

A JSON Schema (draft 2020-12) at [`spec/v1/epithet.schema.json`](./spec/v1/epithet.schema.json),
plus a zero-dependency validator in this repo. Any compliant validator answers
the one question that gates consumption — *is this a valid v1 document?* — and
a document that fails validation is refused, never partially consumed.

### Three worked examples

A D2C botanical brand, a B2B SaaS tech startup, and an editorial magazine —
all schema-valid, in [`examples/`](./examples/). They are the reference points
for implementers and the test fixtures for the validator.

### Argus as the reference implementation

Every identity analysis [Argus](https://argus.build) produces exports a valid
`epithet.json`, and Argus consumes the format to generate deliverables that
stay true to the source. The spec ships with a tool that already produces it
from real identities — the field set is grounded in a working producer, not a
hypothetical one.

### Why v1.0 is shaped this way

A closed root object with five required keys, `null` as a first-class value
for honest empty states, and a major-pinned schema URI. An agent can validate
first, consume only when valid, and never fabricate what the document doesn't
say.

---

## v1.1 — Soon (within 6 months) · Motion & Voice

How the identity moves and how it speaks — the two gaps most identity systems
leave open. All three items are backward-compatible additions and land as
minor bumps to v1 under the [versioning policy](./spec/v1/spec.md#4-versioning-policy).

### Motion direction

Animation easing, duration, and choreography principles as structured fields:
a named duration scale, easing curves per transition class, and sequencing
rules for how elements enter, exit, and hand off. An agent reads motion tokens
instead of inventing curves — generated animation matches the identity's pace,
and a second agent can extend the same motion language without ever seeing the
original brief.

### Voice and tone layer

How the identity's name is written (wordmark spellings), how its taglines are
built (tagline grammar), and which vocabulary is in or out (vocabulary
constraints). Today one document governs visual output; with v1.1, copy is
governed by the same file. Generated copy stops drifting from the visual
system, and naming or phrasing rules become machine-checkable.

### `$extends` for multi-identity inheritance

A document can point to a parent — a brand root, a product line, a regional
variant — and override only what differs. The resolver produces the full
merged spec. Sub-identities resolve to one unambiguous document: no partial
inheritance, no guessing which value wins.

---

## v2.0 — Later (12+ months) · The Protocol

epithet.json becomes a live handshake — agents negotiating creative direction
with each other in real time. A v2 revision publishes at a new schema URI
(`…/schema/v2`); v1 documents keep validating forever.

### Agent-to-agent protocol

A versioned request/response handshake for creative-direction negotiation. A
Director agent issues a direction request — constraints, audience, deliverable
— in machine-readable form; a Generator agent responds with a proposed
`epithet.json`. A Director briefs a Generator in structured constraints, not
prose: no brief lost in translation, and the negotiation is auditable and
replayable.

### Figma plugin

Export a Figma file's styles and components to a valid `epithet.json`.
Existing design systems enter the agent era without starting over — a
human-built system becomes agent-consumable with one export.

### Validator npm package

`epithet-validator`, zero-dependency, for Node and the browser. A one-line CI
check that catches drift before a downstream agent sees it — identity
compliance becomes a merge gate, not a review afterthought.

---

## How to follow along

- **Spec:** [`spec/v1/spec.md`](./spec/v1/spec.md) · **Schema:** [`spec/v1/epithet.schema.json`](./spec/v1/epithet.schema.json)
- **Validate a document:** `node tools/validate.js my-identity.json`
- **Field proposals:** open an issue — additive, backward-compatible changes target a minor version; breaking changes get a new major and a new schema URI.
- **Reference implementation:** [argus.build](https://argus.build) · **Site:** [epithet.brkdllc.com](https://epithet.brkdllc.com)
