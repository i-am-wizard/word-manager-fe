---
description: |
  Runs Playwright end-to-end tests against the frontend on every pull request.
  All backend API endpoints are intercepted and mocked so tests run without a live backend.

on:
  pull_request:
    types: [opened, synchronize]

tools:
  playwright:
  bash: [":*"]

network:
  allowed:
    - defaults
    - playwright
    - local

permissions:
  contents: read
  pull-requests: read

safe-outputs:
  add-comment:
    max: 1
---

# E2E Playwright Tests

Run end-to-end tests for this React frontend using Playwright. Every backend API call
must be intercepted so the tests are fully self-contained with no live backend dependency.

## Setup

1. `cd vite-frontend && npm ci`
2. The `playwright.config.ts` and `@playwright/test` package are already committed — do NOT recreate them
3. Do NOT install Playwright browsers separately — the config already uses the system-installed Chromium
4. Write test files into the `e2e-tests/` directory as defined in the existing config

## API Mocking Strategy

The app communicates with the backend through these endpoints (proxied via Vite to `/api`):

| Method | Path         | Request Body           | Response Body         |
|--------|------------- |------------------------|-----------------------|
| GET    | `/api/word`  | —                      | `{ "word": "hello" }` |
| PUT    | `/api/word`  | `{ "word": "<value>" }`| `{ "word": "<value>" }`|

**Intercept every `/api/*` route** using Playwright's `page.route()` before each test so
no request reaches a real backend. Return realistic JSON responses and appropriate
status codes (200). For PUT requests, parse the request body and echo the submitted
word back in the response so the UI reflects the update.

## Test Scenarios

Write and execute the following E2E scenarios using Playwright's test runner:

### 1. Initial Page Load
- Navigate to the app
- Verify the heading "Word Manager" is visible
- Verify the mocked current word "hello" appears on the page

### 2. Update Word — Happy Path
- Fill the input with a new word (e.g. "world")
- Click the "Update Word" button
- Intercept the PUT request and confirm the request body contains `{ "word": "world" }`
- Verify the displayed current word updates to "world"

### 3. Empty Input — Button Disabled
- Verify the "Update Word" button is disabled when the input is empty
- Clear the input field and confirm the button remains disabled

### 4. Whitespace-Only Input
- Type only spaces into the input
- Verify the "Update Word" button stays disabled (the app trims input)

## Reporting

Post a single PR comment with:

1. **Status**: ✅ if all tests pass, ❌ if any fail
2. **Results table**: each scenario name with pass/fail status
3. **Terminal output**: the complete `npx playwright test --reporter=list` output in a collapsed `<details>` block
4. **Test code**: the full `.spec.ts` file in a collapsed `<details>` block
5. **Trace summary**: after the test run, unzip each trace `.zip` and extract the action names and durations from the trace JSON files. Include a per-scenario trace summary in a collapsed `<details>` block

Do NOT embed screenshots or base64 images in the comment. Keep reporting text-only and fast.
