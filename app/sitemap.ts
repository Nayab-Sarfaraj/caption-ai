import type { MetadataRoute } from 'next'
import { STYLE_SEO_MAP } from '@/src/helpers/style-seo-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://instacap.co'
  const now = new Date()

  // Base static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${base}/sign-up`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/sign-in`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // Dynamic pSEO style routes (21 styles)
  const styleRoutes: MetadataRoute.Sitemap = Object.values(STYLE_SEO_MAP).map(
    (meta) => ({
      url: `${base}/styles/${meta.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  )

  // Competitor comparison routes
  const competitorSlugs = ['veed', 'captions-ai', 'submagic']
  const comparisonRoutes: MetadataRoute.Sitemap = competitorSlugs.map(
    (slug) => ({
      url: `${base}/vs/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  )

  return [...staticRoutes, ...styleRoutes, ...comparisonRoutes]
}
