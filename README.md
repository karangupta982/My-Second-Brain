# **Project Synapse: Your Intelligent Second Brain**

Project Synapse is a next-generation productivity tool that acts as your second brain. It allows you to capture, store, and rediscover information intelligently using **semantic search** powered by AI embeddings. It's not just a place to save links or text — it's an intelligent memory system that understands, connects, and helps you rediscover what you save using natural language.

---

## **Overview**

Project Synapse solves a common problem: forgetting useful information that we come across online. Whether it's a quote, an article snippet, a research insight, or a to-do note, we often save it somewhere and then lose track of it. Synapse provides a unified way to capture, organize, and **intelligently search** all of these thoughts using AI-powered semantic search.

**Key Capabilities:**
* 🧠 **Semantic Search** - Search using natural language: "articles about AI from last month"
* 🎯 **Context-Aware** - Automatically shows your saved memories when revisiting websites
* 💎 **100% Free** - Local AI embeddings work without any API keys
* ⚡ **Zero Setup** - Works immediately after installation
* 🔒 **Private** - All data stays in your MongoDB, embeddings generated locally

Built with Node.js, Express.js, React.js, MongoDB, and Transformers.js.

---

## **The Core Vision**

The goal of Project Synapse is to create a private, intelligent space that doesn’t just store data — it understands context, connects related thoughts, and allows you to search your past ideas naturally.

Imagine highlighting a section of a web page, saving it with one click, and later being able to search or visualize your saved thoughts as if you were exploring your own mind.

---

## **Tech Stack**

| Layer                | Technology                                        |
| -------------------- | ------------------------------------------------- |
| Frontend (Extension) | HTML, CSS, JavaScript (Chrome Extension)          |
| Backend API          | Node.js, Express.js                               |
| Database             | MongoDB (Mongoose ODM) with Vector Embeddings     |
| Frontend Dashboard   | React.js, Vite, Tailwind CSS                      |
| Semantic Search      | Transformers.js (local), OpenAI Embeddings (optional) |
| NLP Processing       | chrono-node (dates), natural (text processing)    |
| Hosting (Future)     | Netlify for frontend, Render or Atlas for backend |

---

## **System Architecture**

```
Browser Extension (capture information from any webpage)
    ↓
Express.js Backend (API + Semantic Search Engine)
    ├─ Local Embeddings (Transformers.js - FREE)
    ├─ OpenAI Embeddings (Optional - Best Quality)
    ├─ Vector Similarity Search (Cosine Similarity)
    └─ Natural Language Query Parser
    ↓
MongoDB Database (memories + 384/1536-dim embeddings)
    ↓
React.js Frontend Dashboard (search & visualize memories)
```

---

## **How It Works - Complete Flow**

### **Saving Memories:**

1. **Select text** on any website
2. **Right-click** → "Save to Synapse" (or press `Ctrl+Shift+S`)
3. **Save modal appears** with:
   - Editable title (pre-filled with page title)
   - Selected text (editable)
   - Optional notes/context field
   - Optional tags field (comma-separated)
   - Source URL displayed
4. **Click "Save Memory"**
5. **Backend processes:**
   - Saves to MongoDB
   - Generates embedding automatically (local or OpenAI)
   - Stores 384 or 1536-dimensional vector
6. **Success notification** appears

### **Searching Memories:**

1. **Open extension popup** or frontend dashboard
2. **Type natural language query:**
   - "articles about AI from last month"
   - "Python tutorials"
   - "machine learning notes from yesterday"
3. **Backend processes:**
   - Parses query (extracts semantic terms + date filters)
   - Generates query embedding
   - Calculates cosine similarity with all memories
   - Filters by date/tags if specified
   - Ranks by similarity score
4. **Results appear** with similarity badges (e.g., "92% match")

### **Context-Aware Browsing:**

1. **Visit a website** you've saved memories from
2. **Floating Synapse icon** appears (bottom-right)
3. **Click icon** → Side panel opens
4. **View all memories** from that website
5. **Click any memory** → Full detail modal opens

---

## **Completed Features**

### **Phase 1: MVP (Minimum Viable Product)** ✅

Complete working system that captures, stores, and retrieves information.

