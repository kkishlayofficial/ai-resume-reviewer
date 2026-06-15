import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTheme } from '../useTheme';
import { renderHook, act } from '@testing-library/react';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should return light theme by default', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggle();
    });
    expect(result.current.theme).toBe('dark');
  });

  it('should apply theme to document element', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should set theme to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should load theme from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('should update document attribute when theme changes', () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    act(() => {
      result.current.toggle();
    });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should persist theme across renders', () => {
    const { result, rerender } = renderHook(() => useTheme());
    act(() => {
      result.current.toggle();
    });
    rerender();
    expect(result.current.theme).toBe('dark');
  });
});
