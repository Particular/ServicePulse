---
name: vue-component-testing
description: Guide for testing Vue components using Pinia and Testing Library. Use this when asked to implement or debug Vue component tests.
---

Following the approach in [healthchecknotifications.spec.ts](src/Frontend/src/components/configuration/HealthCheckNotifications.spec.ts), where the tests are executed at the container component level, and the preconditions are managed by setting the values at the Pinia stores. The Pinia store testing capability is leveraged, and calls to the server are, by default, stubbed by the Pinia store testing capability.

Implement tests for [YOUR_COMPONENT].vue, creating a sibling file with the .spec.ts extension.

### Prerequisites

1. Read the documentation about Pinia testing capability and how it by default stubs actions #fetch https://pinia.vuejs.org/cookbook/testing.html
2. Be aware that accessing the DOM elements is done through testing-library, so make updates to the components HTML as necessary with the applicable aria labels #fetch https://testing-library.com/docs/
3. Become familiar with this container component at the component level, its child presentation components, and the Pinia stores involved
4. IMPORTANT: Identify the configuration source
  - Check if the component reads from window.defaultConfig (global config)
  - Check if it reads from a Pinia store
  - Mock the appropriate source in tests
5. **IMPORTANT: Check if an existing store can be extended rather than creating a new one**
   - Search for existing stores that handle related functionality
   - Add new state/actions to existing stores to avoid duplication
   - Only create a new store if no related store exists

### Existing Test Specification Source

The project is migrating test specification locations to co-locate with the components. Existing test specs may be located under `src/Frontend/test/specs`. Look for an existing .spec.ts file that corresponds to the component you are implementing tests for. Borrow the test cases only from this file, but implement them in the new sibling file of the container component you are going to create.

IMPORTANT: Make sure all scenarios from the old .spec.ts file are implemented in the new location. Do not leave any scenarios behind, as this would result in a loss of test coverage for the component.

Once you have implemented the tests in the new location, you can delete the old .spec.ts file from `src/Frontend/test/specs` to avoid confusion and ensure all tests are co-located with their components.

### Store Integration Guidelines

**1. Use Existing Stores When Possible**

- Search the `src/Frontend/src/stores` folder for stores with related functionality
- Add new state and actions to existing stores rather than creating new ones
- This keeps Vue components unchanged and avoids import updates across the codebase

**2. Verify Client Methods Exist**

Before using any client methods in the store, verify they exist in the actual client files:

```typescript
// Check serviceControlClient.ts and monitoringClient.ts for available methods
// Use ONLY methods that actually exist, e.g.:
// - serviceControlClient.getServiceControlConnection()
// - monitoringClient.getMonitoringConnection()
// DO NOT invent methods that don't exist
```

**3. Store Name Must Match initialState Key**

The store name in `defineStore("StoreName", ...)` must match the key in `initialState`:

```typescript
// If store is: defineStore("EndpointSettingsStore", ...)
// Then use:
createTestingPinia({
  initialState: {
    EndpointSettingsStore: { /* state */ }  // Key MUST match store name exactly
  },
})
```

**4. Window Config vs Pinia Store**

Some components read configuration from `window.defaultConfig` instead of Pinia stores:

```typescript
// If component uses: const showFeature = window.defaultConfig.showFeature;
// Mock it in tests:
function setupWindowConfig(showFeature?: boolean): void {
  window.defaultConfig = {
    ...window.defaultConfig,
    showFeature,
  } as typeof window.defaultConfig;
}
```

### DSL Requirements

Ensure the DSL in your specification layer abstracts away UI details, focusing on user capabilities and outcomes rather than specific DOM elements or implementation details. Method names should reflect user intent and business rules, so the specification survives UI or implementation changes.

**1. Business-Centric Interface**

Create a DSL interface that describes USER CAPABILITIES (what users do) not UI mechanics (how they do it):

```typescript
interface ComponentDSL {
  user: {
    // Methods describe WHAT users accomplish, NOT HOW
    // Good: viewConfiguration(), copyToClipboard(), navigateToDetails()
    // Bad: clickTab(), clickButton(), selectDropdown()
  };
  verify: {
    // Methods describe BUSINESS OUTCOMES, NOT UI STATE
    // Good: configurationIsDisplayed(), errorsAreVisible()
    // Bad: tabIsActive(), buttonIsDisabled()
  };
}
```

**2. UI-Agnostic Design**

- If UI changes from tabs to dropdowns, only helper functions update, tests stay the same
- Clear separation: `user` (actions) vs `verify` (assertions) vs `renderComponent` setup

**3. Reusable Configuration Constants**

Define test data at the top of the file as constants - single source of truth:

```typescript
const FULL_CONFIG = {
  // All test data in one place
  // Reused across all tests - no inline objects repeated
};
```

**4. Store State Initialization (Better Initial State)**

Pass complete store state directly to `createTestingPinia({ initialState: {} })`:
- Avoids async waits for API calls
- Pre-compute derived values (snippets, configs) in test helpers
- Store actions are stubbed by default

```typescript
createTestingPinia({
  stubActions: true,  // Actions stubbed by default
  initialState: {
    YourStoreName: {
      loading: false,
      data: preComputedData,
      errors: [],
    },
  },
})
```

**5. Access Store Data Directly**

Use store state for assertions when possible, rather than DOM queries:
```typescript
const store = useYourStore();
expect(store.someValue).toContain("expected");  // Faster, more reliable than DOM queries
```

