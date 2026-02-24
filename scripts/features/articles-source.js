import { siteConfig } from '../../config/site-config.js';

const CACHE_KEY = 'articles:index:v1';
const CACHE_KEY_PERSIST = 'articles:index:persist:v1';
const DEFAULT_INDEX_FILE = 'articles/articles.index.json';
let cached = null;

export async function fetchArticlesIndex() {
  if (cached) return cached;

  const cachedValue = sessionStorage.getItem(CACHE_KEY);
  if (cachedValue) {
    cached = JSON.parse(cachedValue);
    return cached;
  }

  const persisted = localStorage.getItem(CACHE_KEY_PERSIST);
  if (persisted) {
    cached = JSON.parse(persisted);
  }

  const { contentSource } = siteConfig;
  if (!contentSource || contentSource.provider !== 'github') {
    throw new Error('Unsupported content source');
  }

  try {
    const generated = await fetchGeneratedIndex(contentSource);
    if (generated.length > 0) {
      cached = generated;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(generated));
      localStorage.setItem(CACHE_KEY_PERSIST, JSON.stringify(generated));
      return generated;
    }
  } catch (error) {
    // continue to GitHub API strategy
  }

  try {
    const list = await fetchGithubArticles(contentSource);
    cached = list;
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
    localStorage.setItem(CACHE_KEY_PERSIST, JSON.stringify(list));
    return list;
  } catch (error) {
    if (cached && cached.length > 0) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      return cached;
    }

    const fallback = await fetchFallbackArticles(contentSource);
    if (fallback.length > 0) {
      cached = fallback;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(fallback));
      localStorage.setItem(CACHE_KEY_PERSIST, JSON.stringify(fallback));
      return fallback;
    }

    throw error;
  }
}

async function fetchGeneratedIndex(source) {
  const indexFile = source.indexFile || DEFAULT_INDEX_FILE;
  const response = await fetch(indexFile, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch generated index (${response.status})`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('Generated index is not an array');
  }

  return payload
    .map(normalizeArticleRecord)
    .filter(Boolean);
}

async function fetchGithubArticles(source) {
  const apiUrl = `https://api.github.com/repos/${source.owner}/${source.repo}/contents/${source.articlesPath}?ref=${source.branch}`;
  const response = await fetch(apiUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch articles list (${response.status})`);
  }

  const data = await response.json();
  const files = data.filter(item => item.type === 'file' && isArticleFile(item.name));

  const articles = [];
  for (const file of files) {
    const content = await fetchArticleContent(file.name);
    const meta = extractMetadata(file.name, content);

    articles.push({
      id: file.name.replace(/\.(md|html)$/i, ''),
      title: meta.title || file.name,
      date: meta.date || '',
      description: meta.description || '',
      file: file.name,
      tags: meta.tags || []
    });
  }

  return articles;
}

function normalizeArticleRecord(item) {
  if (!item || typeof item !== 'object') return null;

  const file = typeof item.file === 'string' ? item.file.trim() : '';
  if (!file || !isArticleFile(file)) return null;

  const fallbackId = file.replace(/\.(md|html)$/i, '');
  const rawId = typeof item.id === 'string' ? item.id.trim() : '';
  const id = rawId || fallbackId;

  return {
    id,
    title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : file,
    date: typeof item.date === 'string' ? item.date.trim() : '',
    description: typeof item.description === 'string' ? item.description.trim() : '',
    file,
    tags: Array.isArray(item.tags) ? item.tags.filter(tag => typeof tag === 'string') : []
  };
}

async function fetchFallbackArticles(source) {
  const fallbackFiles = Array.isArray(source.fallbackFiles) && source.fallbackFiles.length > 0
    ? source.fallbackFiles
    : ['hello-world.md'];

  const articles = [];
  for (const filename of fallbackFiles) {
    const content = await fetchArticleContent(filename);
    if (!content) continue;

    const meta = extractMetadata(filename, content);
    articles.push({
      id: filename.replace(/\.(md|html)$/i, ''),
      title: meta.title || filename,
      date: meta.date || '',
      description: meta.description || '',
      file: filename,
      tags: meta.tags || []
    });
  }

  return articles;
}

function isArticleFile(filename) {
  return /\.(md|html)$/i.test(filename);
}

async function fetchArticleContent(filename) {
  const response = await fetch(`articles/${filename}`, { cache: 'no-store' });
  if (!response.ok) return '';
  return await response.text();
}

function extractMetadata(filename, content) {
  const normalizedContent = stripBom(content);
  if (!normalizedContent) return { title: filename, description: '' };

  if (filename.toLowerCase().endsWith('.md')) {
    const frontMatter = parseFrontMatter(normalizedContent);
    if (frontMatter) {
      return {
        title: frontMatter.title || extractMarkdownTitle(normalizedContent),
        description: frontMatter.description || extractMarkdownDescription(normalizedContent),
        date: frontMatter.date || '',
        tags: parseTags(frontMatter.tags)
      };
    }

    return {
      title: extractMarkdownTitle(normalizedContent),
      description: extractMarkdownDescription(normalizedContent)
    };
  }

  return {
    title: extractHtmlTitle(normalizedContent),
    description: extractHtmlDescription(normalizedContent)
  };
}

function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const lines = match[1].split(/\r?\n/);
  const data = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (!key || rest.length === 0) continue;
    data[key.trim()] = rest.join(':').trim();
  }
  return data;
}

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(tag => typeof tag === 'string');
  if (typeof raw !== 'string') return [];
  if (!raw.includes(',')) return [raw.trim()].filter(Boolean);
  return raw.split(',').map(tag => tag.trim()).filter(Boolean);
}

function extractMarkdownTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function extractMarkdownDescription(content) {
  const lines = content.split(/\\r?\\n/).map(line => line.trim());
  for (const line of lines) {
    if (!line || line.startsWith('#') || line.startsWith('---')) continue;
    return line.length > 120 ? `${line.slice(0, 120)}...` : line;
  }
  return '';
}

function extractHtmlTitle(content) {
  const match = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  return match ? match[1].trim() : 'Untitled';
}

function extractHtmlDescription(content) {
  const match = content.match(/<p[^>]*>([^<]+)<\/p>/i);
  if (!match) return '';
  const text = match[1].trim();
  return text.length > 120 ? `${text.slice(0, 120)}...` : text;
}

function stripBom(content) {
  return typeof content === 'string' ? content.replace(/^\uFEFF/, '') : '';
}

