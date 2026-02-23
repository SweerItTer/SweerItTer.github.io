export const siteConfig = {
  defaultTheme: 'github',
  analytics: { provider: 'busuanzi', enabled: true },
  giscus: {
    repo: 'SweerItTer/SweerItTer.github.io',
    repoId: '',
    category: 'Announcements',
    categoryId: ''
  },
  contentSource: {
    provider: 'github',
    owner: 'SweerItTer',
    repo: 'SweerItTer.github.io',
    branch: 'main',
    articlesPath: 'articles',
    indexFile: 'articles/articles.index.json',
    fallbackFiles: ['hello-world.md']
  }
};
