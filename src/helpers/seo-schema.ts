export function generateSoftwareAppSchema(appUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Instacap',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    url: appUrl,
    description:
      'High-retention animated captions for viral videos in seconds. Fast AI transcription, 21+ creator caption styles, studio 4K exports, and flat pricing with no credits.',
    offers: [
      { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Weekly', price: '6.99', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Monthly', price: '14.99', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Yearly', price: '119', priceCurrency: 'USD' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1280',
    },
  }
}

export function generateFaqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateOrganizationSchema(appUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Instacap',
    url: appUrl,
    logo: `${appUrl}/icon.png`,
    sameAs: ['https://twitter.com/instacap'],
  }
}
