PR Description…

## Reviewer Checklist

- [ ] Components are broken down into sensible and maintainable sub-components.
- [ ] Styles are scoped to the component using it. If multiple components need to share CSS, then a .css file is created containing the shared CSS and imported into component scoped style sections.
- [ ] Naming is consistent with existing code, and adequately describes the component or function being introduced
- [ ] Only functions utilizing Vue state or lifecycle hooks are named as composables (i.e. starting with 'use');
- [ ] No module-level state is being introduced. If so, request the PR author to move the state to the corresponding Pinia store.