#### **🎯 Browser Extension Features**

**Save Modal:**
* ✅ Beautiful popup modal appears when saving text
* ✅ Editable title (auto-filled with page title)
* ✅ Editable text area (selected text)
* ✅ Optional notes/context field
* ✅ Optional tags field (comma-separated)
* ✅ Source URL display
* ✅ Save and Cancel buttons
* ✅ Loading state during save
* ✅ Error validation

**Context Menus:**
* ✅ "Save to Synapse" - for selected text
* ✅ "Capture Image to Synapse" - for images
* ✅ Works on all websites

**Keyboard Shortcuts:**
* ✅ `Ctrl+Shift+S` (Win/Linux) or `Cmd+Shift+S` (Mac) - Save selection
* ✅ `Ctrl+Shift+N` (Win/Linux) or `Cmd+Shift+N` (Mac) - Quick notes

**Extension Popup:**
* ✅ View all saved memories in card format
* ✅ Semantic search with natural language
* ✅ Similarity score badges on results
* ✅ Delete memories
* ✅ Click to view full details
* ✅ Settings button access

**Extension Settings:**
* ✅ Search method selector (Auto/Local/OpenAI/Keyword)
* ✅ OpenAI API key configuration
* ✅ Test API key button
* ✅ Embedding statistics display
* ✅ Generate embeddings buttons (Local/OpenAI)
* ✅ Progress tracking for batch operations
* ✅ API URL configuration
* ✅ Notification settings
* ✅ Auto-tagging toggle

**Offline Support:**
* ✅ Save memories offline when backend unavailable
* ✅ Auto-sync when connection restored
* ✅ Cache management
* ✅ Offline indicator

#### **🖥️ Backend API Features**

**Memory Endpoints:**
* ✅ `POST /api/memories/save` - Save new memory
* ✅ `GET /api/memories/all` - Get all memories
* ✅ `GET /api/memories/search` - Keyword search
* ✅ `DELETE /api/memories/:id` - Delete memory
* ✅ `GET /api/memories/by-url` - Get memories by URL

**Semantic Search Endpoints:**
* ✅ `POST /api/memories/semantic-search` - Natural language search
* ✅ `POST /api/memories/generate-embeddings` - Batch embedding generation
* ✅ `GET /api/memories/embedding-stats` - Statistics
* ✅ `POST /api/memories/search-settings` - Configure OpenAI key

**Features:**
* ✅ Auto-embedding generation on save
* ✅ Local embedding model (Transformers.js)
* ✅ OpenAI embedding integration
* ✅ Vector similarity search (cosine)
* ✅ Natural language query parsing
* ✅ Date filter extraction
* ✅ Tag and domain filtering
* ✅ Auto-tagging system
* ✅ Image storage (file-based)
* ✅ Error handling and validation

#### **🎨 Frontend Dashboard Features**

* ✅ React + Vite + Tailwind CSS
* ✅ Responsive card-based layout
* ✅ Semantic search integration
* ✅ Add new memories form
* ✅ Delete memories
* ✅ Similarity score display
* ✅ Natural language search placeholder
* ✅ Loading states
* ✅ Error handling

#### **💾 Database (MongoDB)**

* ✅ Memory schema with metadata
* ✅ Vector embedding storage (384 or 1536 dims)
* ✅ Text indexing for keyword search
* ✅ Efficient querying
* ✅ Image path storage

---

## **Data Model - MongoDB Document**

```javascript
{
  // Basic Information
  _id: ObjectId("507f1f77bcf86cd799439011"),
  title: "Introduction to Neural Networks",
  text: "Neural networks are computing systems inspired by biological neural networks...",
  url: "https://example.com/neural-networks",

  // Metadata
  metadata: {
    context: "Saved from tutorial website",
    type: "article"
  },
  tags: ["ai", "machine-learning", "tutorial"],

  // Image Storage (optional)
  imagePath: "/uploads/images/507f1f77bcf86cd799439011.png",
  imageData: null,  // or base64 data URL

  // Vector Embeddings (Phase 3)
  embedding: [0.123, -0.456, 0.789, ..., 0.234],  // 384 or 1536 floats
  embeddingModel: "local",  // "local" or "openai"
  embeddingGeneratedAt: ISODate("2024-01-08T10:30:01.000Z"),

  // Timestamps
  createdAt: ISODate("2024-01-08T10:30:00.000Z"),
  updatedAt: ISODate("2024-01-08T10:30:00.000Z")
}
```