**6. Role-Based Queries**
Use accessible queries from Testing Library instead of manual DOM traversal:
- `screen.getByRole()`, `screen.queryByRole()`
- `within(element).getByRole()`
- Update component HTML with appropriate aria labels if needed

**7. Organized File Structure**

Use section comments to organize the spec file:

```typescript
// ==================== DSL Interfaces ====================
// ==================== Test Configuration ====================
// ==================== Snippet Generators ====================
// ==================== DOM Query Helpers ====================
// ==================== Mock Helpers ====================
// ==================== Component Renderer ====================
// ==================== Tests ====================
```

**8. Type Safety**

Define interfaces for actions, assertions, and render results:
```typescript
interface ComponentActions {
  // User action methods
}

interface ComponentAssertions {
  // Verification methods
}

interface RenderResult {
  actions: ComponentActions;
  assertions: ComponentAssertions;
  store: ReturnType<typeof useYourStore>;  // Include store for direct access
}
```

**9. Test Cleanup**

Include proper setup/teardown:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

**10. DSL Documentation**

Add a documentation comment explaining the DSL philosophy:

```typescript
/**
 * DSL for the [Feature Name] feature.
 * 
 * This specification focuses on user capabilities and business outcomes,
 * not UI implementation details.
 * 
 * If the UI changes (tabs become dropdowns, etc.), only helper
 * functions need updating—the tests remain unchanged.
 */
```

11. Mock Composables When Needed

If the component uses composables that make API calls or have complex dependencies:

```typescript
vi.mock("@/composables/useYourComposable", () => ({
  default: () => ({
    store: {
      someMethod: vi.fn(),
      someState: { /* initial state */ },
    },
  }),
}));
```

Specification by Example Naming Conventions
Follow the Feature → Rule → Example hierarchy:

1. FEATURE - The business capability being tested:
describe("FEATURE: Pending Retries", () => { ... })

2. RULE - A specific, testable requirement (normative language OK: should/must/can):
// Good: Narrow and specific
describe("RULE: Pending Retries tab should only be visible when showPendingRetry config is true", () => { ... })

// Bad: Too broad, "grab bag"
describe("RULE: Tab should be configurable", () => { ... })

3. EXAMPLE - Describes the context/situation, NOT the outcome:
// Good: Describes the state/situation being exercised
test("EXAMPLE: showPendingRetry is explicitly set to true", async () => { ... })
test("EXAMPLE: showPendingRetry is not configured (undefined)", async () => { ... })

// Bad: Restates the rule/outcome with "should"
test("EXAMPLE: When showPendingRetry is true, the tab should be shown", async () => { ... })

### Anti-Patterns to Avoid

❌ Creating new stores when existing ones can be extended
❌ Using client methods that don't exist (verify first!)
❌ Mismatched store names in initialState vs defineStore()
❌ Inline configuration objects repeated in each test
❌ DOM queries by class name or text content that may change
❌ Action names like clickTab(), clickButton(), selectOption()
❌ Waiting for async API calls (use pre-populated store state instead)
❌ Testing implementation details instead of user outcomes
❌ Assertion names like tabIsActive(), buttonIsEnabled()
❌ Unused variables (ESLint will flag these)
❌ Using any type (use unknown or specific types instead)
❌ Using queryByRole("tab") for RouterLink (use queryByRole("link") instead)
❌ Using toBeNull() / toBeVisible() (prefer toBeInTheDocument() / not.toBeInTheDocument())
❌ EXAMPLE names that restate the rule outcome ("should be shown", "should be hidden")
❌ EXAMPLE names with "When X, then Y" format (describe context only)

### Expected Output Structure

```
[ComponentName].spec.ts
├── Imports
├── DSL Documentation Comment
├── DSL Interfaces (ComponentActions, ComponentAssertions, RenderResult)
├── Test Configuration (FULL_CONFIG, etc.)
├── Mock Setup (vi.mock for composables)
├── DOM Query Helpers (getElement, etc.)
├── Window Config Helper (if component uses window.defaultConfig)
├── Component Renderer (renderComponent → returns DSL)
└── Tests
    └── describe("FEATURE: [Business Feature Name]")
        └── beforeEach()
        └── describe("RULE: [Specific testable requirement with should/must]")
            └── test("EXAMPLE: [Context/situation only, no outcome]")
```

### Naming Conventions

- Features: `describe("FEATURE: [Business Feature Name]")`
- Rules: `describe("RULE: [Business Rule]")`
- Examples: `test("EXAMPLE: [Specific Scenario]")`

### Final Checklist Before Submitting

- [ ] Store name in initialState matches defineStore() name exactly
- [ ] All client methods used actually exist in client files
- [ ] No any types used (use unknown or specific interfaces)
- [ ] No unused variables or imports
- [ ] DSL methods describe user intent, not UI mechanics
- [ ] Test data defined once in constants, not repeated inline
- [ ] Composables that make API calls are mocked
- [ ] Using queryByRole("link") for RouterLink elements (not "tab")
- [ ] Using toBeInTheDocument() assertions
- [ ] RULE names are normative (should/must/can)
- [ ] EXAMPLE names describe context only (no outcomes, no "should")
- [ ] Window config mocked if component uses `window.defaultConfig`

Create the necessary files and for existing ones apply the changes.