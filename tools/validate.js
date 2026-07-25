#!/usr/bin/env node
/**
 * epithet.json validator — zero dependencies.
 *
 * Usage:
 *   node tools/validate.js path/to/my-brand.json
 *
 * Validates a document against the epithet v1 JSON Schema
 * (spec/v1/epithet.schema.json) and prints a field-level pass/fail report.
 * Exit code 0 when the document is valid, 1 when it is not (or on bad input).
 *
 * It implements the subset of JSON Schema draft 2020-12 that the epithet
 * schema actually uses — type, required, properties, additionalProperties,
 * items, $ref (local #/$defs/*), enum, const, pattern, min/maxLength,
 * minimum/maximum, and oneOf — so the schema file stays the single source of
 * truth. No ajv, no npm install.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'spec', 'v1', 'epithet.schema.json');

// ---- tiny JSON Schema (draft 2020-12 subset) evaluator ------------------

function jsonType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  if (typeof value === 'number') return 'number';
  return typeof value; // 'string' | 'boolean' | 'object'
}

// A document integer also satisfies "number"; everything else is exact.
function typeMatches(value, expected) {
  const actual = jsonType(value);
  if (expected === 'number') return actual === 'number' || actual === 'integer';
  return actual === expected;
}

function resolveRef(ref, root) {
  if (!ref.startsWith('#/')) {
    throw new Error(`Unsupported $ref (only local refs are supported): ${ref}`);
  }
  const parts = ref.slice(2).split('/');
  let node = root;
  for (const part of parts) {
    node = node && node[decodeURIComponent(part)];
    if (node === undefined) throw new Error(`Cannot resolve $ref: ${ref}`);
  }
  return node;
}

/**
 * Validate `value` against `schema`, appending `{ path, message }` to `errors`.
 * `instancePath` is the JSON path (e.g. "/palette/0/role") to the value.
 */
function validate(value, schema, root, instancePath, errors) {
  if (schema.$ref) {
    validate(value, resolveRef(schema.$ref, root), root, instancePath, errors);
    return;
  }

  // oneOf: exactly one branch must validate.
  if (schema.oneOf) {
    const matches = schema.oneOf.filter((sub) => {
      const local = [];
      validate(value, sub, root, instancePath, local);
      return local.length === 0;
    });
    if (matches.length !== 1) {
      errors.push({
        path: instancePath,
        message: `must match exactly one allowed schema (matched ${matches.length})`,
      });
    }
    return;
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push({ path: instancePath, message: `must equal ${JSON.stringify(schema.const)}` });
    return;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push({ path: instancePath, message: `must be one of ${JSON.stringify(schema.enum)}` });
    return;
  }

  if (schema.type && !typeMatches(value, schema.type)) {
    errors.push({ path: instancePath, message: `must be of type ${schema.type}, got ${jsonType(value)}` });
    return; // further checks assume the type held
  }

  const t = jsonType(value);

  if (t === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path: instancePath, message: `must be at least ${schema.minLength} character(s) long` });
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path: instancePath, message: `must be at most ${schema.maxLength} character(s) long` });
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) {
      errors.push({ path: instancePath, message: `must match pattern ${schema.pattern}` });
    }
  }

  if (t === 'number' || t === 'integer') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path: instancePath, message: `must be >= ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path: instancePath, message: `must be <= ${schema.maximum}` });
    }
  }

  if (t === 'array' && schema.items) {
    value.forEach((item, i) => validate(item, schema.items, root, `${instancePath}/${i}`, errors));
  }

  if (t === 'object') {
    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          errors.push({ path: instancePath || '/', message: `missing required field "${key}"` });
        }
      }
    }
    if (schema.properties) {
      for (const [key, subSchema] of Object.entries(schema.properties)) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          validate(value[key], subSchema, root, `${instancePath}/${key}`, errors);
        }
      }
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
          errors.push({ path: instancePath || '/', message: `unknown field "${key}" is not allowed` });
        }
      }
    }
  }
}

// ---- CLI ----------------------------------------------------------------

function fail(message) {
  console.error(`epithet: ${message}`);
  process.exit(1);
}

function main() {
  const target = process.argv[2];
  if (!target) {
    fail('usage: node tools/validate.js <path-to-epithet.json>');
  }

  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  } catch (err) {
    fail(`could not read the epithet schema at ${SCHEMA_PATH}: ${err.message}`);
  }

  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(target, 'utf8'));
  } catch (err) {
    fail(`could not read/parse ${target}: ${err.message}`);
  }

  const errors = [];
  validate(doc, schema, schema, '', errors);

  if (errors.length === 0) {
    console.log(`PASS  ${target}`);
    console.log('  valid epithet.json (v1)');
    process.exit(0);
  }

  console.error(`FAIL  ${target}`);
  console.error(`  ${errors.length} error(s):`);
  for (const e of errors) {
    console.error(`  - ${e.path || '/'}: ${e.message}`);
  }
  process.exit(1);
}

main();
