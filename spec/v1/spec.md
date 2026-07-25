# epithet.json — Specification v1

`epithet.json` is an open, machine-readable **creative-direction format**. One
document describes a brand's visual identity — palette, typography, layout,
mood, cohesion, and composition principles — precisely enough for an AI agent to
generate on-brand output without a human translating the brand into a prompt.

The canonical machine artifact is the JSON Schema at
[`epithet.schema.json`](./epithet.schema.json) (JSON Schema draft 2020-12). This
document is its human-readable companion: what each field means, whether it is
required, its validation rules, and the versioning policy. Where the two ever
disagree, **the schema is authoritative.**

---

## 1. Document shape

A conforming document is a single JSON object:

```json
{
  "$schema": "https://epithet.brkdllc.com/schema/v1",
  "$version": "1.0",
  "mood": "warm, editorial, grounded",
  "rationale": "…why the system hangs together…",
  "palette": [ … ],
  "typography": [ … ],
  "layout": [ … ],
  "cohesion": { "score": 88, "summary": "…" },
  "principles": [ … ]
}
```

The root object is **closed**: unknown top-level keys are rejected. Required
keys are `$schema`, `$version`, `rationale`, `palette`, and `typography`.
Everything else is optional.

---

## 2. Field reference

### 2.1 `$schema` — string, **required**

The spec version this document conforms to. For a v1 document it MUST be exactly:

```
https://epithet.brkdllc.com/schema/v1
```

This is both the identity of the v1 schema (`$id`) and the value every v1
document carries. A validator resolves the schema from this URI; a document that
carries a different value is not a v1 document.

### 2.2 `$version` — string, **required**

The semantic version of the document's content against the spec, as
`MAJOR.MINOR` or `MAJOR.MINOR.PATCH` (e.g. `1.0`, `1.0.2`). Its `MAJOR`
component MUST match the schema's major version — for the v1 schema URI, `MAJOR`
is `1`. Pattern: `^1\.[0-9]+(\.[0-9]+)?$`.

