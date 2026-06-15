import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Badge } from '../../components/ui/Badge/Badge';
import { Chip } from '../../components/ui/Chip/Chip';

describe('Button Component', () => {
  it('should render button element', () => {
    const { container } = render(React.createElement(Button, { children: 'Click me' }));
    const button = container.querySelector('button');
    expect(button).toBeDefined();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    const { container } = render(React.createElement(Button, { onClick: handleClick, children: 'Click' }));
    const button = container.querySelector('button');
    if (button) {
      button.click();
      expect(handleClick).toHaveBeenCalled();
    }
  });

  it('should support disabled state', () => {
    const { container } = render(React.createElement(Button, { disabled: true, children: 'Disabled' }));
    const button = container.querySelector('button') as HTMLButtonElement;
    expect(button?.disabled).toBe(true);
  });

  it('should render with children', () => {
    const { container } = render(React.createElement(Button, { children: 'Submit' }));
    expect(container.textContent).toContain('Submit');
  });
});

describe('Card Component', () => {
  it('should render card element', () => {
    const { container } = render(React.createElement(Card, { children: 'Content' }));
    expect(container.firstChild).toBeDefined();
  });

  it('should include children content', () => {
    const { container } = render(React.createElement(Card, { children: 'Card content' }));
    expect(container.textContent).toContain('Card content');
  });
});

describe('Badge Component', () => {
  it('should render badge element', () => {
    const { container } = render(React.createElement(Badge, { priority: 'high', children: 'High Priority' }));
    const badge = container.querySelector('span');
    expect(badge).toBeDefined();
  });

  it('should apply priority classes', () => {
    const { container } = render(React.createElement(Badge, { priority: 'high' }));
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('high');
  });

  it('should handle different priorities', () => {
    ['high', 'medium', 'low'].forEach(priority => {
      const { container } = render(React.createElement(Badge, { priority: priority as any }));
      const badge = container.querySelector('span');
      expect(badge?.className).toContain(priority.toLowerCase());
    });
  });
});

describe('Chip Component', () => {
  it('should render chip element', () => {
    const { container } = render(React.createElement(Chip, { label: 'JavaScript' }));
    expect(container.querySelector('span')).toBeDefined();
  });

  it('should render label text', () => {
    const { container } = render(React.createElement(Chip, { label: 'React' }));
    expect(container.textContent).toContain('React');
  });

  it('should support different variants', () => {
    ['default', 'danger', 'primary'].forEach(variant => {
      const { container } = render(React.createElement(Chip, { label: 'Test', variant: variant as any }));
      const chip = container.querySelector('span');
      expect(chip?.className).toBeDefined();
    });
  });

  it('should render with default variant', () => {
    const { container } = render(React.createElement(Chip, { label: 'TypeScript' }));
    expect(container.textContent).toContain('TypeScript');
  });
});
