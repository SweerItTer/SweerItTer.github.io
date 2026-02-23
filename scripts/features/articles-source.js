import { siteConfig } from '../../config/site-config.js';

const CACHE_KEY = 'articles:index:v1';
let cached = null;

export async function fetchArticlesIndex() {
  if (cached) return cached;

  const cachedValue = sessionStorage.getItem(CACHE_KEY);
  if (cachedValue) {
    cached = JSON.parse(cachedValue);
    return cached;
  }

  const { contentSource } = siteConfig;
  if (!contentSource || contentSource.provider !== 'github') {
    throw new Error('Unsupported content source');
  }

  const list = await fetchGithubArticles(contentSource);
  cached = list;
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
  return list;
}

async function fetchGithubArticles(source) {
  const apiUrl = `https://api.github.com/repos/${source.owner}/${source.repo}/contents/${source.articlesPath}?ref=${source.branch}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch articles list');
  }

  const data = await response.json();
  const files = data.filter(item => item.type === 'file' && isArticleFile(item.name));

  const articles = [];
  for (const file of files) {
    const content = await fetchArticleContent(file.name);
    const meta = extractMetadata(file.name, content);
    const date = await fetchCommitDate(source, file.path).catch(() => meta.date || '');

    articles.push({
      id: file.name.replace(/\.(md|html)$/i, ''),
      title: meta.title || file.name,
      date: date || meta.date || '',
      description: meta.description || '',
      file: file.name,
      tags: meta.tags || []
    });
  }

  return articles;
}

function isArticleFile(filename) {
  return /\.(md|html)$/i.test(filename);
}

async function fetchArticleContent(filename) {
  const response = await fetch(`articles/${filename}`);
  if (!response.ok) return '';
  return await response.text();
}

function extractMetadata(filename, content) {
  if (!content) return { title: filename, description: '' };

  if (filename.toLowerCase().endsWith('.md')) {
    const frontMatter = parseFrontMatter(content);
    if (frontMatter) {
      return {
        title: frontMatter.title || extractMarkdownTitle(content),
        description: frontMatter.description || extractMarkdownDescription(content),
        date: frontMatter.date || ''
      };
    }

    return {
      title: extractMarkdownTitle(content),
      description: extractMarkdownDescription(content)
    };
  }

  return {
    title: extractHtmlTitle(content),
    description: extractHtmlDescription(content)
  };
}

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const lines = match[1].split('\n');
  const data = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (!key || rest.length === 0) continue;
    data[key.trim()] = rest.join(':').trim();
  }
  return data;
}

function extractMarkdownTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function extractMarkdownDescription(content) {
  const lines = content.split('\n').map(line => line.trim());
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

async function fetchCommitDate(source, filePath) {
  const commitsUrl = `https://api.github.com/repos/${source.owner}/${source.repo}/commits?path=${filePath}&per_page=1`;
  const response = await fetch(commitsUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch commit date');
  }
  const commits = await response.json();
  if (!commits.length) return '';
  return commits[0].commit.author.date.slice(0, 10);
}
