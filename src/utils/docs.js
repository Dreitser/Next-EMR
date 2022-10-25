import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const articlesDirectory = join(process.cwd(), '_docs');

export const getArticleSlugs = () => {
    return readdirSync(articlesDirectory);
};

export const getArticleBySlug = (slug, fields = []) => {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(articlesDirectory, `${realSlug}.md`);
  const fileContents = readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const article = {};

  fields.forEach((field) => {
    if (field === 'slug') {
      article[field] = realSlug;
    }

    if (field === 'content') {
      article[field] = content;
    }

    if (data[field]) {
      article[field] = data[field];
    }
  });

  return article;
};

export const getArticles = (fields = []) => {
  const slugs = getArticleSlugs();

  return slugs.map((slug) => getArticleBySlug(slug, fields));
};
