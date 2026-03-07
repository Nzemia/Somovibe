import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/teacher/', '/student/'],
        },
        sitemap: 'https://somovibe.com/sitemap.xml',
    }
}
