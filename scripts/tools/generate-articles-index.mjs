import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const articlesDir = path.join(root, 'articles');
const outputPath = path.join(articlesDir, 'articles.index.json');

async function main() {
  const entries = await fs.readdir(articlesDir, { withFileTypes: true });
  const files = entries
    .filter(entry => entry.isFile())
    .map(entry => entry.name)
    .filter(name => /\.(md|html)$/i.test(name))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

  const articles = [];
  for (const file of files) {
    const fullPath = path.join(articlesDir, file);
    const content = await fs.readFile(fullPath, 'utf8');
    const meta = extractMetadata(file, content);

    articles.push({
      id: file.replace(/\.(md|html)$/i, ''),
      file,
      title: meta.title || file,
      date: meta.date || '',
      description: meta.description || '',
      tags: meta.tags || []
    });
  }

  const sorted = articles.sort((a, b) => compareArticles(a, b));
  await fs.writeFile(outputPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  process.stdout.write(`Generated ${outputPath} (${sorted.length} articles)\n`);
}

function compareArticles(a, b) {
  const tA = parseDate(a.date);
  const tB = parseDate(b.date);
  if (tA !== tB) return tB - tA;
  return String(a.title || '').localeCompare(String(b.title || ''), 'zh-CN');
}

function parseDate(input) {
  if (!input) return 0;
  const ts = Date.parse(input);
  return Number.isNaN(ts) ? 0 : ts;
}

function extractMetadata(filename, content) {
  const normalizedContent = stripBom(content);

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
      description: extractMarkdownDescription(normalizedContent),
      date: '',
      tags: []
    };
  }

  return {
    title: extractHtmlTitle(normalizedContent),
    description: extractHtmlDescription(normalizedContent),
    date: '',
    tags: []
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

main().catch((error) => {
  process.stderr.write(`Failed to generate articles index: ${error.message}\n`);
  process.exit(1);
});

