# General Instructions

This folder contains broad rules and conventions for the project.

**Architecture & Change Control:**

-   **ADRs (Architecture Decision Records):** All significant architectural decisions must be documented as an ADR in the `docs/architecture/` directory.
-   **Review Process:**
    1.  A developer proposes a change by creating a new ADR with the status "Proposed".
    2.  The proposal is reviewed by the Tech Lead (TL) and relevant stakeholders (e.g., Backend, Frontend, DevOps).
    3.  Once approved, the ADR status is changed to "Accepted".
-   **Approval:** No architectural change may be implemented without an "Accepted" ADR.
-   **Scope:** This process applies to changes that affect:
    -   The technology stack.
    -   The addition or removal of a service.
    -   The interfaces between components.
    -   Data storage and flow.
-   **Interface Changes:** Any change to an API or component interface must be versioned, and a backward compatibility and migration plan must be provided.

**Commit & PR conventions:**
- Use descriptive PR titles and reference related docs/tickets.
- Add testing checklist to PRs that modify behavior or APIs.

**Coordination:**
- Respect architecture decisions and coordinate broadly (see `docs/architecture/`).
