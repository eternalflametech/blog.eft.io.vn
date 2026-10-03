---
trigger: always_on
description: enforce the mandatory 10-step development lifecycle, temporary git branching, testing, user approval, and task reporting
---

# Development Lifecycle & Reporting Directives

## 1. The Mandatory 10-Step Development Lifecycle
Every engineering task must strictly follow this sequential order without skipping steps:

1. **Clarify Intent (Interview the User):** Ask the user what they want; clarify until requirements and acceptance criteria are 100% unambiguous. Never make assumptions.
2. **Deep Logic Comprehension:** Analyze data flow, database schemas, API contracts, and edge cases thoroughly before modifying or writing code.
3. **Search & Discovery:** Search the web dynamically for relevant crates and npm packages to verify the latest stable release versions. Never guess version numbers.
4. **Produce a Comprehensive Plan:** Detail all files to create or modify, endpoints, database migrations, security controls, and testing criteria.
5. **Present the Plan & Await Approval:** Present the plan clearly to the user. If approved, proceed to step 6. If rejected or modifications are requested, revise the plan and seek approval again until accepted.
6. **Create a Temporary Local Git Branch:** Create an ephemeral local branch (`git checkout -b temp/<task-name>`). Never push this temporary branch to the remote repository.
7. **Implement Changes on Local Branch:** Write clean, modular code on that local branch only. Adhere strictly to Tailwind CSS EFT dark theme tokens, mobile-first layouts, and code comments restricted to logic, input, and output.
8. **Automated Testing:** Run the full test suite (`cargo test`, `npm test`, lint checks). All tests must pass with 100% success rate before proceeding.
9. **Ask User Permission to Merge and Push:** Explicitly request user authorization to merge changes into `main` and push to remote.
10. **Cleanup & Token-Saving Report:**
    - On approval: Merge local branch to `main`, commit with verified SSH key as `nmkdeveloper <nguyenminhkhoi.nmk.dev@gmail.com>`, push to `origin/main`, delete the temporary local branch (`git branch -d temp/<task-name>`), and generate an execution report.
    - On refusal: Stop execution, retain the local temporary branch, and await user instructions.

## 2. Mandatory Reporting Directive
After every completed task, generate an execution report stored at:
`~/reports/{taskid}-{datetime}.md`

### Dynamic Timestamp Retrieval
The `{datetime}` component in the filename and report body MUST be obtained at runtime by querying an HTTP Date API (e.g., extracting the HTTP Date header via `curl -sI https://google.com | grep -i '^date:'` or calling a public time API). Never use the local system clock.

### Report Structure
The report must concisely document:
1. **Objective:** High-level summary of the task goals.
2. **Approved Plan:** Outline of the agreed plan.
3. **Files Changed:** Table or bulleted list of modified/created files with a one-line rationale for each change.
4. **Tests & Results:** Commands executed (`cargo test`, `npm test`, lints) and verification outputs.
5. **Performance Measurements:** Concrete metrics (latency, memory footprint, bundle size, database query performance).
6. **Security Considerations:** Audits conducted (SQL parameterization, input sanitization, access checks).
7. **Outstanding Items:** Any future tasks or deferred improvements.
8. **Git Metadata:** Local branch name, commit hash, and SSH signature verification status (`git log -1 --show-signature`).
