import * as chrono from 'chrono-node';
import natural from 'natural';

// Natural Language Query Parser
// Extracts semantic terms, date filters, and other metadata from user queries

const tokenizer = new natural.WordTokenizer();

// Keywords to identify query intent
const typeKeywords = {
  article: ['article', 'articles', 'post', 'posts', 'blog', 'blogs'],
  image: ['image', 'images', 'picture', 'pictures', 'photo', 'photos', 'screenshot', 'screenshots'],
  code: ['code', 'snippet', 'snippets', 'function', 'class', 'script'],
  quote: ['quote', 'quotes', 'saying', 'sayings'],
  tutorial: ['tutorial', 'tutorials', 'guide', 'guides', 'how-to', 'howto'],
  note: ['note', 'notes', 'memo', 'memos'],
  video: ['video', 'videos', 'youtube'],
  link: ['link', 'links', 'bookmark', 'bookmarks'],
};

// Common filler words to remove
const fillerWords = [
  'show', 'me', 'find', 'get', 'the', 'a', 'an', 'i', 'saved', 'from',
  'that', 'about', 'on', 'my', 'all', 'any', 'some',
];

// Domain patterns
const domainPatterns = [
  { pattern: /github\.com/i, domain: 'github.com' },
  { pattern: /stackoverflow\.com/i, domain: 'stackoverflow.com' },
  { pattern: /medium\.com/i, domain: 'medium.com' },
  { pattern: /dev\.to/i, domain: 'dev.to' },
  { pattern: /youtube\.com/i, domain: 'youtube.com' },
  { pattern: /twitter\.com/i, domain: 'twitter.com' },
  { pattern: /reddit\.com/i, domain: 'reddit.com' },
];

/**
 * Parse natural language query into structured format
 * @param {string} query - User's natural language query
 * @returns {Object} - Parsed query object
 */
export function parseQuery(query) {
  if (!query || query.trim() === '') {
    return {
      semanticTerms: '',
      dateFilter: null,
      type: null,
      domain: null,
      tags: [],
    };
  }

  const originalQuery = query;
  const lowerQuery = query.toLowerCase();

  // 1. Extract date filters using chrono-node
  const dateFilter = extractDateFilter(query);

  // 2. Extract type (article, image, code, etc.)
  const type = extractType(lowerQuery);

  // 3. Extract domain/website
  const domain = extractDomain(lowerQuery);

  // 4. Extract potential tags
  const tags = extractTags(lowerQuery);

  // 5. Clean query to get semantic search terms
  const semanticTerms = extractSemanticTerms(originalQuery, dateFilter, type, domain);

  return {
    semanticTerms,
    dateFilter,
    type,
    domain,
    tags,
    originalQuery,
  };
}

/**
 * Extract date filter from query using chrono-node
 * @param {string} query - User query
 * @returns {Object|null} - Date filter with start and end dates
 */
function extractDateFilter(query) {
  // Parse dates from query
  const results = chrono.parse(query);

  if (results.length === 0) {
    return null;
  }

  const parsedDate = results[0];

  // Check if it's a range
  if (parsedDate.start && parsedDate.end) {
    return {
      start: parsedDate.start.date(),
      end: parsedDate.end.date(),
    };
  }

  // Single date - determine if it's a specific day or a range
  const date = parsedDate.start.date();

  // If query contains relative terms like "last month", "this week", create range
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('last month') || lowerQuery.includes('past month')) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { start: lastMonth, end: lastMonthEnd };
  }

  if (lowerQuery.includes('this month') || lowerQuery.includes('current month')) {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start: thisMonthStart, end: thisMonthEnd };
  }

  if (lowerQuery.includes('this week') || lowerQuery.includes('current week')) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);
    return { start: weekStart, end: weekEnd };
  }

  if (lowerQuery.includes('last week') || lowerQuery.includes('past week')) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const lastWeekEnd = new Date(now);
    lastWeekEnd.setDate(now.getDate() - dayOfWeek - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
    lastWeekStart.setHours(0, 0, 0, 0);
    return { start: lastWeekStart, end: lastWeekEnd };
  }

  if (lowerQuery.includes('last 7 days') || lowerQuery.includes('past 7 days')) {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return { start: sevenDaysAgo, end: now };
  }

  if (lowerQuery.includes('last 30 days') || lowerQuery.includes('past 30 days')) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    return { start: thirtyDaysAgo, end: now };
  }

  if (lowerQuery.includes('yesterday')) {
    const yesterday = new Date(date);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(date);
    yesterdayEnd.setHours(23, 59, 59, 999);
    return { start: yesterday, end: yesterdayEnd };
  }

  if (lowerQuery.includes('today')) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return { start: today, end: todayEnd };
  }

  // Single specific date
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return { start: dayStart, end: dayEnd };
}

