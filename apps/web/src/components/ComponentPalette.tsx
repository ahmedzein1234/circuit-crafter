import { useCallback, useState } from 'react';
import type { ComponentType, LEDColor } from '@circuit-crafter/shared';
import { COMPONENT_CATEGORIES } from '@circuit-crafter/shared';
import { ComponentInfoPanel } from './ComponentInfoPanel';

interface ComponentInfo {
  type: ComponentType;
  name: string;
  description: string;
  icon: JSX.Element;
  // Optional variant properties
  variant?: {
    color?: LEDColor;
    voltage?: number;
  };
}

const allComponents: ComponentInfo[] = [
  {
    type: 'battery',
    name: '1.5V Battery',
    description: 'AA cell battery',
    variant: { voltage: 1.5 },
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <rect x="6" y="6" width="10" height="14" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="9" y="4" width="4" height="2" fill="currentColor" />
        <rect x="8" y="9" width="6" height="3" fill="#22c55e" />
        <text x="11" y="17" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none">1.5V</text>
      </svg>
    ),
  },
  {
    type: 'battery',
    name: '9V Battery',
    description: 'Standard 9V battery',
    variant: { voltage: 9 },
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <rect x="3" y="7" width="15" height="10" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="18" y="10" width="3" height="4" fill="currentColor" />
        <rect x="6" y="9" width="3" height="6" fill="#ef4444" />
        <rect x="11" y="9" width="3" height="6" fill="#ef4444" />
      </svg>
    ),
  },
  {
    type: 'battery',
    name: '12V Battery',
    description: 'High voltage battery',
    variant: { voltage: 12 },
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <rect x="2" y="8" width="18" height="10" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="20" y="11" width="3" height="4" fill="currentColor" />
        <rect x="4" y="10" width="4" height="6" fill="#3b82f6" />
        <rect x="9" y="10" width="4" height="6" fill="#3b82f6" />
        <rect x="14" y="10" width="4" height="6" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    type: 'ground',
    name: 'Ground',
    description: '0V reference',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="4" x2="12" y2="10" />
        <line x1="6" y1="10" x2="18" y2="10" />
        <line x1="8" y1="14" x2="16" y2="14" />
        <line x1="10" y1="18" x2="14" y2="18" />
      </svg>
    ),
  },
  {
    type: 'resistor',
    name: 'Resistor',
    description: '1kOhm resistance',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12h3l2-4 3 8 3-8 3 8 2-4h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'capacitor',
    name: 'Capacitor',
    description: 'Stores charge',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="2" y1="12" x2="9" y2="12" />
        <line x1="9" y1="6" x2="9" y2="18" strokeWidth="3" />
        <line x1="15" y1="6" x2="15" y2="18" strokeWidth="3" />
        <line x1="15" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    type: 'potentiometer',
    name: 'Potentiometer',
    description: 'Variable resistor',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12h3l2-3 2 6 2-6 2 6 2-3h7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6l0-3" strokeLinecap="round" />
        <path d="M10 4l2 2l2-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    type: 'switch',
    name: 'Switch',
    description: 'Toggle open/closed',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="4" cy="12" r="2" fill="currentColor" />
        <circle cx="20" cy="12" r="2" fill="currentColor" />
        <line x1="6" y1="12" x2="18" y2="6" />
      </svg>
    ),
  },
  {
    type: 'diode',
    name: 'Diode',
    description: 'One-way current',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="2" y1="12" x2="8" y2="12" />
        <polygon points="8,6 8,18 16,12" fill="currentColor" stroke="currentColor" />
        <line x1="16" y1="6" x2="16" y2="18" strokeWidth="3" />
        <line x1="16" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    type: 'transistor',
    name: 'Transistor',
    description: 'NPN amplifier/switch',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <line x1="8" y1="8" x2="8" y2="16" strokeWidth="3" />
        <line x1="2" y1="12" x2="8" y2="12" />
        <line x1="8" y1="9" x2="14" y2="5" />
        <line x1="8" y1="15" x2="14" y2="19" />
        <line x1="12" y1="3" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    type: 'led',
    name: 'Red LED',
    description: 'Red light emitting diode',
    variant: { color: 'red' },
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,4 4,14 20,14" fill="#ef4444" stroke="#ef4444" />
        <line x1="4" y1="16" x2="20" y2="16" />
        <line x1="16" y1="8" x2="20" y2="4" />
        <line x1="18" y1="10" x2="22" y2="8" />
      </svg>
    ),
  },
  {
    type: 'led',
    name: 'Green LED',
    description: 'Green light emitting diode',
    variant: { color: 'green' },
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,4 4,14 20,14" fill="#22c55e" stroke="#22c55e" />
        <line x1="4" y1="16" x2="20" y2="16" />
        <line x1="16" y1="8" x2="20" y2="4" />
        <line x1="18" y1="10" x2="22" y2="8" />
      </svg>
    ),
  },
  {
    type: 'led',
    name: 'Blue LED',
    description: 'Blue light emitting diode',
    variant: { color: 'blue' },
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,4 4,14 20,14" fill="#3b82f6" stroke="#3b82f6" />
        <line x1="4" y1="16" x2="20" y2="16" />
        <line x1="16" y1="8" x2="20" y2="4" />
        <line x1="18" y1="10" x2="22" y2="8" />
      </svg>
    ),
  },
  {
    type: 'led',
    name: 'Yellow LED',
    description: 'Yellow light emitting diode',
    variant: { color: 'yellow' },
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12,4 4,14 20,14" fill="#eab308" stroke="#eab308" />
        <line x1="4" y1="16" x2="20" y2="16" />
        <line x1="16" y1="8" x2="20" y2="4" />
        <line x1="18" y1="10" x2="22" y2="8" />
      </svg>
    ),
  },
  {
    type: 'buzzer',
    name: 'Buzzer',
    description: 'Audio output',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="10" cy="12" r="6" />
        <circle cx="10" cy="12" r="3" fill="currentColor" />
        <path d="M18 8c1.5 1.5 1.5 6.5 0 8" />
        <path d="M21 6c2 3 2 9 0 12" />
      </svg>
    ),
  },
  {
    type: 'motor',
    name: 'Motor',
    description: 'DC motor',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">M</text>
      </svg>
    ),
  },
  {
    type: 'fuse',
    name: 'Fuse',
    description: 'Overcurrent protection',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="8" width="12" height="8" rx="2" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="9" y1="12" x2="15" y2="12" strokeWidth="1" />
      </svg>
    ),
  },
  {
    type: 'and_gate',
    name: 'AND Gate',
    description: 'Logic AND',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h8a8 8 0 0 1 0 16H4V4z" />
        <line x1="1" y1="8" x2="4" y2="8" />
        <line x1="1" y1="16" x2="4" y2="16" />
        <line x1="20" y1="12" x2="23" y2="12" />
      </svg>
    ),
  },
  {
    type: 'or_gate',
    name: 'OR Gate',
    description: 'Logic OR',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4c4 0 8 4 8 8s-4 8-8 8c2-2.5 3-5 3-8s-1-5.5-3-8z" />
        <path d="M4 4h4c6 0 12 8 12 8s-6 8-12 8H4" />
        <line x1="1" y1="8" x2="5" y2="8" />
        <line x1="1" y1="16" x2="5" y2="16" />
        <line x1="20" y1="12" x2="23" y2="12" />
      </svg>
    ),
  },
  {
    type: 'not_gate',
    name: 'NOT Gate',
    description: 'Logic inverter',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="4,4 4,20 16,12" />
        <circle cx="18" cy="12" r="2" />
        <line x1="1" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="23" y2="12" />
      </svg>
    ),
  },
];