**Embedding Details:**
- **Local Model** (Transformers.js): 384 dimensions, ~1.5 KB per memory
- **OpenAI Model** (text-embedding-3-small): 1536 dimensions, ~6 KB per memory
- Stored as array of floating-point numbers
- Used for cosine similarity calculations
- No separate vector database required!

---

### **Phase 2: Context-Aware Browsing** ✅

Intelligent website recognition that shows your saved memories when you revisit pages.

#### **Features:**

**Floating Icon:**
* ✅ Automatically appears on websites with saved memories
* ✅ Shows count badge (e.g., "3 memories")
* ✅ Bottom-right corner positioning
* ✅ Smooth animations
* ✅ Purple gradient design

**Side Panel:**
* ✅ Slides in from right when icon clicked
* ✅ Lists all memories from current website
* ✅ Memory cards with thumbnails (if images)
* ✅ Preview text and tags
* ✅ Timestamps (relative: "2 days ago")
* ✅ Click to expand full details

**Memory Detail Modal:**
* ✅ Full-screen overlay
* ✅ Complete memory content
* ✅ Full-resolution images
* ✅ All metadata and tags
* ✅ Close button and overlay click

**Smart Matching:**
* ✅ Matches memories by URL domain
* ✅ Works on any page from same website
* ✅ Fast lookup (1-2 seconds on page load)

**Status:** Fully implemented with content scripts

---

### **Phase 3: Semantic Search** ✅

**Natural language search powered by AI embeddings** - search your memories like you're talking to someone!

#### **Search Methods:**

**1. Auto (Recommended)** 🌟
* ✅ Automatically selects best available method
* ✅ Priority: OpenAI → Local → Keyword
* ✅ Zero configuration required
* ✅ Default for all searches

**2. Local Semantic (FREE)** 💎
* ✅ Transformers.js with `all-MiniLM-L6-v2` model
* ✅ 384-dimensional embeddings
* ✅ Runs entirely on your machine
* ✅ No API key needed
* ✅ ~23MB model (one-time download)
* ✅ Great quality, completely free!

**3. OpenAI Semantic (Best Quality)** 🚀
* ✅ Uses `text-embedding-3-small` model
* ✅ 1536-dimensional embeddings
* ✅ Requires API key (optional)
* ✅ Cost: ~$0.000004 per memory
* ✅ Highest accuracy

**4. Keyword (Fallback)** 📝
* ✅ MongoDB text index search
* ✅ No embeddings needed
* ✅ Always available
* ✅ Exact word matching

#### **Natural Language Features:**

**Date Understanding:**
* ✅ "yesterday" → Last 24 hours
* ✅ "last week" → Past 7 days
* ✅ "last month" → Past 30 days
* ✅ "this year" → Current year
* ✅ Specific dates: "January 15, 2024"

**Query Examples:**
```
"Show me articles about AI I saved last month"
→ Semantic: "articles about AI"
→ Date filter: December 1-31, 2024

"Python tutorials from this week"
→ Semantic: "Python tutorials"
→ Date filter: Last 7 days

"machine learning notes"
→ Semantic: "machine learning notes"
→ No date filter
```

#### **How Vector Search Works:**

```
Your Query: "deep learning tutorials"
    ↓
1. Generate query embedding (384 or 1536 dims)
    ↓
2. Compare with all memory embeddings
   using cosine similarity
    ↓
3. Calculate similarity scores (0 to 1)
    ↓
4. Filter by date/tags if specified
    ↓
5. Sort by similarity (highest first)
    ↓
Results: [
  {title: "Neural Networks Intro", similarity: 0.92},
  {title: "ML Basics", similarity: 0.78},
  {title: "AI Overview", similarity: 0.65}
]
```

#### **Similarity Score Meaning:**

