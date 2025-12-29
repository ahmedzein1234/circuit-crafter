// Templates Modal - Browse and load pre-built circuit templates

import { useState, useEffect } from 'react';
import { circuitTemplates, type CircuitTemplate } from '../data/circuitTemplates';
import { useCircuitStore } from '../stores/circuitStore';
import { useCircuitsManagerStore } from '../stores/circuitsManagerStore';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'all' | CircuitTemplate['category'];
type Difficulty = 'all' | CircuitTemplate['difficulty'];

const categoryLabels: Record<Category, string> = {
  all: 'All Templates',
  basics: 'Basic Circuits',
  logic: 'Logic Gates',
  practical: 'Practical',
  fun: 'Fun Projects',
};

const categoryIcons: Record<Category, string> = {
  all: '📚',
  basics: '💡',
  logic: '🔲',
  practical: '⚙️',
  fun: '🎨',
};

const difficultyColors: Record<CircuitTemplate['difficulty'], string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmLoad, setConfirmLoad] = useState<CircuitTemplate | null>(null);

  const { loadCircuit, components } = useCircuitStore();
  const { clearCurrentCircuit, setHasUnsavedChanges } = useCircuitsManagerStore();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory('all');
      setSelectedDifficulty('all');
      setSearchQuery('');
      setConfirmLoad(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (confirmLoad) {
          setConfirmLoad(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, confirmLoad]);

  if (!isOpen) return null;

  // Filter templates
  const filteredTemplates = circuitTemplates.filter((template) => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'all' && template.difficulty !== selectedDifficulty) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const handleLoadTemplate = (template: CircuitTemplate) => {
    // If there are existing components, ask for confirmation
    if (components.length > 0) {
      setConfirmLoad(template);
    } else {
      performLoad(template);
    }
  };

  const performLoad = (template: CircuitTemplate) => {
    const { components: newComponents, wires } = template.create();
    loadCircuit(newComponents, wires);
    clearCurrentCircuit();
    setHasUnsavedChanges(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-xl">
              📋
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Circuit Templates</h2>
              <p className="text-sm text-gray-400">Start with a pre-built circuit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-700 bg-gray-800/50">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-48">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-1">
              {(Object.keys(categoryLabels) as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-1">{categoryIcons[cat]}</span>
                  <span className="hidden sm:inline">{cat === 'all' ? 'All' : categoryLabels[cat]}</span>
                </button>
              ))}
            </div>

            {/* Difficulty filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-400">No templates match your filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-4 transition-all cursor-pointer"
                  onClick={() => handleLoadTemplate(template)}
                >
                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{template.name}</h3>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${difficultyColors[template.difficulty]}`}
                      >
                        {template.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Load hint */}
                  <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{categoryLabels[template.category]}</span>
                    <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to load →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-700 bg-gray-800/50 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation dialog */}
      {confirmLoad && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmLoad(null)} />
          <div className="relative bg-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{confirmLoad.icon}</div>
              <h3 className="text-lg font-semibold text-white">Load "{confirmLoad.name}"?</h3>
            </div>
            <p className="text-sm text-gray-400 text-center mb-4">
              This will replace your current circuit. Make sure to save first if you want to keep it!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLoad(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  performLoad(confirmLoad);
                  setConfirmLoad(null);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
              >
                Load Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