const categoryOrder: Array<keyof typeof COMPONENT_CATEGORIES> = [
  'power',
  'passive',
  'active',
  'logic',
  'output',
  'protection',
];

export function ComponentPalette() {
  const [selectedInfoType, setSelectedInfoType] = useState<ComponentType | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categoryOrder));

  const handleDragStart = useCallback(
    (e: React.DragEvent, component: ComponentInfo) => {
      console.log('Drag start:', component.type, component.variant);
      e.dataTransfer.setData('component-type', component.type);
      if (component.variant) {
        e.dataTransfer.setData('component-variant', JSON.stringify(component.variant));
      }
      e.dataTransfer.effectAllowed = 'copy';
      // Set a drag image
      if (e.currentTarget instanceof HTMLElement) {
        e.dataTransfer.setDragImage(e.currentTarget, 30, 30);
      }
    },
    []
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getComponentsForCategory = (categoryKey: keyof typeof COMPONENT_CATEGORIES) => {
    const category = COMPONENT_CATEGORIES[categoryKey];
    return allComponents.filter((c) => category.components.includes(c.type));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 md:p-4 border-b border-gray-800 dark:border-gray-800 light:border-gray-200 md:block hidden">
        <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-400 light:text-gray-600 uppercase tracking-wider">
          Components
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-500 light:text-gray-500 mt-1">Drag onto canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 md:p-3 space-y-2 no-scrollbar">
        {/* Mobile: Horizontal scrolling categories */}
        <div className="md:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categoryOrder.map((categoryKey) => {
              const category = COMPONENT_CATEGORIES[categoryKey];
              return (
                <button
                  key={categoryKey}
                  onClick={() => toggleCategory(categoryKey)}
                  className={`px-4 py-2 rounded-lg text-mobile-sm font-medium whitespace-nowrap transition-colors ${
                    expandedCategories.has(categoryKey)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Collapsible categories */}
        {categoryOrder.map((categoryKey) => {
          const category = COMPONENT_CATEGORIES[categoryKey];
          const components = getComponentsForCategory(categoryKey);
          const isExpanded = expandedCategories.has(categoryKey);

          return (
            <div key={categoryKey} className="mb-2">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between text-xs md:text-sm font-medium text-gray-500 dark:text-gray-500 light:text-gray-600 mb-2 px-1 hover:text-gray-300 dark:hover:text-gray-300 light:hover:text-gray-800 transition-colors hidden md:flex"
              >
                <span>{category.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="space-y-2 md:space-y-1">
                  {components.map((component, index) => (
                    <ComponentItem
                      key={`${component.type}-${component.variant?.color || index}`}
                      component={component}
                      onDragStart={handleDragStart}
                      onInfoClick={() => setSelectedInfoType(component.type)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Panel */}
      {selectedInfoType && (
        <div className="border-t border-gray-800 dark:border-gray-800 light:border-gray-200">
          <ComponentInfoPanel
            componentType={selectedInfoType}
            onClose={() => setSelectedInfoType(null)}
          />
        </div>
      )}

      {/* Help section - Desktop only */}
      <div className="p-3 border-t border-gray-800 dark:border-gray-800 light:border-gray-200 text-xs text-gray-500 dark:text-gray-500 light:text-gray-500 hidden md:block">
        <p className="mb-1">
          <kbd className="px-1.5 py-0.5 bg-gray-800 dark:bg-gray-800 light:bg-gray-200 rounded">R</kbd> Rotate
        </p>
        <p className="mb-1">
          <kbd className="px-1.5 py-0.5 bg-gray-800 dark:bg-gray-800 light:bg-gray-200 rounded">Del</kbd> Delete
        </p>
        <p>
          <kbd className="px-1.5 py-0.5 bg-gray-800 dark:bg-gray-800 light:bg-gray-200 rounded">Esc</kbd> Cancel
        </p>
      </div>
    </div>
  );
}

interface ComponentItemProps {
  component: ComponentInfo;
  onDragStart: (e: React.DragEvent, component: ComponentInfo) => void;
  onInfoClick: () => void;
}

function ComponentItem({ component, onDragStart, onInfoClick }: ComponentItemProps) {
  return (
    <div
      className="component-item flex items-center gap-3 text-gray-300 dark:text-gray-300 light:text-gray-700 group p-2 md:p-0 rounded-lg md:rounded-none hover:bg-gray-800/50 md:hover:bg-transparent transition-colors"
      draggable
      onDragStart={(e) => onDragStart(e, component)}
    >
      <div className="w-12 h-12 md:w-10 md:h-10 min-w-touch-target md:min-w-0 flex items-center justify-center bg-gray-800 dark:bg-gray-800 light:bg-gray-200 rounded-lg flex-shrink-0">
        {component.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-mobile-base md:text-sm">{component.name}</p>
        <p className="text-mobile-xs md:text-xs text-gray-500 dark:text-gray-500 light:text-gray-600 truncate">{component.description}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInfoClick();
        }}
        className="md:opacity-0 md:group-hover:opacity-100 p-2 md:p-1 min-w-touch-target md:min-w-0 text-gray-500 dark:text-gray-500 light:text-gray-600 hover:text-blue-400 dark:hover:text-blue-400 light:hover:text-blue-600 transition-all"
        title="Learn more"
      >
        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}
