## TL;DR
> **Goal**: Let users steer the pipeline with *labels* while the system keeps the *status*.
> **Deliverables**: DB label model, CRUD API, Agent‑label contracts, Editor orchestration, UI label picker, tests, docs.
> **Effort**: Medium (≈ 4 days).

## Context
- Paperclip already has **status** (system‑controlled) and **comments** for coordination.
- We need a **user‑controlled** dimension – *labels* – to express intent (e.g. `rewrite`, `review-ready`).
- Only the **Editor** must aggregate multiple review results; other agents can act independently.

## Work Objectives
1. **Data model** – introduce a `labels` table and a many‑to‑many `issue_labels` relation.
2. **API** – endpoints to list/create/update/delete labels and to assign/remove them on issues.
3. **Agent contracts** – each agent watches for specific labels on its assigned issues and reacts accordingly.
   - `Chapter Writer` reacts to `[rewrite]` → `[rewrite-in-progress]` → `[rewrite‑done]`.
   - `World Builder`, `Character Consultant`, `Narrator` react to `[review]` → `[review‑done]`.
   - `Editor` watches for `[rewrite‑done]` to spawn review tasks, and for three `[review‑done]` comments to finalize.
4. **Orchestration logic** – Editor creates sub‑issues, posts status‑changing comments, and updates parent‑issue labels.
5. **UI** – allow users to add/remove labels on an issue (checkbox list).
6. **Testing** – unit tests for label handling, integration tests for the full rewrite‑review flow.
7. **Documentation** – update `AGENTS.md` for each agent with the new label‑contract.

## Tasks (ordered, dependencies indicated)
| # | Task | Agent | Dependencies | Acceptance Criteria |
|---|------|-------|--------------|----------------------|
| 1 | **Create DB schema** – `labels(id, name, color, company_id)`, `issue_labels(issue_id, label_id)`. | DB | – | `psql` shows new tables, foreign keys enforced. |
| 2 | **Add CRUD API** (`GET/POST/PATCH/DELETE /api/labels`) and `POST /api/issues/:id/labels`. | API | 1 | Correct HTTP responses, validation, auth. |
| 3 | **Update issue service** – `addLabel`, `removeLabel`, `listLabels`. | Service | 2 | Functions exported, used by routes. |
| 4 | **Define label contract constants** – `LABEL_REWRITE`, `LABEL_REWRITE_IN_PROGRESS`, `LABEL_REWRITE_DONE`, `LABEL_REVIEW_READY`, `LABEL_REVIEW_DONE`. | Shared | – | Constants importable from any agent. |
| 5 | **Chapter Writer agent** – on issue with `LABEL_REWRITE` → add comment, change label to `LABEL_REWRITE_IN_PROGRESS`; on completion → set `LABEL_REWRITE_DONE`. | Chapter Writer | 4,3 | When the writer patches status to `done`, the label flips accordingly. |
| 6 | **Review agents (World Builder, etc.)** – on issue with `LABEL_REVIEW_READY` → perform review, comment, then set `LABEL_REVIEW_DONE`. | Review agents | 4,3 | Each review agent adds a comment with its verdict and updates the label. |
| 7 | **Editor orchestration** – a) on parent issue receiving `LABEL_REWRITE_DONE` → create sub‑issues for reviewers, set parent label `LABEL_REVIEW_READY`. b) monitor comments; when three distinct reviewer comments with `LABEL_REVIEW_DONE` are present, post decision comment and set parent label `LABEL_REVIEW_COMPLETE`. | Editor | 4,5,6,3 | Full three‑step flow runs without manual intervention. |
| 8 | **UI label picker** – edit issue page to show checkboxes for existing labels, allow add/remove. | UI | 2,3 | Users can tag/untag issues; UI reflects current labels. |
| 9 | **Tests** – unit tests for API, integration test covering rewrite → review → final decision. | Test | 1‑8 | CI passes, coverage ≥ 80 % for label logic. |
|10| **Documentation** – update `AGENTS.md` for each agent, add a short “Label contract” section in the repo README. | Docs | 4‑8 | Docs compile, examples included. |

## Verification Strategy
- **Automated tests** (unit + end‑to‑end) must pass.
- **Manual smoke‑test**: create a `rewrite` issue, watch the label transitions and comment flow in the UI.
- **Agent logs** must show label‑driven actions (e.g. `Editor` creating sub‑issues after `rewrite‑done`).

## Execution Strategy (waves)
- **Wave 1** – DB schema & API (Tasks 1‑3). ✅
- **Wave 2** – Agent contracts & core agents (Tasks 4‑6). ✅
- **Wave 3** – Editor orchestration (Task 7). ✅
- **Wave 4** – UI & docs (Tasks 8‑10). ✅

## Final Verification Wave
- Run a full end‑to‑end scenario on a fresh dev instance.
- Verify that after a user tags an issue with `rewrite`, the Chapter Writer picks it up, the label progresses, the Editor spawns reviewers, reviewers tag `review‑done`, and the Editor finally marks the parent issue as `review‑complete`.

---
**Plan saved to** `.sisyphus/plans/label-driven-workflow.md`