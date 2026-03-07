import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://somovibe.com'

    // Fetch all approved materials from database
    const materials = await prisma.pdf.findMany({
        where: {
            status: 'APPROVED',
        },
        select: {
            id: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    // Map materials to sitemap entries
    const materialEntries: MetadataRoute.Sitemap = materials.map((material) => ({
        url: `${baseUrl}/marketplace/${material.id}`,
        lastModified: material.createdAt,
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/marketplace`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]

    return [...staticPages, ...materialEntries]
}
