import React from 'react';

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: Shortcut[];
}

export function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  if (!isOpen) return null;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  const categories: ShortcutCategory[] = [
    {
      title: 'File',
      shortcuts: [
        { keys: [modKey, 'S'], description: 'Save circuit' },
        { keys: [modKey, 'O'], description: 'Open saved circuit' },
      ],
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['Drag Canvas'], description: 'Pan the canvas' },
        { keys: ['Mouse Wheel'], description: 'Zoom in/out' },
        { keys: ['Esc'], description: 'Deselect all / Cancel wire drawing' },
      ],
    },
    {
      title: 'Editing',
      shortcuts: [
        { keys: ['R'], description: 'Rotate selected component' },
        { keys: ['Del'], description: 'Delete selected component or wire' },
        { keys: ['Backspace'], description: 'Delete selected component or wire' },
        { keys: [modKey, 'Z'], description: 'Undo last action' },
        { keys: [modKey, 'Shift', 'Z'], description: 'Redo last action' },
        { keys: [modKey, 'Y'], description: 'Redo last action (Windows)' },
      ],
    },
    {
      title: 'Canvas',
      shortcuts: [
        { keys: ['Drag Component'], description: 'Place component from palette' },
        { keys: ['Click Terminal'], description: 'Start/finish wire connection' },
        { keys: ['Click Component'], description: 'Select component' },
        { keys: ['Click Canvas'], description: 'Deselect all' },
      ],
    },
    {
      title: 'Simulation',
      shortcuts: [
        { keys: ['Space'], description: 'Run simulation' },
        { keys: ['Click Switch'], description: 'Toggle switch state' },
      ],
    },
    {
      title: 'Help',
      shortcuts: [
        { keys: [modKey, '?'], description: 'Show this help panel' },
        { keys: ['?'], description: 'Show this help panel' },
      ],
    },
  ];

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle Escape key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="panel max-w-3xl w-full max-h-[80vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-sm px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-gray-400">Quick reference guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-w-11 min-h-11 p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close keyboard shortcuts dialog"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {categories.map((category) => (
            <div key={category.title}>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-gray-300 text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-gray-500 text-xs mx-1">+</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-semibold text-white bg-gray-900 border border-gray-700 rounded shadow-sm min-w-[2rem] text-center">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
          <p className="text-xs text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-white bg-gray-900 border border-gray-700 rounded">Esc</kbd> or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
}
