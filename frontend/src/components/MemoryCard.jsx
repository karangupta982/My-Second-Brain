import { useState } from 'react';

const MemoryCard = ({ memory, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      onDelete(memory._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex-1">{memory.title}</h3>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 ml-2"
          title="Delete memory"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {(memory.imagePath || memory.imageData) && (
        <div className="mb-3 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={memory.imagePath ? `http://localhost:5000${memory.imagePath}` : memory.imageData}
            alt={memory.title}
            className="w-full h-auto max-h-64 object-contain hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <p className={`text-gray-600 mb-3 ${!isExpanded && 'line-clamp-3'}`}>
        {memory.text}
      </p>

      {memory.text.length > 150 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 text-sm mb-2"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {memory.metadata?.context && (
        <p className="text-sm text-gray-500 italic mb-2">
          Note: {memory.metadata.context}
        </p>
      )}

      {memory.tags && memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {memory.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-2">
        <a
          href={memory.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 truncate max-w-xs"
        >
          {memory.url}
        </a>
        <span className="text-xs">{formatDate(memory.createdAt)}</span>
      </div>
    </div>
  );
};

export default MemoryCard;
