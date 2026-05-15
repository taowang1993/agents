---
name: react-testing
description: Generate Vitest + React Testing Library tests for React components, hooks, and utilities. Use whenever the user needs to write frontend tests, add test coverage, create spec files, or review existing test code.
---

# React Testing Skill

This skill enables Claude to generate high-quality, comprehensive frontend tests following established testing conventions and best practices.

## When to Apply This Skill

Apply this skill when the user:

- Asks to **write tests** for a component, hook, or utility
- Asks to **review existing tests** for completeness
- Mentions **Vitest**, **React Testing Library**, **RTL**, or **spec files**
- Requests **test coverage** improvement
- Mentions **testing**, **unit tests**, or **integration tests** for frontend code
- Wants to understand **testing patterns** in a codebase

**Do NOT apply** when:

- User is asking about backend/API tests (Python/pytest)
- User is asking about E2E tests (Playwright/Cypress)
- User is only asking conceptual questions without code context

## Quick Reference

### Tech Stack (Common)

| Tool | Purpose |
|------|---------|
| Vitest | Test runner (use `vi.*` APIs) |
| Jest | Alternative test runner (use `jest.*` APIs) |
| React Testing Library | Component testing |
| jsdom | Test environment |
| MSW / nock | HTTP mocking |
| TypeScript | Type safety |

### Common Test Commands

```bash
# Vitest
pnpm test
pnpm run test:watch
pnpm run test:coverage

# Jest
pnpm test
pnpm test -- --watch
pnpm test -- --coverage
```

### File Naming

- Test files: `ComponentName.spec.tsx` or `ComponentName.test.tsx` (same directory as component)
- Integration tests: `__tests__/` directory in project root or alongside components

## Test Structure Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Component from './index'

// ✅ Import real project components (DO NOT mock these)
import Loading from '@/components/loading'
import { ChildComponent } from './child-component'

// ✅ Mock external dependencies only (adapt to your project)
vi.mock('@/api')
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

// ✅ State management stores: Use real stores where possible
// Set test state with: useStore.setState({ ... })

// Shared state for mocks (if needed)
let mockSharedState = false

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSharedState = false
  })

  // Rendering tests (REQUIRED)
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const props = { title: 'Test' }
      render(<Component {...props} />)
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  // Props tests (REQUIRED)
  describe('Props', () => {
    it('should apply custom className', () => {
      render(<Component className="custom" />)
      expect(screen.getByRole('button')).toHaveClass('custom')
    })
  })

  // User Interactions
  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn()
      render(<Component onClick={handleClick} />)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  // Edge Cases (REQUIRED)
  describe('Edge Cases', () => {
    it('should handle null data', () => {
      render(<Component data={null} />)
      expect(screen.getByText(/no data/i)).toBeInTheDocument()
    })

    it('should handle empty array', () => {
      render(<Component items={[]} />)
      expect(screen.getByText(/empty/i)).toBeInTheDocument()
    })
  })
})
```

## Testing Workflow (CRITICAL)

### ⚠️ Incremental Approach Required

**NEVER generate all test files at once.** For complex components or multi-file directories:

1. **Analyze & Plan**: List all files, order by complexity (simple → complex)
2. **Process ONE at a time**: Write test → Run test → Fix if needed → Next
3. **Verify before proceeding**: Do NOT continue to next file until current passes

```
For each file:
  ┌────────────────────────────────────────┐
  │ 1. Write test                          │
  │ 2. Run: pnpm test path/file.spec.tsx   │
  │ 3. PASS? → Mark complete, next file    │
  │    FAIL? → Fix first, then continue    │
  └────────────────────────────────────────┘