* **90-100%**: Extremely relevant (exact match or very similar)
* **70-89%**: Very relevant (same topic)
* **50-69%**: Somewhat relevant (related topic)
* **Below 50%**: May not be relevant

#### **Technical Implementation:**

**Storage:**
* ✅ Embeddings stored as arrays in MongoDB
* ✅ No separate vector database (ChromaDB, Pinecone, etc.)
* ✅ Efficient in-memory cosine similarity
* ✅ 3-12 KB per memory (depending on model)

**Embedding Generation:**
* ✅ Auto-generated on memory save (non-blocking)
* ✅ Batch generation for existing memories
* ✅ Progress tracking
* ✅ Error handling and retries
* ✅ Model caching for speed

**Query Processing:**
* ✅ Natural language parsing (chrono-node)
* ✅ Date extraction and normalization
* ✅ Tag and domain filtering
* ✅ Type detection (article, code, image, etc.)
* ✅ Combined filters (semantic + metadata)

**Performance:**
* ✅ Embedding generation: 1-2 sec (local), 0.5 sec (OpenAI)
* ✅ Search speed: 50-200ms for 1000 memories
* ✅ Batch processing: ~20-30 min for 1000 memories (local)

#### **Status:**

Fully implemented across:
* ✅ Browser extension popup
* ✅ Browser extension settings
* ✅ Frontend React dashboard
* ✅ Backend API endpoints
* ✅ Auto-embedding generation
* ✅ Batch processing tools

#### **Documentation:**

* 📘 `SEMANTIC-SEARCH-COMPLETE.md` - User guide with examples
* 🛠️ `SEMANTIC-SEARCH-SETUP.md` - Technical setup guide
* 🧪 `TESTING-SEMANTIC-SEARCH.md` - Complete testing guide

---

## **Testing & Verification**

### **Quick Test (2 Minutes)**

1. **Start backend:**
   ```bash
   cd backend && npm run dev
   ```
   Look for: `✅ Local embedding model ready`

2. **Load extension:**
   - Go to `chrome://extensions/`
   - Load unpacked → Select `extension` folder
   - Reload if already loaded

3. **Create test memory:**
   - Visit any website
   - Select text: "Machine learning is a subset of AI"
   - Right-click → "Save to Synapse"
   - Fill title, click "Save Memory"

4. **Test semantic search:**
   - Click extension icon
   - Search: "artificial intelligence tutorials"
   - Should find your memory with 80-90% similarity!

**Why it works:** Even though you searched "artificial intelligence" and saved "machine learning", semantic search understands they're related! 🎉

### **Verify Embeddings:**

```bash
# Check MongoDB
mongosh
use synapse
db.memories.findOne({}, {title: 1, embedding: 1, embeddingModel: 1})

# Should show:
# {
#   title: "...",
#   embedding: [0.123, -0.456, ...],  // 384 numbers
#   embeddingModel: "local"
# }
```

### **Check Statistics:**

**Via Extension:**
- Extension → Settings → Refresh Stats
- Should show 100% coverage

**Via API:**
```bash
curl http://localhost:5000/api/memories/embedding-stats
```

### **Complete Testing Guide:**

See `TESTING-SEMANTIC-SEARCH.md` for 10 comprehensive test scenarios including:
- Semantic vs keyword comparison
- Natural language dates
- Batch embedding generation
- OpenAI integration
- Performance benchmarks
- Troubleshooting

---

## **Troubleshooting**

### **"Save to Synapse" not appearing**

✅ **Fix:**
1. Go to `chrome://extensions/`
2. Find "Project Synapse"
3. Click reload button 🔄
4. Refresh the webpage you're on

### **No search results**

✅ **Check:**
```bash
# 1. Is backend running?
curl http://localhost:5000/api/memories/all

# 2. Do memories have embeddings?
curl http://localhost:5000/api/memories/embedding-stats

# 3. If coverage < 100%, generate embeddings:
# Extension → Settings → Generate (Local - Free)
```

### **"Local model failed to load"**

✅ **Fix:**
1. Check internet connection (needed for first download)
2. Check disk space (~30 MB needed)
3. Restart backend: `npm run dev`
4. Check backend logs for specific error

### **Backend errors on startup**

✅ **Common issues:**

