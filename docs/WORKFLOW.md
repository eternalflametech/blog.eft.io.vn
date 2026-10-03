# Development Workflow Guide

## 1. Overview
All engineering tasks performed on the Eternal Flame Tech Blog must adhere to the 10-step development lifecycle. This workflow ensures requirements clarity, architecture rigor, containerized validation, and cryptographic commit traceability.

---

## 2. The 10-Step Lifecycle Checklists

### Step 1: Clarify Intent
- [ ] Interview the user regarding task objectives and scope.
- [ ] Identify and resolve all ambiguous requirements, unstated data types, or missing UX expectations.
- **Exit Criteria:** Requirements and acceptance criteria are 100% agreed upon by the user.

### Step 2: Deep Logic Comprehension
- [ ] Analyze database schemas, relationships, and migration implications.
- [ ] Trace API data flow across Next.js frontend, API proxy, Axum backend, and Redis cache.
- [ ] Map out edge cases, error conditions, container isolation, and security implications.
- **Exit Criteria:** System data flow and edge cases are completely documented.

### Step 3: Search & Discovery
- [ ] Search the web dynamically for the latest stable crate and npm package versions.
- [ ] Search the web for latest pinned Docker base images and Compose specifications.
- [ ] Verify that no bespoke utilities are written when standard libraries exist.
- **Exit Criteria:** Dependency versions are verified against crates.io, npmjs.com, and Docker Hub.

### Step 4: Formulate Plan
- [ ] Detail all files to create, modify, or delete.
- [ ] Define API route signatures, request/response types, and database queries.
- [ ] Detail Docker service definitions, named volume allocations, and healthchecks.
- [ ] Outline test plans, linting steps, and security checkpoints.
- **Exit Criteria:** Complete written technical plan is ready for user review.

### Step 5: Verify with User
- [ ] Present the comprehensive plan to the user.
- [ ] If the user requests modifications, revise the plan and re-submit.
- **Exit Criteria:** Explicit user approval to proceed with implementation.

### Step 6: Create Local Temp Branch
- [ ] Create an ephemeral local branch: `git checkout -b temp/<task-name>`.
- [ ] Verify that this branch is NEVER pushed to the remote repository.
- **Exit Criteria:** Working directory is on `temp/<task-name>`.

### Step 7: Implement Changes
- [ ] Implement planned modifications on the local temporary branch only.
- [ ] Enforce Tailwind CSS EFT dark theme tokens and responsive layouts.
- [ ] Ensure all services remain containerised without host runtime prerequisites.
- [ ] Restrict code comments strictly to (a) logic, (b) input, and (c) output.
- **Exit Criteria:** Code implementation is complete and adheres to style guidelines.

### Step 8: Automated Testing & Docker Verification
- [ ] Run backend test suite inside container: `cargo test`.
- [ ] Run backend lints: `cargo clippy -- -D warnings`.
- [ ] Run frontend test suite inside container: `npm test`.
- [ ] Run frontend lints: `npm run lint`.
- [ ] Verify Docker build: `docker compose build --no-cache`.
- [ ] Verify Docker startup & healthchecks: `docker compose up -d` (all services report `healthy`).
- **Exit Criteria:** 100% of test suites, lints, and container healthchecks pass with zero errors.

### Step 9: User Confirmation to Merge & Push
- [ ] Present test execution results and change summary to the user.
- [ ] Explicitly request user authorization to merge and push to remote.
- **Exit Criteria:** Explicit confirmation received from user.

### Step 10: Cleanup & Token-Saving Report
- [ ] Switch to main branch: `git checkout main`.
- [ ] Merge the temporary branch: `git merge temp/<task-name>`.
- [ ] Commit with verified SSH signature as `nmkdeveloper <nguyenminhkhoi.nmk.dev@gmail.com>`.
- [ ] Push to remote: `git push origin main`.
- [ ] Delete the temporary local branch: `git branch -d temp/<task-name>`.
- [ ] Obtain real-world timestamp via runtime HTTP Date API.
- [ ] Generate execution report at `~/reports/{taskid}-{datetime}.md`.
- **Exit Criteria:** Main branch is pushed, local temp branch is deleted, and report is saved.

---

## 3. Post-Task Reporting Specification
Every completed engineering task must write a concise report to `~/reports/{taskid}-{datetime}.md`.

### Report Template
```markdown
# Execution Report: {taskid}

- **Timestamp:** {HTTP_DATE_API_TIMESTAMP}
- **Local Branch:** temp/{task-name} (deleted)
- **Commit Hash:** {COMMIT_HASH}
- **SSH Signature:** Verified ({SSH_KEY_FINGERPRINT})

## 1. Objective
{Concise summary of task objectives}

## 2. Approved Plan
{Summary of user-approved technical plan}

## 3. Files Changed
| File Path | Action | One-Line Rationale |
| :--- | :--- | :--- |
| `path/to/file` | Modified | Added compile-time SQL query |

## 4. Tests & Verification
- `cargo test`: Passed (X tests, 0 failures)
- `npm test`: Passed (Y tests, 0 failures)
- `docker compose build`: Succeeded (multi-stage)
- `docker compose up`: Healthy (all 4 services healthy)
- Lints: Passed

## 5. Performance Measurements
- Latency Before: {X} ms -> Latency After: {Y} ms
- Memory Footprint: {Z} MB
- Cache Hit Ratio: {W}%

## 6. Security Considerations
- Parameterized SQL verified with SQLx.
- Input validation and HTML sanitization confirmed.
- Admin routes verified server-side.
- Containers running as non-root users.

## 7. Outstanding Items
- None.
```
