---
name: React Hook Form
description: Use when building forms or inputs in Vesper with React Hook Form — the location search input, validation rules, field-level errors, and connecting to module hooks.
---

# Forms — React Hook Form

The only field-based interaction is the location search, and it is built with React Hook Form.

## Rules

- Use `react-hook-form` for all forms.
- No external schema library (no Zod, no Yup) — validate with RHF's built-in `validate` rules.
- Forms are always Client Components (`'use client'`).
- Never call a service/fetch function directly from the form — go through the corresponding module hook (query/mutation).
- Never manage form loading/error state manually with `useState` — use `formState` from RHF and the hook's pending/error state.
- Forms logic must be placed inside an individual hook, never inside a component.

## Validation rules reference

| Field   | Rules                      |
| ------- | -------------------------- |
| `query` | `required`, `minLength: 3` |

## Rules summary

- Use `register` + inline `validate` options — no schema libraries.
- Use `formState.errors` for field-level feedback, and the hook's `isError` for API-level feedback.
- Disable the submit button while the request is pending.
- Forms never manage their own loading/success/error booleans with `useState`.
