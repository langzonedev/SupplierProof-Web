# Supplyfolio Web

**Public, customer-facing product prototype for Supplyfolio by Lang Systems.**

**Live:** https://langzonedev.github.io/SupplierProof-Web/

Supplyfolio gives Australian small suppliers and contractors one reusable workspace for the evidence buyers repeatedly request.

> **Your evidence. Ready for every buyer.**

## Product experience

The portfolio prototype demonstrates the full supplier-owned loop:

1. set up the supplier business;
2. build a reusable evidence library;
3. capture a buyer checklist;
4. review Matched, Missing, Expired and Needs review outcomes;
5. save a customer-specific response;
6. reuse the same evidence for the next buyer.

Use **Run the guided demo** for the fastest end-to-end path.

## Brand system

The interface uses a custom shield/check product mark and a professional supplier-friendly palette:

- deep navy for trust and control;
- teal for action and evidence readiness;
- fresh lime for progress and positive outcomes;
- warm sand for an approachable Australian SME feel.

The product is part of the **Lang Systems** discovery portfolio.

## Data and safety boundary

This public prototype:

- stores sample workspace data in the browser with `localStorage`;
- does not upload files or send customer data to a backend;
- uses a deliberately simple, public matching heuristic;
- is not a compliance certification or legal decision tool;
- is suitable for synthetic/sample information only.

The private `langzonedev/SupplierProof` repository remains authoritative for protected product logic, research, security architecture and future backend design.

## PWA and deployment

- Static HTML, CSS and JavaScript with no runtime dependencies.
- Installable web manifest and offline asset cache.
- Responsive, keyboard-friendly workflow.
- GitHub Pages deployment from `main` via GitHub Actions.

## Validation status

Portfolio prototype targeting moderated user testing. Production use still requires authentication, encrypted document storage, tenant isolation, RBAC, audit history, retention controls, security review and commercial validation.


## Brand note

Supplyfolio is the working replacement brand adopted in August 2026 after an exact-name and visual-identity collision was identified with an unrelated SupplierProof product. The repository path remains unchanged to preserve deployment history.
