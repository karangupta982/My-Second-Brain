# **Project Synapse: Build the Brain You’ve Always Wanted**

Project Synapse is a next-generation productivity tool that acts as your second brain. It allows you to capture, store, and rediscover information intelligently. It’s not just a place to save links or text — it’s an intelligent memory system that understands and organizes what you save.

---

## **Overview**

Project Synapse solves a common problem: forgetting useful information that we come across online. Whether it’s a quote, an article snippet, a research insight, or a to-do note, we often save it somewhere and then lose track of it. Synapse provides a unified way to capture, organize, and search all of these thoughts in one place.

This project will be built using Node.js, Express.js, React.js, and MongoDB.

---

## **The Core Vision**

The goal of Project Synapse is to create a private, intelligent space that doesn’t just store data — it understands context, connects related thoughts, and allows you to search your past ideas naturally.

Imagine highlighting a section of a web page, saving it with one click, and later being able to search or visualize your saved thoughts as if you were exploring your own mind.

---

## **Tech Stack**

| Layer                | Technology                                        |
| -------------------- | ------------------------------------------------- |
| Frontend (Extension) | HTML, CSS, JavaScript                             |
| Backend API          | Node.js, Express.js                               |
| Database             | MongoDB (Mongoose ODM)                            |
| Frontend Dashboard   | React.js, Tailwind CSS                            |
| Hosting (Future)     | Netlify for frontend, Render or Atlas for backend |

---

## **System Architecture**

```
Browser Extension (for capturing information)
    ↓
Express.js Backend (for storing and retrieving data)
    ↓
MongoDB Database (for persistent storage)
    ↓
React.js Frontend (for searching and visualizing memories)
```

---

## **Data Flow (MVP)**

1. The user highlights text on any website.
2. The user right-clicks and selects “Save to Synapse.”
3. The extension captures the selected text, page title, URL, and timestamp.
4. The data is sent to the backend or stored locally.
5. The backend stores it in MongoDB as a memory entry.
6. When the user opens the extension icon, a popup appears showing:

   * All stored memories in card format.
   * A search bar to search within those memories.
7. The user can click any card to open the original source link or view the full saved content.

---

## **MVP (Minimum Viable Product)**

The MVP focuses on building a working prototype that captures, stores, and retrieves information.

### **Core Features**

#### **1. Highlight and Save**

* Users can highlight any text on a webpage and right-click to save it.
* The extension saves the text, source URL, title, and timestamp.
* Optional context or notes can also be added by the user.

#### **2. Local or Backend Storage**

* Data can be stored locally using Chrome’s storage API.
* Later versions can send the data to a backend for persistent storage.

#### **3. Extension Popup Screen**

* When users click the extension icon, they see a popup screen.
* This screen displays all stored memories in a simple, card-based layout.
* Each card shows:

  * The text content or snippet
  * The source title and link
  * The date and time when it was saved
* Users can search their stored memories using a search bar in the popup.
* Search results are filtered instantly within the popup screen.

#### **4. Backend Integration**

* Node.js + Express.js backend handles API requests:

  * `POST /save` → Save data to database
  * `GET /search?query=...` → Search stored data
  * `GET /all` → Retrieve all saved entries
* MongoDB is used to store the data in a flexible format that allows both text and metadata.

---

## **Data Model Example**

```js
{
  id: "uuid",
  userId: "user123",
  text: "Distributed systems focus on scalability...",
  url: "https://example.com/system-design",
  title: "System Design Basics",
  metadata: {
    timestamp: "2025-11-08T12:00:00Z",
    context: "Highlighted from system design article"
  },
  tags: ["system design", "scalability"]
}
```

---

## **User Flow (MVP)**

1. The user installs the Synapse browser extension.
2. When the user highlights text on any website and right-clicks “Save to Synapse,” the selected data is captured.
3. The extension stores this data (either locally or via the backend).
4. The user clicks on the Synapse icon in the browser toolbar to open the popup.
5. Inside the popup:

   * The user can see all previously saved memories as cards.
   * The user can search through these memories using the search bar.
   * Clicking on a memory card opens the original web page or displays the saved text details.

---

## **Future Features**

Once the MVP is stable, future iterations will focus on making the experience intelligent and visually interactive.

### **Phase 2: Context-Aware Browsing**

When a user visits a website that was previously saved:

* A small floating Synapse icon will appear on the page.
* Clicking this icon will show related saved memories or notes from that website.
* Each saved memory can be clicked to revisit that specific context or display the saved text (such as a to-do list).

---

### **Phase 3: Semantic Search**

* Introduce natural language search using vector embeddings.
* Example queries:

  * “Show me articles about AI I saved last month.”
  * “Find that quote about distributed systems.”
* Integration with a vector database such as Chroma or Pinecone for semantic search.

---

### **Phase 4: Web Dashboard**

* A React-based dashboard to view all saved data.
* Cards organized by type: articles, notes, products, videos, and todos.
* Advanced filters and search capabilities.

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

### **Browser Extension (Coming Soon)**

The browser extension for capturing text directly from web pages is planned for the next phase.

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

| Phase   | Description                              | Tech Focus                       |
| ------- | ---------------------------------------- | -------------------------------- |
| MVP     | Capture, store, search memories          | Node.js, MongoDB, Extension APIs |
| Phase 2 | Context-aware floating icon on web pages | Chrome API, Content Scripts      |
| Phase 3 | Semantic search using embeddings         | Vector DB (Chroma / Pinecone)    |
| Phase 4 | React dashboard for memory visualization | React + Tailwind                 |
| Phase 5 | Mind map view of connected thoughts      | React Flow / D3.js               |
| Phase 6 | AI-based summarization and tagging       | NLP / LLM APIs                   |

---

## **Summary**

Project Synapse begins as a simple browser extension to store and search your highlights and evolves into an intelligent second brain — capable of understanding, connecting, and visualizing your thoughts.

The MVP focuses on the essential foundation:

* Capturing and storing data
* Searching through stored memories
* Displaying them in a clean, card-based interface

Future versions will add intelligent retrieval, context awareness, and visual mind maps to make rediscovering knowledge as natural as recalling a memory.
