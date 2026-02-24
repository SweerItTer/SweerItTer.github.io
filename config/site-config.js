export const siteConfig = {
  defaultTheme: 'github',
  analytics: { provider: 'giscus', enabled: true },
  giscus: {
    repo: 'SweerItTer/SweerItTer.github.io',
    repoId: 'R_kgDOOpJbbg',
    category: 'Announcements',
    categoryId: 'DIC_kwDOOpJbbs4C3HJJ'
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

