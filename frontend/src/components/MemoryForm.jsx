import { useState } from 'react';

const MemoryForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    text: '',
    url: '',
    title: '',
    context: '',
    tags: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert tags string to array
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== '');

    const memoryData = {
      text: formData.text,
      url: formData.url,
      title: formData.title,
      context: formData.context,
      tags,
    };

    onSave(memoryData);

    // Reset form
    setFormData({
      text: '',
      url: '',
      title: '',
      context: '',
      tags: '',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Add New Memory</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Page or article title"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="text" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Text *
          </label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="The text you want to save"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="url" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            URL *
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="https://example.com"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="context" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Notes (Optional)
          </label>
          <input
            type="text"
            id="context"
            name="context"
            value={formData.context}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="Add any additional notes or context"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Tags (Optional)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            placeholder="tag1, tag2, tag3"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Separate tags with commas</p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Save Memory
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MemoryForm;
