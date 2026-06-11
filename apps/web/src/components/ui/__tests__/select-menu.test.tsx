import { render, screen, fireEvent } from '@testing-library/react'
import { SelectMenu } from '../select-menu'
import { SelectOption } from '../select-types'

describe('SelectMenu', () => {
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ]

  const mockOnChoose = jest.fn()
  const mockOnActiveChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all options', () => {
    render(
      <SelectMenu
        activeIndex={0}
        listboxId="test-listbox"
        options={mockOptions}
        value=""
        onActiveChange={mockOnActiveChange}
        onChoose={mockOnChoose}
      />
    )

    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('calls onChoose when an option is clicked', () => {
    render(
      <SelectMenu
        activeIndex={0}
        listboxId="test-listbox"
        options={mockOptions}
        value=""
        onActiveChange={mockOnActiveChange}
        onChoose={mockOnChoose}
      />
    )

    fireEvent.click(screen.getByText('Option 1'))
    expect(mockOnChoose).toHaveBeenCalledWith(mockOptions[0])
  })

  it('calls onActiveChange when mouse enters an option', () => {
    render(
      <SelectMenu
        activeIndex={0}
        listboxId="test-listbox"
        options={mockOptions}
        value=""
        onActiveChange={mockOnActiveChange}
        onChoose={mockOnChoose}
      />
    )

    fireEvent.mouseEnter(screen.getByText('Option 2'))
    expect(mockOnActiveChange).toHaveBeenCalledWith(1)
  })

  it('disables option when disabled prop is true', () => {
    render(
      <SelectMenu
        activeIndex={0}
        listboxId="test-listbox"
        options={mockOptions}
        value=""
        onActiveChange={mockOnActiveChange}
        onChoose={mockOnChoose}
      />
    )

    const disabledOption = screen.getByRole('option', { name: 'Option 3' })
    expect(disabledOption).toBeDisabled()
  })

  it('shows check icon for selected option', () => {
    render(
      <SelectMenu
        activeIndex={0}
        listboxId="test-listbox"
        options={mockOptions}
        value="option1"
        onActiveChange={mockOnActiveChange}
        onChoose={mockOnChoose}
      />
    )

    // The check icon should be present when option is selected
    const selectedOption = screen.getByRole('option', { name: 'Option 1' })
    const iconContainer = selectedOption.querySelector('span')
    expect(iconContainer).not.toBeEmptyDOMElement()
    
  })
})
