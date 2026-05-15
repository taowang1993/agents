# Domain-Specific Component Testing

This guide covers testing patterns for complex domain-specific components like dashboards, editors, data grids, and other feature-rich UI components.

## General Domain Component Patterns

### Key Test Areas

1. **State Management** - How component manages and displays data
2. **User Interactions** - Complex workflows and user flows
3. **Data Validation** - Input validation and error handling
4. **Data Display** - Various states (loading, empty, error, success)
5. **Integration** - How component integrates with services and stores

### Example: Data Table Component

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataTable from './data-table'

// Mock API if needed
vi.mock('@/api', () => ({
  fetchData: vi.fn(),
}))

describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'Item 1', status: 'active' },
    { id: '2', name: 'Item 2', status: 'inactive' },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render table headers', () => {
      render(<DataTable data={mockData} columns={columns} />)
      
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should render data rows', () => {
      render(<DataTable data={mockData} columns={columns} />)
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
    })

    it('should show empty state', () => {
      render(<DataTable data={[]} columns={columns} />)
      
      expect(screen.getByText(/no data/i)).toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('should sort by column when header clicked', async () => {
      const user = userEvent.setup()
      render(<DataTable data={mockData} columns={columns} />)
      
      await user.click(screen.getByText('Name'))
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('should allow row selection', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      
      render(<DataTable data={mockData} columns={columns} onSelect={onSelect} />)
      
      await user.click(screen.getByText('Item 1'))
      
      expect(onSelect).toHaveBeenCalledWith(mockData[0])
    })
  })

  describe('Pagination', () => {
    it('should show pagination controls', () => {
      const largeData = Array.from({ length: 50 }, (_, i) => ({ id: String(i), name: `Item ${i}` }))
      render(<DataTable data={largeData} columns={columns} pageSize={10} />)
      
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('should navigate pages', async () => {
      const user = userEvent.setup()
      const largeData = Array.from({ length: 25 }, (_, i) => ({ id: String(i), name: `Item ${i}` }))
      render(<DataTable data={largeData} columns={columns} pageSize={10} />)
      
      // First page shows items 1-10
      expect(screen.getByText('Item 0')).toBeInTheDocument()
      expect(screen.queryByText('Item 15')).not.toBeInTheDocument()
      
      // Navigate to next page
      await user.click(screen.getByRole('button', { name: /next/i }))
      
      // Now shows items 11-20
      expect(screen.queryByText('Item 0')).not.toBeInTheDocument()
      expect(screen.getByText('Item 15')).toBeInTheDocument()
    })
  })
})
```

## Editor Components

### Rich Text Editor Testing

```typescript
describe('RichTextEditor', () => {
  it('should render editor content', () => {
    render(<RichTextEditor content="<p>Hello world</p>" />)
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('should apply formatting', async () => {
    const user = userEvent.setup()
    render(<RichTextEditor onChange={vi.fn()} />)
    
    // Select text and apply bold
    // (Implementation depends on editor library)
    await user.keyboard('{Control>}b{/Control}')
    
    // Verify formatting applied
    expect(screen.getByRole('textbox')).toHaveAttribute('data-bold', 'true')
  })

  it('should handle paste with formatting', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    render(<RichTextEditor onChange={onChange} />)
    
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
    })
    pasteEvent.clipboardData.setData('text/html', '<p>Pasted content</p>')
    
    fireEvent(screen.getByRole('textbox'), pasteEvent)
    
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })
  })
})
```

## Form Wizards / Multi-Step Forms

```typescript
describe('WizardForm', () => {
  const steps = ['Basic Info', 'Configuration', 'Review']
  
  it('should render first step', () => {
    render(<WizardForm steps={steps} />)
    
    expect(screen.getByText('Basic Info')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
  })

  it('should validate current step before proceeding', async () => {
    const user = userEvent.setup()
    render(<WizardForm steps={steps} />)
    
    // Try to proceed without filling required field
    await user.click(screen.getByRole('button', { name: /next/i }))
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })

  it('should proceed to next step when valid', async () => {
    const user = userEvent.setup()
    render(<WizardForm steps={steps} />)
    
    await user.type(screen.getByLabelText(/name/i), 'My Project')
    await user.click(screen.getByRole('button', { name: /next/i }))
    
    expect(screen.getByText('Configuration')).toBeInTheDocument()
  })

  it('should allow going back', async () => {
    const user = userEvent.setup()
    render(<WizardForm steps={steps} initialStep={1} />)
    
    await user.click(screen.getByRole('button', { name: /back/i }))
    
    expect(screen.getByText('Basic Info')).toBeInTheDocument()
  })

  it('should submit on final step', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<WizardForm steps={steps} onSubmit={onSubmit} />)
    
    // Fill all steps
    await user.type(screen.getByLabelText(/name/i), 'My Project')
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    expect(onSubmit).toHaveBeenCalled()
  })
})
```

## Dashboard Widgets

```typescript
describe('DashboardWidget', () => {
  it('should show loading state', () => {
    vi.mock('@/api', () => ({
      fetchStats: vi.fn(() => new Promise(() => {})), // Never resolves
    }))
    
    render(<DashboardWidget type="stats" />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('should display data when loaded', async () => {
    vi.mock('@/api', () => ({
      fetchStats: vi.fn().mockResolvedValue({ total: 100, change: '+10%' }),
    }))
    
    render(<DashboardWidget type="stats" />)
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  it('should handle error state', async () => {
    vi.mock('@/api', () => ({
      fetchStats: vi.fn().mockRejectedValue(new Error('Failed to load')),
    }))
    
    render(<DashboardWidget type="stats" />)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })

  it('should refresh on button click', async () => {
    const fetchStats = vi.fn()
      .mockResolvedValueOnce({ total: 50 })
      .mockResolvedValueOnce({ total: 100 })
    
    vi.mock('@/api', () => ({
      fetchStats,
    }))
    
    render(<DashboardWidget type="stats" />)
    
    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument()
    })
    
    await userEvent.click(screen.getByRole('button', { name: /refresh/i }))
    
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })
})
```

## Complex Interaction Patterns

### Drag and Drop

```typescript
describe('DraggableList', () => {
  it('should handle drag and drop', async () => {
    const user = userEvent.setup()
    const onReorder = vi.fn()
    
    render(<DraggableList items={['A', 'B', 'C']} onReorder={onReorder} />)
    
    // Drag item B to position of A
    // Note: Actual implementation depends on DnD library
    const itemA = screen.getByText('A')
    const itemB = screen.getByText('B')
    
    await user.pointer([
      { target: itemB, keys: '[MouseLeft]' },
      { target: itemA, keys: '[/MouseLeft]' },
    ])
    
    expect(onReorder).toHaveBeenCalledWith(['B', 'A', 'C'])
  })
})
```

### Keyboard Navigation

```typescript
describe('KeyboardNavigableGrid', () => {
  it('should navigate with arrow keys', async () => {
    const user = userEvent.setup()
    render(<Grid items={items} />)
    
    // Focus first cell
    const firstCell = screen.getByRole('gridcell', { name: /cell-0-0/i })
    await user.click(firstCell)
    
    // Navigate right
    await user.keyboard('{ArrowRight}')
    
    const secondCell = screen.getByRole('gridcell', { name: /cell-0-1/i })
    expect(secondCell).toHaveFocus()
  })

  it('should activate cell on Enter', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()
    
    render(<Grid items={items} onActivate={onActivate} />)
    
    const cell = screen.getByRole('gridcell', { name: /cell-0-0/i })
    await user.click(cell)
    await user.keyboard('{Enter}')
    
    expect(onActivate).toHaveBeenCalled()
  })
})
```

## Performance Considerations

### Testing Large Lists

```typescript
describe('LargeList', () => {
  it('should virtualize long lists', () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` }))
    
    // With virtualization, only visible items are rendered
    render(<VirtualizedList data={largeData} />)
    
    // Only a subset should be in the DOM (e.g., ~20 items)
    const items = screen.getAllByRole('listitem')
    expect(items.length).toBeLessThan(100)
  })
})
```

### Memoization Verification

```typescript
describe('MemoizedComponent', () => {
  it('should not re-render when unrelated props change', () => {
    const renderCount = vi.fn()
    const ChildComponent = vi.fn(({ value }) => {
      renderCount()
      return <div>{value}</div>
    })
    
    const Parent = () => {
      const [count, setCount] = useState(0)
      const [ unrelated, setUnrelated] = useState('a')
      
      return (
        <>
          <button onClick={() => setCount(c => c + 1)}>Increment</button>
          <button onClick={() => setUnrelated('b')}>Change Unrelated</button>
          <ChildComponent value={count} />
        </>
      )
    }
    
    render(<Parent />)
    
    // Initial render
    expect(renderCount).toHaveBeenCalledTimes(1)
    
    // Click unrelated button - Child should NOT re-render
    fireEvent.click(screen.getByText('Change Unrelated'))
    expect(renderCount).toHaveBeenCalledTimes(1) // Still 1!
  })
})
```
