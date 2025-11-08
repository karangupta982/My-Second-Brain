import { useState, useEffect } from 'react';
import './App.css';
import MemoryCard from './components/MemoryCard';
import MemoryForm from './components/MemoryForm';
import SearchBar from './components/SearchBar';
import { getAllMemories, saveMemory, searchMemories, deleteMemory } from './services/api';

function App() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all memories on component mount
  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllMemories();
      setMemories(response.data);
      setIsSearching(false);
    } catch (err) {
      setError('Failed to load memories. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
      const response = await searchMemories(query);
      setMemories(response.data);
      setIsSearching(true);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">Project Synapse</h1>
          <p className="text-blue-100 mt-2">Your Second Brain</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
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

        {/* Memories Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading memories...</p>
          </div>
        ) : memories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {isSearching ? 'No memories found' : 'No memories yet'}
            </h3>
            <p className="text-gray-500">
              {isSearching
                ? 'Try a different search query'
                : 'Start saving your thoughts and ideas!'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              {isSearching ? `Found ${memories.length} result(s)` : `Total memories: ${memories.length}`}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memories.map((memory) => (
                <MemoryCard
                  key={memory._id}
                  memory={memory}
                  onDelete={handleDeleteMemory}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