```bash
# MongoDB not connected
# Fix: Check MONGO_URI in .env file
# For local: MONGO_URI=mongodb://localhost:27017/synapse
# For Atlas: Get connection string from dashboard

# Port already in use
# Fix: Change PORT in .env or kill process on port 5000

# Missing dependencies
# Fix: cd backend && npm install
```

### **Extension popup not loading**

✅ **Fix:**
1. Open extension popup
2. Right-click → Inspect
3. Check Console for errors
4. Common issue: Backend not running
   - Start backend: `cd backend && npm run dev`

### **Similarity scores very low**

✅ **This is normal if:**
- Query and memories are unrelated topics
- Try more specific queries
- Ensure memories have meaningful content

### **Images not displaying**

✅ **Fix:**
1. Check backend is serving static files
2. Verify `uploads` folder exists in backend
3. Check console for 404 errors
4. Image paths should be: `/uploads/images/filename.png`

---

## **Documentation Files**

| File | Purpose |
|------|---------|
| `README.md` | This file - project overview |
| `SEMANTIC-SEARCH-COMPLETE.md` | User guide for semantic search |
| `SEMANTIC-SEARCH-SETUP.md` | Technical setup guide |
| `TESTING-SEMANTIC-SEARCH.md` | Complete testing scenarios |
| `IMAGE-STORAGE-SOLUTION.md` | Image handling documentation |
| `EXTENSION-RELOAD-FIX.md` | Extension error handling |

---

## **Future Features**

Future iterations will focus on visual intelligence and AI enrichment.

---

### **Phase 4: Enhanced Web Dashboard** ✅

A fully-featured React-based dashboard to view, search, filter, and manage all saved memories with professional UI.

#### **✅ Core Features:**

**React Application:**
* ✅ React + Vite + Tailwind CSS
* ✅ Responsive design (mobile/tablet/desktop)
* ✅ Semantic search integration
* ✅ Add new memories manually (form)
* ✅ Delete individual memories
* ✅ Similarity score badges on search results
* ✅ Loading states and error handling
* ✅ Direct links to source URLs
* ✅ Tag display on cards
* ✅ Image support (displays saved images)
* ✅ Professional UI without emoji icons

**Runs at:** `http://localhost:5173`

#### **✅ Advanced Filtering:**

**Filter Sidebar:**
* ✅ Filter by type (Article, Note, Code, Image, Quote, Todo, Video, Product)
* ✅ Filter by date range (start and end dates)
* ✅ Filter by tags (multi-select checkboxes)
* ✅ Filter by domain/source (dropdown)
* ✅ Filter by has/no images (radio buttons)
* ✅ Clear all filters button
* ✅ Active filter count display
* ✅ Dynamically extracted tags and domains

#### **✅ Multiple View Modes:**

**Three Professional Views:**
* ✅ **Grid View** - Card-based layout with images and previews
* ✅ **List View** - Compact horizontal layout with type badges and thumbnails
* ✅ **Timeline View** - Chronological timeline grouped by date with visual timeline
* ✅ Smooth view switching with instant updates
* ✅ View mode icons (grid/list/timeline)

#### **✅ Sorting & Organization:**

**Sorting Options:**
* ✅ Newest first (default)
* ✅ Oldest first
* ✅ Title (A-Z)
* ✅ Title (Z-A)
* ✅ Relevance (for search results with similarity scores)
* ✅ Auto-type detection (article/code/quote/todo/image/video/product/note)

#### **✅ Batch Operations:**

**Selection & Bulk Actions:**
* ✅ Selection mode toggle
* ✅ Multi-select with checkboxes (works in all view modes)
* ✅ Bulk delete selected memories
* ✅ Clear selection button
* ✅ Selected count display
* ✅ Confirmation dialogs for bulk operations

#### **✅ Export Functionality:**

**Export Options:**
* ✅ Export to JSON (complete data structure)
* ✅ Export to Markdown (formatted document)
* ✅ PDF export (placeholder for future implementation)
* ✅ Export selected memories or all displayed
* ✅ Timestamped export filenames
* ✅ Hover dropdown menu for export options

#### **✅ Dark Mode:**

