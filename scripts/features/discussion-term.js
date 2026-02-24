export function resolveDiscussionTerm() {
  const params = new URLSearchParams(window.location.search);
  const articleId = (params.get('id') || '').trim();
  const docPath = (params.get('doc') || '').trim();

  if (articleId) return `article:${articleId}`;
  if (docPath) return `doc:${docPath}`;
  return `path:${window.location.pathname}`;
}

export function resolveMetricCacheKey(prefix = 'metrics:giscus:') {
  return `${prefix}${resolveDiscussionTerm()}`;
}
