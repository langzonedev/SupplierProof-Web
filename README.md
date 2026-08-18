# SupplierProof Web

**Public customer-facing discovery prototype for SupplierProof.**

Live target: `https://langzonedev.github.io/SupplierProof-Web/`

Deployment: GitHub Pages via GitHub Actions from `main`.

## What this repository is

This repository contains only the deliberately public SupplierProof demo/PWA surface. It is intended for rapid browser testing, portfolio demonstrations and early customer feedback.

The authoritative product repository is private. Protected product logic, internal research, security architecture, real customer data, credentials and commercially sensitive implementation details must never be copied here.

## Prototype promise

SupplierProof explores a simple outcome for Australian suppliers:

> **Keep your reusable business evidence in one place, then quickly understand what you already have for the next buyer request.**

The public prototype demonstrates:

- self-service supplier setup;
- reusable synthetic evidence records;
- buyer checklist entry;
- Matched / Missing / Needs review / Expired presentation;
- clear supporting-evidence references;
- reusable evidence across multiple buyer requests;
- copy/download response summary;
- responsive installable PWA shell.

## Important boundary

This demo uses a deliberately simple client-side matching heuristic only to demonstrate the interaction. It is **not** the production decision engine and must not evolve into protected commercial logic in this public repository.

SupplierProof organises evidence. It does not certify legal, contractual or procurement compliance.

Use sample/synthetic information only.

## Repository pairing

- `langzonedev/SupplierProof` — private authoritative product/source repository.
- `langzonedev/SupplierProof-Web` — public customer-facing prototype and Pages surface.

## Status

Discovery prototype. Not production software and not approved for real compliance documents.
