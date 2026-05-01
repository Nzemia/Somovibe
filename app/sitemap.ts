import { MetadataRoute } from 'next';

const BASE_URL = 'https://somovibe.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const subjects = [
    'agriculture',
    'english',
    'kiswahili',
    'mathematics',
    'science',
    'social-studies',
    'ict',
    'cre',
    'ire',
    'homescience',
    'art-and-craft',
    'music',
    'physical-education'
  ];

  const subjectUrls = subjects.map((subject) => ({
    url: `${BASE_URL}/subjects/${subject}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...subjectUrls,
  ];
}