**Theme Support:**
* ✅ Light/dark mode toggle
* ✅ System preference detection
* ✅ LocalStorage persistence
* ✅ Smooth theme transitions
* ✅ Dark mode for all components (sidebar, cards, modals, buttons)
* ✅ Properly styled dark backgrounds and text

#### **✅ Professional UI/UX:**

**Design Elements:**
* ✅ Clean text-based type badges (no emoji icons)
* ✅ Consistent color scheme with blue/purple gradients
* ✅ Smooth hover effects and transitions
* ✅ Shadow depth on cards
* ✅ Sticky filter sidebar
* ✅ Responsive button groups
* ✅ Empty state messages
* ✅ Result count displays

**Status:** Fully implemented with all advanced features complete!

---

### **Phase 5: Memory Graph (Mind Map)**

* Visual representation of all memories as interconnected nodes.
* Related ideas are connected based on topic similarity.
* Clicking a node opens the full detail view of that memory.
* This will make Synapse function like a visual “second brain.”

---

### **Phase 6: AI Enrichment**

* Automatic summarization of long text.
* Auto-tagging and categorization of stored content.
* Integration with AI models for intelligent search and recommendations.
* Potential voice commands for “save” or “search” actions.

---

## **Security and Privacy**

* All user data remains private.
* Authentication and JWT-based login will be introduced in future versions.
* Secure HTTPS communication between frontend and backend.
* Local-only mode for users who don’t want cloud sync.

---

## **Quick Start - MVP Setup**

### **Prerequisites**

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your MongoDB connection string
# For local MongoDB: MONGO_URI=mongodb://localhost:27017/synapse
# For MongoDB Atlas: Get your connection string from Atlas dashboard

# Start the backend server
npm run dev
```

The backend server will run on `http://localhost:5000`

### **2. Frontend Setup**

```bash
# Navigate to frontend directory (open a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file (optional, defaults to localhost:5000)
cp .env.example .env

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### **3. Using the Application**

1. Open your browser and navigate to `http://localhost:5173`
2. Click "Add New Memory" to save your first memory
3. Fill in the title, text, URL, and optional notes/tags
4. Click "Save Memory"
5. Use the search bar to find specific memories
6. Click the delete icon on any card to remove it

### **3. Browser Extension Setup** ✅

The Chrome extension is fully functional and allows capturing text/images from any webpage.

#### **Installation:**

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The Synapse extension icon should appear in your toolbar

#### **Usage:**

**Saving Memories:**
* Highlight text on any webpage
* Right-click → "Save to Synapse"
* Add optional notes or tags
* Click "Save Memory"

**Viewing Memories:**
* Click the Synapse extension icon in toolbar
* Search using natural language (e.g., "Python tutorials from last week")
* Click any memory card to view details
* Delete memories with the delete button

**Context-Aware Browsing:**
* Visit a website you've saved memories from
* Look for the floating Synapse icon (brain icon)
* Click to see all your saved memories from that site

**Settings:**
* Click the settings icon (⚙️) in the extension
* Choose search method (Auto/Local/OpenAI/Keyword)
* Optionally add OpenAI API key for best quality
* Generate embeddings for existing memories
* View embedding statistics

---

## **Installation (Development Mode) - Detailed**

### **Backend**

```bash
cd backend
npm install
npm start
```

Create a `.env` file:

```
MONGO_URI=your_mongo_connection_string
PORT=5000
NODE_ENV=development
```

### **Frontend Dashboard**

```bash
cd frontend
npm install
npm run dev
```

---

## **Project Roadmap**

| Phase   | Status | Description                              | Tech Focus                       |
| ------- | ------ | ---------------------------------------- | -------------------------------- |
| MVP     | ✅ Complete | Capture, store, search memories          | Node.js, MongoDB, Extension APIs |
| Phase 2 | ✅ Complete | Context-aware floating icon on web pages | Chrome API, Content Scripts      |
| Phase 3 | ✅ Complete | Semantic search using embeddings         | Transformers.js, OpenAI, Vector Search |
| Phase 4 | ✅ Complete | Enhanced dashboard with filters, views, dark mode | React + Tailwind + Advanced UI |
| Phase 5 | 📅 Planned | Mind map view of connected thoughts      | React Flow / D3.js               |
| Phase 6 | 📅 Planned | AI-based summarization and tagging       | NLP / LLM APIs                   |

