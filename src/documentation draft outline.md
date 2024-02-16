TODO: Determine where this document is going to live
# Testing
Both application tests and component tests in ServicePulse follow the Testing Library [Guiding Principle](https://testing-library.com/docs/guiding-principles/) which corages to write tests that closely resemble how web pages are used and to avoid testing implementation details.

## Application tests

### Application tests code review checklist
- [ ] Tests files are in vue/test folder

## Component tests 
- Use @testing-library/vue instead of @vue/test-utils
  - TODO: Explain  why
  
### Component tests code review checklist
- [ ] Testing is done through the functions exported by @component-test-utils only
- [ ] Tests have the spec.ts extension
- [ ] Tests files are right next to the file being tested, e.g: for PageFooter.vue create a PageFooter.spec.ts file
  
### When to write component tests  
  
## Unit tests
- Don't test composables
  - TODO: Explain why

## Developer worklfow supported by tests
- Document steps, record videos (or both) for each of the following developer intentions and how they are supported by tests:
  - Fixing a bug
  - Modifying existing functionality
  - Introducing new functionality
    - Into an existing page
    - Into a new page

### Debugging
#### Attaching the debugger with VSCode

## Generating specification document from acceptance tests