```

### Complexity-Based Order

Process in this order for multi-file testing:

1. 🟢 Utility functions (simplest)
2. 🟢 Custom hooks
3. 🟡 Simple components (presentational)
4. 🟡 Medium components (state, effects)
5. 🔴 Complex components (API, routing)
6. 🔴 Integration tests (index files - last)

> See `references/workflow.md` for complete workflow details and todo list format.

## Testing Strategy

### Path-Level Testing (Directory Testing)

When assigned to test a directory/path, test **ALL content** within that path:

- Test all components, hooks, utilities in the directory (not just `index` file)
- Use incremental approach: one file at a time, verify each before proceeding
- Goal: 100% coverage of ALL files in the directory

### Integration Testing First

**Prefer integration testing** when writing tests for a directory:

- ✅ **Import real project components** directly
- ✅ **Only mock**: API services, routing libraries, complex context providers
- ❌ **DO NOT mock** base components unless absolutely necessary

## Core Principles

### 1. AAA Pattern (Arrange-Act-Assert)

Every test should clearly separate setup, action, and verification.

### 2. Black-Box Testing

- Test observable behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- **Prefer pattern matching over hardcoded strings**:

```typescript
// ❌ Avoid: hardcoded text assertions
expect(screen.getByText('Loading...')).toBeInTheDocument()

// ✅ Better: role-based queries
expect(screen.getByRole('status')).toBeInTheDocument()

// ✅ Better: pattern matching
expect(screen.getByText(/loading/i)).toBeInTheDocument()
```

### 3. Single Behavior Per Test

Each test verifies ONE user-observable behavior:

```typescript
// ✅ Good: One behavior
it('should disable button when loading', () => {
  render(<Button loading />)
  expect(screen.getByRole('button')).toBeDisabled()
})
```

### 4. Semantic Naming

Use `should <behavior> when <condition>`:

```typescript
it('should show error message when validation fails')
it('should call onSubmit when form is valid')
```

## Required Test Scenarios

### Always Required (All Components)

1. **Rendering**: Component renders without crashing
2. **Props**: Required props, optional props, default values
3. **Edge Cases**: null, undefined, empty values, boundary conditions

### Conditional (When Present)

| Feature | Test Focus |
|---------|-----------|
| `useState` | Initial state, transitions, cleanup |
| `useEffect` | Execution, dependencies, cleanup |
| Event handlers | All onClick, onChange, onSubmit, keyboard |
| API calls | Loading, success, error states |
| Routing | Navigation, params, query strings |
| `useCallback`/`useMemo` | Referential equality |
| Context | Provider values, consumer behavior |
| Forms | Validation, submission, error display |

## Coverage Goals (Per File)

For each test file generated, aim for:

- ✅ **100%** function coverage
- ✅ **100%** statement coverage
- ✅ **>95%** branch coverage
- ✅ **>95%** line coverage

## Detailed Guides

For more detailed information, refer to:

- `references/workflow.md` - Incremental testing workflow
- `references/mocking.md` - Mock patterns and best practices
- `references/async-testing.md` - Async operations and API calls
- `references/common-patterns.md` - Frequently used testing patterns
- `references/domain-components.md` - Testing complex components (dashboards, editors, data grids)
- `references/checklist.md` - Test generation checklist and validation steps

## Test Templates

Copy these templates as starting points when generating tests:

- [`assets/component-test.template.tsx`](assets/component-test.template.tsx) — React component test template
- [`assets/hook-test.template.ts`](assets/hook-test.template.ts) — Custom hook test template
- [`assets/utility-test.template.ts`](assets/utility-test.template.ts) — Utility function test template

## Common Testing Patterns by Framework

### React Router (if using)

```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '1' }),
  useLocation: () => ({ pathname: '/test' }),
}))
```

### Next.js (if using)

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/test',
  useSearchParams: new URLSearchParams(),
}))
```

### State Management

**Zustand:**
```typescript
useStore.setState({ value: 'test' })
```

**Redux:**
```typescript
const store = configureStore({ reducer: rootReducer })
render(<Provider store={store}><Component /></Provider>)
```

### HTTP Mocking

**MSW (recommended):**
```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(http.get('/api', () => HttpResponse.json({ data: 'test' })))
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Inline mock:**
```typescript
vi.mock('@/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' }),
}))
```