---

## **Summary**

Project Synapse has evolved from a simple browser extension into an **intelligent second brain** with AI-powered semantic search and a fully-featured web dashboard.

### **What's Complete (4 Phases):**

**Phase 1: Core Capture & Storage** ✅
* 🎯 Beautiful save modal with editable fields
* 📸 Image capture support
* ⌨️ Keyboard shortcuts (`Ctrl+Shift+S`)
* 🔄 Offline mode with auto-sync
* 🏷️ Auto-tagging system
* 💾 MongoDB storage with metadata

**Phase 2: Context-Aware Browsing** ✅
* 🌐 Floating icon on websites with saved memories
* 📋 Side panel with memory list
* 🖼️ Full detail modal view
* ⚡ Automatic website recognition
* 🎨 Smooth animations and purple gradient design

**Phase 3: Semantic Search** ✅
* 🧠 Natural language queries
* 💎 FREE local AI embeddings (Transformers.js)
* 🚀 Optional OpenAI integration
* 📅 Smart date parsing ("last month", "yesterday")
* 🎯 Similarity score badges (92% match)
* 📊 Embedding statistics
* 🔄 Batch generation for existing memories
* ⚙️ 4 search methods (Auto/Local/OpenAI/Keyword)

**Phase 4: Enhanced Web Dashboard** ✅
* 🎨 Professional UI with clean design (no emoji icons)
* 🔍 Advanced filtering (type, tags, date, domain, images)
* 👁️ Multiple view modes (grid, list, timeline)
* 📊 Sorting options (date, title, relevance)
* ☑️ Bulk selection and batch operations
* 📤 Export to JSON and Markdown
* 🌙 Dark mode with system preference detection
* 📱 Fully responsive design

### **What Makes It Special:**

**🆓 Completely Free:**
- No API keys required (local embeddings)
- No subscription fees
- Open source
- Self-hosted

**⚡ Zero Setup:**
- Works immediately after installation
- Auto-downloads AI model (~23MB, one-time)
- Auto-generates embeddings
- No configuration needed

**🧠 Truly Intelligent:**
- Understands meaning, not just keywords
- Search: "AI tutorials" → Finds "machine learning"
- Ranks by relevance with similarity scores
- Natural language date queries

**🔒 Private & Secure:**
- All data in your MongoDB
- Embeddings generated locally
- No data sent to third parties (unless you use OpenAI)
- Optional offline mode

**🎨 Beautiful UX:**
- Modern purple gradient design
- Smooth animations
- Responsive layouts
- Similarity score visualization
- Loading states and error handling

### **Technical Highlights:**

**No Separate Vector Database:**
- Embeddings stored directly in MongoDB
- Cosine similarity in Node.js
- Efficient in-memory calculations
- 3-12 KB per memory

**Smart Architecture:**
- Content scripts for web integration
- Background service worker
- React dashboard
- RESTful API
- Async embedding generation (non-blocking)

**Performance:**
- Search: 50-200ms for 1000 memories
- Embedding gen: 1-2 sec per memory (local)
- Batch processing: ~30 min for 1000 memories

### **What's Complete (4 Phases):**

**Phase 4: Enhanced Web Dashboard** ✅
- ✅ Advanced filtering (type, tags, date, domain, images)
- ✅ Multiple view modes (grid, list, timeline)
- ✅ Sorting options (date, title, relevance)
- ✅ Bulk selection and batch delete
- ✅ Export to JSON and Markdown
- ✅ Dark mode with system preference detection
- ✅ Professional UI with clean design

### **What's Next:**

**Phase 5: Memory Graph** 📅
- Visual mind map of connected thoughts
- React Flow / D3.js visualization
- Click to explore connections
- Interactive node-based interface

**Phase 6: AI Enrichment** 📅
- Auto-summarization of long content
- Improved auto-tagging with AI
- Voice commands for save/search
- Intelligent recommendations
- Content categorization

---

**Project Synapse makes rediscovering knowledge as natural as recalling a memory.** 🧠✨
