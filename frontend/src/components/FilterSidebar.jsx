import { useState, useEffect } from 'react';

const FilterSidebar = ({ onFilterChange, allMemories }) => {
  const [filters, setFilters] = useState({
    types: [],
    tags: [],
    dateRange: { start: '', end: '' },
    domain: '',
    hasImage: null,
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);

  // Extract unique tags and domains from all memories
  useEffect(() => {
    if (allMemories && allMemories.length > 0) {
      // Get unique tags
      const tags = new Set();
      allMemories.forEach(memory => {
        if (memory.tags && Array.isArray(memory.tags)) {
          memory.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags).sort());

      // Get unique domains
      const domains = new Set();
      allMemories.forEach(memory => {
        if (memory.url) {
          try {
            const domain = new URL(memory.url).hostname;
            domains.add(domain);
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });
      setAvailableDomains(Array.from(domains).sort());
    }
  }, [allMemories]);

  const handleTypeChange = (type) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];

    const newFilters = { ...filters, types: newTypes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagChange = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];

    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (field, value) => {
    const newFilters = {
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDomainChange = (e) => {
    const newFilters = { ...filters, domain: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleImageFilterChange = (value) => {
    const newFilters = { ...filters, hasImage: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      types: [],
      tags: [],
      dateRange: { start: '', end: '' },
      domain: '',
      hasImage: null,
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.tags.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.domain ||
    filters.hasImage !== null;

  const memoryTypes = [
    { id: 'article', label: 'Article' },
    { id: 'note', label: 'Note' },
    { id: 'code', label: 'Code' },
    { id: 'image', label: 'Image' },
    { id: 'quote', label: 'Quote' },
    { id: 'todo', label: 'Todo' },
    { id: 'video', label: 'Video' },
    { id: 'product', label: 'Product' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Type</h4>
        <div className="space-y-2">
          {memoryTypes.map(type => (
            <label key={type.id} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.types.includes(type.id)}
                onChange={() => handleTypeChange(type.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {type.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Date Range</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">From</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400">To</label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tags</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableTags.map(tag => (
              <label key={tag} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Domain Filter */}
      {availableDomains.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Source Domain</h4>
          <select
            value={filters.domain}
            onChange={handleDomainChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="">All domains</option>
            {availableDomains.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>
      )}

      {/* Image Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Has Image</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="hasImage"
              checked={filters.hasImage === null}
              onChange={() => handleImageFilterChange(null)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All</span>
          </label>
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="hasImage"
              checked={filters.hasImage === true}
              onChange={() => handleImageFilterChange(true)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">With image</span>
          </label>
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="hasImage"
              checked={filters.hasImage === false}
              onChange={() => handleImageFilterChange(false)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Without image</span>
          </label>
        </div>
      </div>

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filters.types.length + filters.tags.length + (filters.domain ? 1 : 0) +
             (filters.dateRange.start || filters.dateRange.end ? 1 : 0) +
             (filters.hasImage !== null ? 1 : 0)} active filter(s)
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
