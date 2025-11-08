import { useState, useEffect } from 'react';
import './App.css';
import MemoryCard from './components/MemoryCard';
import MemoryForm from './components/MemoryForm';
import SearchBar from './components/SearchBar';
import FilterSidebar from './components/FilterSidebar';
import ViewControls from './components/ViewControls';
import ListView from './components/ListView';
import TimelineView from './components/TimelineView';
import DarkModeToggle from './components/DarkModeToggle';
import { getAllMemories, saveMemory, semanticSearch, deleteMemory } from './services/api';

function App() {
  const [allMemories, setAllMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [displayedMemories, setDisplayedMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // View state
  const [viewMode, setViewMode] = useState('grid'); // grid, list, timeline
  const [sortBy, setSortBy] = useState('date-desc');
  const [filters, setFilters] = useState({
    types: [],
    tags: [],
    dateRange: { start: '', end: '' },
    domain: '',
    hasImage: null,
  });

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch all memories on component mount
  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllMemories();
      setAllMemories(response.data);
      setFilteredMemories(response.data);
      setDisplayedMemories(response.data);
      setIsSearching(false);
    } catch (err) {
      setError('Failed to load memories. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...allMemories];

    // Filter by type
    if (filters.types.length > 0) {
      result = result.filter(memory => {
        const type = detectType(memory);
        return filters.types.includes(type);
      });
    }

    // Filter by tags
    if (filters.tags.length > 0) {
      result = result.filter(memory => {
        return memory.tags && memory.tags.some(tag => filters.tags.includes(tag));
      });
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter(memory => {
        const memoryDate = new Date(memory.createdAt);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

        if (startDate && memoryDate < startDate) return false;
        if (endDate && memoryDate > endDate) return false;
        return true;
      });
    }

    // Filter by domain
    if (filters.domain) {
      result = result.filter(memory => {
        try {
          const domain = new URL(memory.url).hostname;
          return domain === filters.domain;
        } catch (e) {
          return false;
        }
      });
    }

    // Filter by has image
    if (filters.hasImage !== null) {
      result = result.filter(memory => {
        const hasImg = !!(memory.imagePath || memory.imageData);
        return hasImg === filters.hasImage;
      });
    }

    setFilteredMemories(result);
  }, [filters, allMemories]);

  // Apply sorting
  useEffect(() => {
    let result = [...filteredMemories];

    switch (sortBy) {
      case 'date-desc':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'relevance':
        result.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
        break;
      default:
        break;
    }

    setDisplayedMemories(result);
  }, [sortBy, filteredMemories]);

  const detectType = (memory) => {
    if (memory.imagePath || memory.imageData) return 'image';
    if (memory.text.includes('```') || memory.text.includes('function')) return 'code';
    if (memory.url.includes('youtube.com') || memory.url.includes('vimeo.com')) return 'video';
    if (memory.text.startsWith('"') || memory.text.startsWith('')) return 'quote';
    if (memory.tags?.includes('todo') || memory.text.includes('TODO')) return 'todo';
    if (memory.url.includes('amazon.com') || memory.tags?.includes('product')) return 'product';
    if (memory.tags?.includes('note')) return 'note';
    return 'article';
  };

  const handleSaveMemory = async (memoryData) => {
    try {
      setError(null);
      await saveMemory(memoryData);
      setShowForm(false);
      fetchMemories(); // Refresh the list
    } catch (err) {
      setError('Failed to save memory. Please try again.');
      console.error(err);
    }
  };

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);
      // Use semantic search with auto method selection
      const response = await semanticSearch(query, 'auto');
      setAllMemories(response.data);
      setFilteredMemories(response.data);
      setDisplayedMemories(response.data);
      setIsSearching(true);

      // Log search info
      if (response.searchType) {
        console.log(`Search type: ${response.searchType}, Method: ${response.embeddingMethod}`);
      }
    } catch (err) {
      setError('Failed to search memories. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    fetchMemories();
  };

  const handleDeleteMemory = async (id) => {
    try {
      setError(null);
      await deleteMemory(id);
      fetchMemories(); // Refresh the list
    } catch (err) {
      setError('Failed to delete memory. Please try again.');
      console.error(err);
    }
  };

  // Selection handlers
  const handleToggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Delete ${selectedIds.length} selected memories?`)) {
      return;
    }

    try {
      setError(null);
      await Promise.all(selectedIds.map(id => deleteMemory(id)));
      setSelectedIds([]);
      setSelectionMode(false);
      fetchMemories();
    } catch (err) {
      setError('Failed to delete some memories.');
      console.error(err);
    }
  };

  // Export handlers
  const handleExport = (format) => {
    const dataToExport = selectionMode && selectedIds.length > 0
      ? displayedMemories.filter(m => selectedIds.includes(m._id))
      : displayedMemories;

    switch (format) {
      case 'json':
        exportAsJSON(dataToExport);
        break;
      case 'markdown':
        exportAsMarkdown(dataToExport);
        break;
      case 'pdf':
        alert('PDF export coming soon! For now, try JSON or Markdown.');
        break;
      default:
        break;
    }
  };

  const exportAsJSON = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synapse-memories-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = (data) => {
    let markdown = '# Project Synapse - Exported Memories\n\n';
    markdown += `Exported on: ${new Date().toLocaleString()}\n`;
    markdown += `Total memories: ${data.length}\n\n`;
    markdown += '---\n\n';

    data.forEach((memory, index) => {
      markdown += `## ${index + 1}. ${memory.title}\n\n`;
      markdown += `**URL:** [${memory.url}](${memory.url})\n\n`;
      markdown += `**Created:** ${new Date(memory.createdAt).toLocaleString()}\n\n`;

      if (memory.tags && memory.tags.length > 0) {
        markdown += `**Tags:** ${memory.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`;
      }

      markdown += `${memory.text}\n\n`;

      if (memory.metadata?.context) {
        markdown += `> ${memory.metadata.context}\n\n`;
      }

      markdown += '---\n\n';
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synapse-memories-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Project Synapse</h1>
              <p className="text-blue-100 mt-2">Your Intelligent Second Brain</p>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />

        {/* Add Memory Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Memory
            </button>
          </div>
        )}

        {/* Memory Form */}
        {showForm && (
          <MemoryForm
            onSave={handleSaveMemory}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Main Layout with Sidebar and Content */}
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <FilterSidebar
              onFilterChange={setFilters}
              allMemories={allMemories}
            />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* View Controls */}
            <ViewControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              onExport={handleExport}
              selectionMode={selectionMode}
              onToggleSelectionMode={handleToggleSelectionMode}
              selectedCount={selectedIds.length}
            />

            {/* Bulk Actions Bar */}
            {selectionMode && selectedIds.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 dark:text-blue-200 font-medium">
                    {selectedIds.length} memory(ies) selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Memories Display */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Loading memories...</p>
              </div>
            ) : displayedMemories.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  {isSearching || filters.types.length > 0 || filters.tags.length > 0 ? 'No memories found' : 'No memories yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isSearching || filters.types.length > 0 || filters.tags.length > 0
                    ? 'Try different search or filter criteria'
                    : 'Start saving your thoughts and ideas!'}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600 dark:text-gray-300">
                  {isSearching ? `Found ${displayedMemories.length} result(s)` : `Showing ${displayedMemories.length} of ${allMemories.length} memories`}
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedMemories.map((memory) => (
                      <div key={memory._id} className="relative">
                        {selectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(memory._id)}
                            onChange={() => handleToggleSelection(memory._id)}
                            className="absolute top-4 left-4 w-5 h-5 z-10 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                        <MemoryCard
                          memory={memory}
                          onDelete={handleDeleteMemory}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <ListView
                    memories={displayedMemories}
                    onDelete={handleDeleteMemory}
                    selectionMode={selectionMode}
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggleSelection}
                  />
                )}

                {/* Timeline View */}
                {viewMode === 'timeline' && (
                  <TimelineView
                    memories={displayedMemories}
                    onDelete={handleDeleteMemory}
                    selectionMode={selectionMode}
                    selectedIds={selectedIds}
                    onToggleSelection={handleToggleSelection}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
