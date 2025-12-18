import { useEffect, useRef } from 'react';

export type DrawerPosition = 'left' | 'right' | 'bottom';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  title?: string;
  children: React.ReactNode;
}

export function MobileDrawer({
  isOpen,
  onClose,
  position = 'left',
  title,
  children,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const startTouchRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startTouchRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startTouchRef.current || !drawerRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startTouchRef.current.x;
    const deltaY = currentY - startTouchRef.current.y;

    // Close on swipe
    if (position === 'left' && deltaX < -50) {
      onClose();
    } else if (position === 'right' && deltaX > 50) {
      onClose();
    } else if (position === 'bottom' && deltaY > 50) {
      onClose();
    }
  };

  const getDrawerStyles = () => {
    const baseStyles = 'fixed bg-gray-900 dark:bg-gray-900 light:bg-white z-drawer transition-transform duration-300 ease-out';

    switch (position) {
      case 'left':
        return `${baseStyles} left-0 top-0 bottom-0 w-80 max-w-[85vw] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`;
      case 'right':
        return `${baseStyles} right-0 top-0 bottom-0 w-80 max-w-[85vw] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`;
      case 'bottom':
        return `${baseStyles} bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`;
      default:
        return baseStyles;
    }
  };

  if (!isOpen && position !== 'bottom') return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-drawer-backdrop transition-opacity duration-300 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`${getDrawerStyles()} md:hidden`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Swipe indicator for bottom drawer */}
        {position === 'bottom' && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-600 dark:bg-gray-600 light:bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 dark:border-gray-800 light:border-gray-200">
            <h2 className="text-lg font-semibold text-white dark:text-white light:text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white light:text-gray-600 light:hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </>
  );
}
