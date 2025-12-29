import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to trap focus within a container (for modals/dialogs)
 * Essential for accessibility - prevents focus from escaping modal
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => el.offsetParent !== null); // Only visible elements
  }, []);

  useEffect(() => {
    if (!isActive) {
      // Restore focus when trap is deactivated
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
      return;
    }

    // Save current focus
    previousActiveElement.current = document.activeElement;

    // Focus first element in container
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab from first element -> go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab from last element -> go to first
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, getFocusableElements]);

  return containerRef;
}

/**
 * Hook for arrow key navigation within a list/grid
 */
export function useArrowNavigation(
  itemCount: number,
  currentIndex: number,
  onIndexChange: (index: number) => void,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    columns?: number;
    loop?: boolean;
  } = {}
) {
  const { orientation = 'vertical', columns = 1, loop = true } = options;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowUp':
          if (orientation === 'grid') {
            newIndex = currentIndex - columns;
          } else if (orientation === 'vertical') {
            newIndex = currentIndex - 1;
          }
          break;

        case 'ArrowDown':
          if (orientation === 'grid') {
            newIndex = currentIndex + columns;
          } else if (orientation === 'vertical') {
            newIndex = currentIndex + 1;
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'grid') {
            newIndex = currentIndex - 1;
          }
          break;

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'grid') {
            newIndex = currentIndex + 1;
          }
          break;

        case 'Home':
          newIndex = 0;
          event.preventDefault();
          break;

        case 'End':
          newIndex = itemCount - 1;
          event.preventDefault();
          break;

        default:
          return;
      }

      event.preventDefault();

      // Handle bounds
      if (loop) {
        if (newIndex < 0) newIndex = itemCount - 1;
        if (newIndex >= itemCount) newIndex = 0;
      } else {
        newIndex = Math.max(0, Math.min(itemCount - 1, newIndex));
      }

      if (newIndex !== currentIndex) {
        onIndexChange(newIndex);
      }
    },
    [currentIndex, itemCount, orientation, columns, loop, onIndexChange]
  );

  return { handleKeyDown };
}

/**
 * Hook for managing roving tabindex pattern
 * Only one item in a group is tabbable at a time
 */
export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  activeIndex: number
) {
  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);

  useEffect(() => {
    const activeItem = items[activeIndex];
    if (activeItem) {
      activeItem.focus();
    }
  }, [items, activeIndex]);
}
