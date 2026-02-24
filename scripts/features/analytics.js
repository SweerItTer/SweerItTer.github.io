import { siteConfig } from '../../config/site-config.js';
import { resolveDiscussionTerm, resolveMetricCacheKey } from './discussion-term.js';

const METRIC_CACHE_PREFIX = 'metrics:giscus:';
const pendingMetricRequests = new Map();

export function initAnalytics() {
  // Scheme 2: use giscus discussion data as interaction metrics.
}

export async function renderAnalytics(containerEl) {
  if (!containerEl) return;

  let stats = containerEl.querySelector('.article-stats');
  if (!stats) {
    stats = document.createElement('div');
    stats.className = 'article-stats';
    stats.innerHTML = `
      <span>互动热度 <span data-metric="heat">-</span></span>
      <span>参与人数 <span data-metric="users">-</span></span>
    `;

    const meta = containerEl.querySelector('.article-meta');
    if (meta && meta.nextSibling) {
      meta.parentNode.insertBefore(stats, meta.nextSibling);
    } else {
      containerEl.appendChild(stats);
    }
  }

  const heatEl = stats.querySelector('[data-metric="heat"]');
  const usersEl = stats.querySelector('[data-metric="users"]');
  if (!heatEl || !usersEl) return;

  const cacheKey = resolveMetricCacheKey(METRIC_CACHE_PREFIX);
  const cached = loadMetricCache(cacheKey);
  if (cached) {
    heatEl.textContent = String(cached.heat);
    usersEl.textContent = String(cached.users);
  }

  const metrics = await fetchGiscusMetrics(cacheKey);
  if (!metrics) return;

  heatEl.textContent = String(metrics.heat);
  usersEl.textContent = String(metrics.users);
  saveMetricCache(cacheKey, metrics);
}

async function fetchGiscusMetrics(cacheKey) {
  if (pendingMetricRequests.has(cacheKey)) {
    return pendingMetricRequests.get(cacheKey);
  }

  const request = doFetchGiscusMetrics();
  pendingMetricRequests.set(cacheKey, request);
  try {
    return await request;
  } finally {
    pendingMetricRequests.delete(cacheKey);
  }
}

async function doFetchGiscusMetrics() {
  const giscus = siteConfig.giscus;
  if (!giscus || !giscus.repo || !giscus.category) return null;

  const term = resolveDiscussionTerm();
  const repo = encodeURIComponent(giscus.repo);
  const category = encodeURIComponent(giscus.category);

  const urls = [
    `https://giscus.app/api/discussions?repo=${repo}&term=${encodeURIComponent(term)}&category=${category}&number=0&strict=false&first=15`,
    `https://giscus.app/api/discussions?repo=${repo}&term=${encodeURIComponent(term)}&category=${category}&number=0&strict=false&last=15`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.status === 404) {
        return { heat: 0, users: 0 };
      }
      if (!response.ok) {
        continue;
      }

      const payload = await response.json();
      const discussion = extractDiscussion(payload);
      if (!discussion) {
        return { heat: 0, users: 0 };
      }
      return mapMetrics(discussion);
    } catch (error) {
      // try next URL
    }
  }

  return null;
}

function extractDiscussion(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (!Array.isArray(payload.discussions) || payload.discussions.length === 0) return null;
  return payload.discussions[0];
}

function mapMetrics(discussion) {
  const comments = num(
    discussion.totalCommentCount,
    discussion.comments && discussion.comments.totalCount,
    discussion.commentsCount
  );

  const reactions = collectReactionCount(discussion.reactionGroups);
  const participants = num(
    discussion.participants && discussion.participants.totalCount,
    discussion.author ? 1 : 0
  );

  return {
    heat: Math.max(0, comments + reactions),
    users: Math.max(0, participants)
  };
}

function collectReactionCount(reactionGroups) {
  if (!Array.isArray(reactionGroups)) return 0;
  return reactionGroups.reduce((sum, group) => {
    const value = num(
      group && group.users && group.users.totalCount,
      group && group.count
    );
    return sum + value;
  }, 0);
}

function num(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return 0;
}

function loadMetricCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.heat !== 'number' || typeof parsed.users !== 'number') return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function saveMetricCache(key, metrics) {
  try {
    sessionStorage.setItem(key, JSON.stringify(metrics));
  } catch (error) {
    // ignore storage failures
  }
}
