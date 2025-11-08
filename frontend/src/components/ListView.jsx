import { useState } from 'react';

const ListView = ({ memories, onDelete, selectionMode, selectedIds, onToggleSelection }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTypeLabel = (memory) => {
    // Auto-detect type based on content
    if (memory.imagePath || memory.imageData) return 'Image';
    if (memory.text.includes('```') || memory.text.includes('function')) return 'Code';
    if (memory.url.includes('youtube.com') || memory.url.includes('vimeo.com')) return 'Video';
    if (memory.text.startsWith('"') || memory.text.startsWith('')) return 'Quote';
    if (memory.tags?.includes('todo') || memory.text.includes('TODO')) return 'Todo';
    if (memory.url.includes('amazon.com') || memory.tags?.includes('product')) return 'Product';
    if (memory.tags?.includes('note')) return 'Note';
    return 'Article';
  };

  return (
    <div className="space-y-3">
      {memories.map((memory) => (
        <div
          key={memory._id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          <div className="flex items-center gap-4 p-4">
            {/* Selection Checkbox */}
            {selectionMode && (
              <input
                type="checkbox"
                checked={selectedIds.includes(memory._id)}
                onChange={() => onToggleSelection(memory._id)}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            )}

            {/* Type Label */}
            <div className="flex-shrink-0">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                {getTypeLabel(memory)}
              </span>
            </div>

            {/* Thumbnail (if image) */}
            {(memory.imagePath || memory.imageData) && (
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={memory.imagePath ? `http://localhost:5000${memory.imagePath}` : memory.imageData}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                  {memory.title}
                </h3>
                {memory.similarity && (
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {Math.round(memory.similarity * 100)}% match
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                {truncateText(memory.text)}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Tags */}
                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {memory.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {memory.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{memory.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* URL */}
                <a
                  href={memory.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs truncate max-w-xs"
                >
                  {new URL(memory.url).hostname}
                </a>

                {/* Date */}
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(memory.createdAt)}
                </span>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(memory._id)}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 flex-shrink-0"
              title="Delete memory"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;
