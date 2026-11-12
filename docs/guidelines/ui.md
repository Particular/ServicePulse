# UI changes

## Scope

- Paths: `src/Frontend/**`
- Changes: anything users see or interact with in ServicePulse, such as views, components, styles, navigation, and UI copy.
- The rules for bigger changes apply to a change of the visual direction or of the navigation or page structure, and to a change that spans several areas; they do not apply to fixes, copy changes, or changes to a single component.

## Rules

- A UI change must be consistent with `docs/PRODUCT.md` and with `docs/DESIGN.md` once it exists.
- When `docs/DESIGN.md` and existing code disagree, a change must follow `docs/DESIGN.md` and name the difference in the pull request.
- `PRODUCT.md` and `DESIGN.md` must exist only under `docs/`.
- A principle that should outlive a change should be recorded in `docs/DESIGN.md` for visual and interaction rules, or in `docs/PRODUCT.md` for product facts.
- A bigger change must list its assumptions and its constraints separately and have both confirmed by the person who asked for it before design work starts.
- A bigger change should state what the code or data already shows as facts, which need no confirmation, rather than as assumptions.
- A bigger change must list only the assumptions that would change one of its decisions if they were wrong.
- Each assumption must be a claim about users or their context that could be wrong, with its source (`docs/PRODUCT.md`, data, or "assumed") and the evidence that would show it is wrong.
- The constraints of a bigger change must cover what it has to respect regardless of the assumptions, such as requirements from `docs/PRODUCT.md`, accessibility, existing behavior, scope, and stakeholder decisions.
- A bigger change should state the preservation of existing behavior as one constraint and list the behaviors it covers as review criteria, which need no separate confirmation.
- Each design decision in a bigger change must name the assumption or constraint it rests on.
- The pull request of a bigger change must list its assumptions, constraints, and decisions, mark each as new, existing, or changed, and state which assumptions turned out wrong or partly wrong.
- A UI change must be checked in the running UI with mock data on every existing view it can affect, at a width on each side of every layout breakpoint it can affect, and compared with the same views before the change; a change to the shell or to shared styles affects every view.
- The pull request of a UI change must state that the layout check was done, and must list a view and width only for a layout difference it found, with whether the difference was fixed or accepted by the person who asked for the change.
- Until Bootstrap is removed, views must use the shared components in `src/Frontend/src/components`, such as `ActionButton`, `ModalDialog`, `ConfirmDialog`, and `DropDown`, and extend them when needed.
- Views must not add Bootstrap component classes, such as `btn`, `modal`, `dropdown`, `alert`, and `badge`, or `data-bs-*` attributes.
- New code should use Bootstrap grid and utility classes only for layout, until replacements exist.
- `docs/DESIGN.md` must name components by role, never by a Bootstrap class, and must record what Bootstrap theming cannot yet deliver as a known gap.

## Rationale

[#3185](https://github.com/Particular/ServicePulse/pull/3185) introduced these rules. Written assumptions let reviewers check a bigger change against them rather than against taste, and shared components keep the Bootstrap removal inside those components. A short list of facts, decision-bearing assumptions, and constraints is one a person can confirm before design work starts. Views size themselves with viewport media queries, so a change outside a view can break its layout without failing a test, and layouts break first at the edges of a breakpoint.

## Skill

`servicepulse-ui`