See [§4 Versioning policy](#4-versioning-policy) for how `$schema` and
`$version` move over time.

### 2.3 `mood` — string, *optional*

A short, human-readable mood descriptor, e.g. `"warm, editorial, grounded"`. An
agent uses it to calibrate copy register, image selection, and layout density.
Omit the field entirely when no clear mood signal was read — do not emit an empty
string. Max 200 characters.

### 2.4 `rationale` — string, **required**

A brief natural-language statement of the overall creative direction and why the
choices hang together. This is the one field written *for the agent to read
first* — it primes the model on intent before it generates. It MAY be an empty
string when no rationale was produced, but the key must be present. Max 4000
characters.

### 2.5 `palette` — array, **required**

Named color roles. An agent reads a role and knows the color's job — which
anchors surfaces, which draws the eye — instead of guessing from a hex dump. May
be an empty array, but the key must be present.

Each entry is an object with all three fields required:

| Field | Type | Required | Rules |
|---|---|---|---|
| `role` | string | ✔ | One of `primary`, `secondary`, `accent`, `background`, `text`, `muted`. |
| `color` | string | ✔ | A CSS color value. Hex is canonical (`#RGB`, `#RRGGBB`, `#RRGGBBAA`); any CSS-valid string (`rgb()`, `oklch()`, named) is accepted. Non-empty. |
| `semantic` | string | ✔ | Human-readable note on why this color was chosen and how it relates to the rest of the palette. May be empty. Max 500 chars. |

Roles are not required to be unique or exhaustive, but a role that appears more
than once is ambiguous for role-based lookup (`palette.primary`) — emit each
role at most once.

### 2.6 `typography` — array, **required**

Font families paired to roles, so an agent can typeset a layout without asking
what size or weight the headline should be. May be empty, but the key must be
present.

Each entry:

| Field | Type | Required | Rules |
|---|---|---|---|
| `role` | string | ✔ | One of `heading`, `body`, `accent`, `caption`. |
| `family` | string | — | Resolved font-family name, e.g. `"Bricolage Grotesque"`, extracted from `css.fontFamily`. Omit when only the raw stack is known. Non-empty when present. |
| `semantic` | string | ✔ | Why this font fills this role. May be empty. Max 500 chars. |
| `css` | object | — | Directly-usable CSS declarations. Optional on a normalized read; present on a full creative-direction document. See below. |

The `css` object, when present, is **closed** and requires `fontFamily`:

| Field | Type | Required | Rules |
|---|---|---|---|
| `fontFamily` | string | ✔ | A full CSS font-family stack, e.g. `"'Bricolage Grotesque', system-ui, sans-serif"`. |
| `fontWeight` | integer | — | Numeric CSS weight, 1–1000. |
| `fontSize` | string | — | Any CSS length/clamp, e.g. `"clamp(2rem, 4vw, 3.5rem)"`. |
| `lineHeight` | string | — | e.g. `"1.6"`. |
| `letterSpacing` | string | — | e.g. `"-0.01em"` or `"normal"`. |

### 2.7 `layout` — array, *optional*

Composition patterns with directly-usable CSS. Present on full creative-direction
documents; typically absent on a brand-DNA read.

Each entry:

| Field | Type | Required | Rules |
|---|---|---|---|
| `pattern` | string | ✔ | A named pattern, e.g. `"hero-overlay"`, `"split-panel"`, `"card-grid"`. Non-empty. |
| `semantic` | string | ✔ | Why this layout suits the brand and context. May be empty. Max 500 chars. |
| `css` | object | — | Container CSS. All properties optional. |

The `css` object is **closed**; every property is an optional non-empty string:
`display`, `gridTemplateColumns`, `gap`, `alignItems`, `justifyContent`,
`aspectRatio`, `padding`, `maxWidth`.

### 2.8 `cohesion` — object or `null`, *optional*

How tightly the brand's visual elements relate to one another.

| Field | Type | Required | Rules |
|---|---|---|---|
| `score` | number or `null` | ✔ | Overall visual-cohesion score, **0–100**. `null` when there was not enough signal to score honestly (assets unanalyzed / no color data). |
| `summary` | string | ✔ | Human-readable cohesion read across the assets. May be empty. Max 1000 chars. |

The whole field may be `null` (no cohesion read at all) or omitted. When
present as an object, both `score` and `summary` are required. A high score
means minimal variation; a low score means deliberate eclecticism. An agent uses
it to decide how much creative latitude is appropriate.

> **Scale note.** `score` is `0–100`, matching the reference implementation's
> weighted cohesion metric (40% color harmony, 35% mood alignment, 25%
> typography). This is a deliberate choice for v1: the score maps 1:1 to what the
> reference implementation already emits, and `null` is a first-class value for
> the honest "not enough data" state.

### 2.9 `principles` — array, *optional*

Titled composition rules distilled from the brand — hard constraints an agent
should honor, not suggestions.

Each entry:

| Field | Type | Required | Rules |
|---|---|---|---|
| `title` | string | ✔ | Short name of the rule, e.g. `"Generous negative space"`. 1–120 chars. |
| `detail` | string | ✔ | One or two sentences on the rule and how to apply it. 1–600 chars. |

---

## 3. Provenance — the Argus mapping

epithet.json v1 is the portable form of the creative direction the Argus
reference implementation produces internally. The mapping is direct:

| epithet field | Argus source |
|---|---|
| `palette[]` (`role`/`color`/`semantic`) | `ColorDirective` — `color` is the flattened `css.color`. |
| `typography[]` (`role`/`family`/`semantic`/`css`) | `TypographyPairing` — `family` is the resolved name from `css.fontFamily`. |
| `layout[]` (`pattern`/`semantic`/`css`) | `LayoutGuidance`. |
| `cohesion` (`score`/`summary`) | `StudyCohesion`. |
| `principles[]` (`title`/`detail`) | `StudyPrinciple`. |
| `mood`, `rationale` | `DeliverableDirection.mood` / `.rationale`. |

The normalized `{ palette, typography, mood, rationale, cohesion, principles }`
read is exactly the `brandDnaSummary()` projection; epithet v1 additionally
carries the richer `typography[].css` and the optional `layout[]` block for
full creative-direction documents.

---

## 4. Versioning policy

### `$schema` — the spec contract

`$schema` is a URI of the form:

```
https://epithet.brkdllc.com/schema/v{MAJOR}
```

- **Major only in the URI.** The URI pins the *major* version and nothing
  finer. A v1 document always carries `…/schema/v1`; a future breaking revision
  publishes `…/schema/v2` at a new URI. The v1 URI never changes meaning.
- A **breaking change** — removing a field, renaming one, narrowing a type,
  adding a required field, or tightening an enum in a way that rejects a
  previously-valid document — requires a new major and a new URI.

### `$version` — the document contract

`$version` (`MAJOR.MINOR[.PATCH]`) records which revision of the spec the
document was authored against, at finer granularity than the URI:

- **MAJOR** always equals the schema URI's major (`1` for v1). A document may not
  claim a major its `$schema` URI does not match.
- **MINOR** bumps for backward-compatible additions — a new *optional* field, a
  new allowed enum value, a widened constraint. A v1 consumer MUST ignore
  unknown optional fields it does not understand at a higher minor… **except**
  that the v1 root object is closed (`additionalProperties: false`), so
  additive fields ship in the v1.x schema itself. Validate against the schema
  whose minor is ≥ the document's `$version` minor.
- **PATCH** is reserved for editorial/spec-text corrections that do not change
  what validates; it is optional and defaults to `0`.

### Compatibility rules for consumers

1. Read `$schema` first. If the major is one you support, proceed; otherwise
   refuse rather than guess.
2. Validate against the v1 schema. A document that fails validation is not a v1
   document — do not partially consume it.
3. Treat every optional field as possibly absent. `mood`, `layout`,
   `cohesion`, and `principles` may be missing; `cohesion` may be `null`;
   `cohesion.score` may be `null`; `typography[].css` and `typography[].family`
   may be absent. Render honest empty states, never fabricated values.

---

## 5. Validation

The schema is JSON Schema draft 2020-12. Validate with any compliant validator,
e.g. [ajv](https://ajv.js.org/):

```js
import Ajv2020 from "ajv/dist/2020.js";
import schema from "./epithet.schema.json" with { type: "json" };

const validate = new Ajv2020({ strict: false }).compile(schema);
const ok = validate(doc);
if (!ok) console.error(validate.errors);
```

Three worked, schema-valid examples live in
[`../../examples/`](../../examples/): `botanical-brand.json` (D2C),
`tech-startup.json` (B2B SaaS), and `editorial-magazine.json` (publication).

---

## 6. License

The spec, schema, and examples are MIT-licensed. Use it, extend it, build on it.
```
