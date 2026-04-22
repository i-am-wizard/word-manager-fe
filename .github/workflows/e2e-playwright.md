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
2. `npx playwright install --with-deps chromium`
3. Start the Vite dev server in the background: `npm run dev -- --port 5173 &`
4. Wait until `http://localhost:5173` responds before running tests.

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
- Navigate to `http://localhost:5173`
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

## Test Configuration

When writing the Playwright config (`playwright.config.ts`), enable:

- **Reporter**: Use `--reporter=list` when running tests so every test's pass/fail is printed line-by-line
- **Tracing**: Set `use: { trace: 'on' }` in the Playwright config so a full trace is recorded for every test
- **Screenshots**: Set `use: { screenshot: 'on' }` to capture a screenshot after every test (not just failures)

## Reporting

The PR comment **must** include all of the following sections as concrete evidence the tests actually ran:

### 1. Test Results Summary
- A table of each scenario with its pass/fail status (✅ / ❌)

### 2. Raw Terminal Output
- The **complete, unedited** terminal output from the Playwright test run
- Wrap in a collapsed `<details><summary>Playwright terminal output</summary>` block

### 3. Test Code
- Paste the **full test file** the agent wrote (the `.spec.ts` file)
- Wrap in a collapsed `<details><summary>Test source code</summary>` block

### 4. Screenshots
- Attach or embed the screenshots captured after each test scenario
- Name each screenshot after its scenario (e.g. `01-initial-load.png`, `02-update-word.png`)

### 5. Trace Files
- Run `npx playwright show-trace` to extract a human-readable summary from each `.zip` trace file
- Include the trace summary for every test in a collapsed `<details><summary>Playwright traces</summary>` block
- List each trace file name and its corresponding scenario

### Final status
- Lead the comment with ✅ if all tests pass, or ❌ if any test fails
- If any test fails, include the failure details and error messages prominently before the collapsed sections
