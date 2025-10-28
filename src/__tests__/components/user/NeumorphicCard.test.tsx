import { render, screen } from '@testing-library/react'
import { NeumorphicCard } from '@/components/user/NeumorphicCard'

describe('NeumorphicCard', () => {
  it('renders children correctly', () => {
    render(
      <NeumorphicCard>
        <div>Test Content</div>
      </NeumorphicCard>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <NeumorphicCard className="custom-class">
        <div>Test</div>
      </NeumorphicCard>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has proper neumorphic styling', () => {
    const { container } = render(
      <NeumorphicCard>
        <div>Test</div>
      </NeumorphicCard>
    )
    const card = container.firstChild
    expect(card).toHaveClass('rounded-2xl')
  })
})





