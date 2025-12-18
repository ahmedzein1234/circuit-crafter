import { useState } from 'react';
import { useSocialStore } from '../../stores/socialStore';
import { useCircuitStore } from '../../stores/circuitStore';

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-500' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-500' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-500' },
  { value: 'expert', label: 'Expert', color: 'bg-red-500' },
] as const;

const POPULAR_TAGS = ['led', 'battery', 'resistor', 'logic', 'motor', 'sensor', 'arduino', 'beginner', 'tutorial'];

export function ShareCircuitModal() {
  const {
    isShareModalOpen,
    closeShareModal,
    shareCircuitName,
    shareCircuitDescription,
    shareCircuitTags,
    shareCircuitDifficulty,
    setShareCircuitName,
    setShareCircuitDescription,
    setShareCircuitTags,
    setShareCircuitDifficulty,
    shareCircuit,
  } = useSocialStore();

  const { components, wires } = useCircuitStore();
  const [tagInput, setTagInput] = useState('');

  if (!isShareModalOpen) return null;

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !shareCircuitTags.includes(normalizedTag)) {
      setShareCircuitTags([...shareCircuitTags, normalizedTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setShareCircuitTags(shareCircuitTags.filter((t) => t !== tag));
  };

  const handleShare = () => {
    const circuitData = JSON.stringify({ components, wires });
    shareCircuit(circuitData);
  };

  const isValid = shareCircuitName.trim().length > 0 && components.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Share Your Circuit</h2>
          <button
            onClick={closeShareModal}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Circuit Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Circuit Name *
            </label>
            <input
              type="text"
              value={shareCircuitName}
              onChange={(e) => setShareCircuitName(e.target.value)}
              placeholder="Give your circuit a name..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={shareCircuitDescription}
              onChange={(e) => setShareCircuitDescription(e.target.value)}
              placeholder="Describe what your circuit does..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty Level
            </label>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setShareCircuitDifficulty(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    shareCircuitDifficulty === option.value
                      ? `${option.color} text-white`
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {shareCircuitTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/30 text-blue-300 text-sm rounded-full"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>

            {/* Popular tags */}
            <div className="mt-2">
              <span className="text-xs text-gray-500">Popular: </span>
              {POPULAR_TAGS.filter((t) => !shareCircuitTags.includes(t)).slice(0, 5).map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="text-xs text-gray-400 hover:text-blue-400 mr-2"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Circuit Preview */}
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Circuit Preview</div>
            <div className="text-white">
              {components.length} components, {wires.length} wires
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
          <button
            onClick={closeShareModal}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={!isValid}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Circuit
          </button>
        </div>
      </div>
    </div>
  );
}
