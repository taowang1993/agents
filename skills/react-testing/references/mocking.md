# Mocking Guide for React Tests

## ⚠️ Important: What NOT to Mock

### DO NOT Mock Base Components

**Avoid mocking fundamental UI components** unless absolutely necessary:

- Basic buttons, inputs, selects
- Typography components
- Common layout components
- Icons, badges, tags

**Why?**

- Base components will have their own dedicated tests
- Mocking them creates false positives (tests pass but real integration fails)
- Using real components tests actual integration behavior

```typescript
// ❌ WRONG: Don't mock base components unnecessarily
vi.mock('@/components/base/loading', () => () => <div>Loading</div>)
vi.mock('@/components/base/button', () => ({ children }: any) => <button>{children}</button>)

// ✅ CORRECT: Import and use real components when possible
import Loading from '@/components/base/loading'
import Button from '@/components/base/button'
// They will render normally in tests
```

### What TO Mock

Only mock these categories:

1. **API services** - Network calls (use MSW, nock, or inline mocks)
2. **Complex context providers** - When setup is too difficult
3. **Third-party libraries with side effects** - Routing libraries, external SDKs
4. **i18n** - Usually mocked to return translation keys

## Mock Placement

| Location | Purpose |
|----------|---------|
| Test setup file | Global mocks shared by all tests (i18n, image components, state management) |
| `__mocks__/` directory | Reusable mock factories shared across multiple test files |
| Test file | Test-specific mocks, inline with `vi.mock()` |

## Essential Mocks

### 1. i18n (Common Pattern)

Many projects use a global mock for translations:

```typescript
// Common: Mock returns translation keys
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}))
```

### 2. Routing Libraries

**React Router:**
```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '1' }),
  useLocation: () => ({ pathname: '/test' }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}))
```

**Next.js (if using):**
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: new URLSearchParams('foo=bar'),
}))
```

### 3. API Services

**Using MSW (recommended):**
```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/data', () => {
    return HttpResponse.json({ items: [] })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

**Using inline vi.mock:**
```typescript
vi.mock('@/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ items: [] }),
  updateData: vi.fn().mockResolvedValue({ success: true }),
}))
```

### 4. Third-Party Libraries

```typescript
vi.mock('some-lib', () => ({
  someFunction: vi.fn(),
  SomeComponent: ({ children }: { children: React.ReactNode }) => children,
}))
```

## Common Mock Patterns

### Mocking Timers

```typescript
// Fake timers for setTimeout, setInterval
vi.useFakeTimers()

// Advance time
vi.advanceTimersByTime(1000)

// Or run all pending timers
vi.runAllTimers()

// Always restore real timers after test
vi.useRealTimers()
```

### Mocking Modules with `vi.mock`

```typescript
// Must be at top of file (hoisted)
vi.mock('@/lib/utils', () => ({
  formatDate: vi.fn((date: Date) => '2024-01-01'),
  calculateTotal: vi.fn((items: number[]) => items.reduce((a, b) => a + b, 0)),
}))
```

### Mocking Default Exports

```typescript
vi.mock('./module', () => ({
  default: () => <div>Mocked</div>,
}))
```

### Mocking Named Exports

```typescript
vi.mock('./module', () => ({
  NamedComponent: () => <div>Mocked</div>,
  namedFunction: vi.fn(),
}))
```

## State Management Testing

### Zustand

```typescript
// Often globally mocked, or use setState for test state
import { useStore } from '@/store'

useStore.setState({ value: 'test' })
render(<Component />)
```

### Redux

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

const store = configureStore({ reducer: rootReducer })

render(
  <Provider store={store}>
    <Component />
  </Provider>
)
```

### Context

```typescript
const mockContextValue = { value: 'test' }

render(
  <MyContext.Provider value={mockContextValue}>
    <Component />
  </MyContext.Provider>
)
```

## Debugging Mock Issues

### Common Problems

1. **Mock not working**: Ensure `vi.mock()` is at top of file (hoisted)
2. **Mock called wrong number of times**: Check `vi.clearAllMocks()` in `beforeEach`
3. **Mock still has old behavior**: Check for multiple mock declarations
4. **Module not mocked**: Verify mock path matches import path exactly

### Debugging Tips

```typescript
// Check mock calls
expect(api.fetch).toHaveBeenCalledTimes(1)
expect(api.fetch).toHaveBeenCalledWith('/expected-path')

// Check mock return values
mockFn.mockReturnValue('value')
mockFn.mockResolvedValue('value')
mockFn.mockRejectedValue(new Error('error'))

// Inspect mock
console.log(mockFn.mock.calls)
```
