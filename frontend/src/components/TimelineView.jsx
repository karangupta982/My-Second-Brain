import { useState } from 'react';

const TimelineView = ({ memories, onDelete, selectionMode, selectedIds, onToggleSelection }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getTypeLabel = (memory) => {
    if (memory.imagePath || memory.imageData) return 'Image';
    if (memory.text.includes('```') || memory.text.includes('function')) return 'Code';
    if (memory.url.includes('youtube.com') || memory.url.includes('vimeo.com')) return 'Video';
    if (memory.text.startsWith('"') || memory.text.startsWith('')) return 'Quote';
    if (memory.tags?.includes('todo') || memory.text.includes('TODO')) return 'Todo';
    if (memory.url.includes('amazon.com') || memory.tags?.includes('product')) return 'Product';
    if (memory.tags?.includes('note')) return 'Note';
    return 'Article';
  };

  // Group memories by date
  const groupedMemories = memories.reduce((groups, memory) => {
    const date = formatDate(memory.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(memory);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedMemories).sort((a, b) => {
    return new Date(b) - new Date(a); // Newest first
  });

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>

      {sortedDates.map((date, dateIndex) => (
        <div key={date} className="mb-12">
          {/* Date Header */}
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10">
              {new Date(groupedMemories[date][0].createdAt).getDate()}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{date}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {groupedMemories[date].length} {groupedMemories[date].length === 1 ? 'memory' : 'memories'}
              </p>
            </div>
          </div>

          {/* Memories for this date */}
          <div className="space-y-6 ml-8">
            {groupedMemories[date].map((memory, memoryIndex) => (
              <div
                key={memory._id}
                className="relative pl-8"
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 top-6 w-4 h-4 bg-white dark:bg-gray-800 border-4 border-blue-500 rounded-full z-10"></div>

                {/* Memory Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(memory._id)}
                          onChange={() => onToggleSelection(memory._id)}
                          className="w-5 h-5 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                      )}

                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {memory.title}
                              </h4>
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                {getTypeLabel(memory)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(memory.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {memory.similarity && (
                              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                {Math.round(memory.similarity * 100)}% match
                              </span>
                            )}
                            <button
                              onClick={() => onDelete(memory._id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                              title="Delete memory"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Image */}
                        {(memory.imagePath || memory.imageData) && (
                          <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <img
                              src={memory.imagePath ? `http://localhost:5000${memory.imagePath}` : memory.imageData}
                              alt={memory.title}
                              className="w-full h-auto max-h-64 object-contain"
                            />
                          </div>
                        )}

                        {/* Text */}
                        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                          {memory.text}
                        </p>

                        {/* Tags */}
                        {memory.tags && memory.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {memory.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                          <a
                            href={memory.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 truncate max-w-xs"
                          >
                            {new URL(memory.url).hostname}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineView;