/**
 * Extract content type from query
 * @param {string} lowerQuery - Lowercase query
 * @returns {string|null} - Content type
 */
function extractType(lowerQuery) {
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        return type;
      }
    }
  }
  return null;
}

/**
 * Extract domain from query
 * @param {string} lowerQuery - Lowercase query
 * @returns {string|null} - Domain name
 */
function extractDomain(lowerQuery) {
  for (const { pattern, domain } of domainPatterns) {
    if (pattern.test(lowerQuery)) {
      return domain;
    }
  }

  // Check for generic mentions like "from github"
  if (lowerQuery.includes('github')) return 'github.com';
  if (lowerQuery.includes('stackoverflow')) return 'stackoverflow.com';
  if (lowerQuery.includes('medium')) return 'medium.com';

  return null;
}

/**
 * Extract potential tags from query
 * @param {string} lowerQuery - Lowercase query
 * @returns {string[]} - Array of tags
 */
function extractTags(lowerQuery) {
  const tags = [];

  // Common programming language/tech tags
  const techTerms = [
    'javascript', 'python', 'java', 'c++', 'rust', 'go', 'typescript',
    'react', 'vue', 'angular', 'node', 'express', 'django', 'flask',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'machine learning', 'ai', 'deep learning', 'neural network',
    'database', 'sql', 'mongodb', 'redis', 'postgresql',
  ];

  for (const term of techTerms) {
    if (lowerQuery.includes(term)) {
      tags.push(term);
    }
  }

  return tags;
}

/**
 * Extract semantic search terms by removing metadata
 * @param {string} query - Original query
 * @param {Object|null} dateFilter - Extracted date filter
 * @param {string|null} type - Extracted type
 * @param {string|null} domain - Extracted domain
 * @returns {string} - Cleaned semantic terms
 */
function extractSemanticTerms(query, dateFilter, type, domain) {
  let cleanQuery = query;

  // Remove date references
  if (dateFilter) {
    // Remove date strings that chrono parsed
    const chronoResults = chrono.parse(query);
    for (const result of chronoResults) {
      cleanQuery = cleanQuery.replace(result.text, '');
    }

    // Remove common date phrases
    const datePhases = [
      'last month', 'this month', 'past month', 'current month',
      'last week', 'this week', 'past week', 'current week',
      'yesterday', 'today', 'last 7 days', 'past 7 days',
      'last 30 days', 'past 30 days',
    ];

    for (const phrase of datePhases) {
      const regex = new RegExp(phrase, 'gi');
      cleanQuery = cleanQuery.replace(regex, '');
    }
  }

  // Remove type keywords
  if (type && typeKeywords[type]) {
    for (const keyword of typeKeywords[type]) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      cleanQuery = cleanQuery.replace(regex, '');
    }
  }

  // Remove domain references
  if (domain) {
    const domainName = domain.split('.')[0]; // github.com -> github
    const regex = new RegExp(`\\b${domainName}\\b`, 'gi');
    cleanQuery = cleanQuery.replace(regex, '');
  }

  // Remove filler words
  const tokens = tokenizer.tokenize(cleanQuery.toLowerCase());
  const meaningfulTokens = tokens.filter((token) => !fillerWords.includes(token));

  // Rejoin tokens
  let semanticTerms = meaningfulTokens.join(' ').trim();

  // Clean up extra spaces
  semanticTerms = semanticTerms.replace(/\s+/g, ' ').trim();

  // If nothing left, use original query
  if (semanticTerms === '') {
    semanticTerms = query;
  }

  return semanticTerms;
}

/**
 * Format parsed query for display
 * @param {Object} parsedQuery - Parsed query object
 * @returns {string} - Human-readable summary
 */
export function formatParsedQuery(parsedQuery) {
  const parts = [];

  if (parsedQuery.semanticTerms) {
    parts.push(`Searching for: "${parsedQuery.semanticTerms}"`);
  }

  if (parsedQuery.type) {
    parts.push(`Type: ${parsedQuery.type}`);
  }

  if (parsedQuery.domain) {
    parts.push(`From: ${parsedQuery.domain}`);
  }

  if (parsedQuery.dateFilter) {
    const start = parsedQuery.dateFilter.start.toLocaleDateString();
    const end = parsedQuery.dateFilter.end.toLocaleDateString();
    if (start === end) {
      parts.push(`Date: ${start}`);
    } else {
      parts.push(`Date range: ${start} to ${end}`);
    }
  }

  if (parsedQuery.tags && parsedQuery.tags.length > 0) {
    parts.push(`Tags: ${parsedQuery.tags.join(', ')}`);
  }

  return parts.join(' | ');
}
