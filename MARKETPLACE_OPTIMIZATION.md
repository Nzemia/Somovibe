/**
 * PERFORMANCE OPTIMIZATION GUIDE FOR QUESTY MARKETPLACE
 * 
 * This document explains the caching, pagination, and database optimization strategy
 * implemented to make marketplace navigation instant and reduce server load.
 * 
 * ============================================================================
 * PROBLEM SOLVED
 * ============================================================================
 * 
 * BEFORE: Marketplace route was fully dynamic
 * - Every navigation triggered: await getCurrentUser() + prisma.pdf.findMany()
 * - Back button = full re-render from DB (slow)
 * - Large list queries without pagination (100+ PDFs loaded at once)
 * - DB queries for ALL user purchases, even if not viewing them
 * 
 * AFTER: Smart caching + pagination + optimized queries
 * - Approved PDFs cached for 60 seconds (reuses previous data on back nav)
 * - Purchases only queried for visible PDFs (not all)
 * - Pagination limits to 12 items per page
 * - Loading skeleton shows instantly
 * 
 * ============================================================================
 * ARCHITECTURE: Data Flow
 * ============================================================================
 * 
 * MARKETPLACE PAGE (app/marketplace/page.tsx)
 *   │
 *   ├─ Parallel fetch 1: getCurrentUser() [auth, stays dynamic]
 *   │
 *   ├─ Parallel fetch 2: getCachedApprovedPdfs() [from lib/marketplace.ts]
 *   │  │
 *   │  └─ unstable_cache wrapper
 *   │     │
 *   │     └─ prisma.pdf.findMany({
 *   │         where: { status: "APPROVED" },
 *   │         select: { id, title, description, subject, grade, price, createdAt, teacher }
 *   │       })
 *   │       • Cached for 60 seconds
 *   │       • Tag: "marketplace-pdfs" (for manual revalidation)
 *   │       • Includes pagination cursor
 *   │
 *   └─ getUserPurchasedPdfIds(userId, visiblePdfIds)
 *      │
 *      └─ prisma.purchase.findMany({
 *          where: { userId, pdfId: { in: visiblePdfIds } }
 *        })
 *        • ONLY queries purchases for PDFs on current page
 *        • Not cached (user-specific)
 * 
 * COMPONENT TREE
 *   Marketplace (Server)
 *   └─ PdfCard Grid (Server)
 *      └─ PdfCardContent (Server) [static data]
 *      └─ PurchaseButton (Client) [interactive only]
 * 
 * ============================================================================
 * CACHING MECHANISM
 * ============================================================================
 * 
 * WHAT IS CACHED?
 * → Approved PDFs list (status = "APPROVED", ordered by createdAt DESC)
 * → Why? This is PUBLIC data that changes infrequently (only on admin approval)
 * 
 * HOW DOES IT WORK?
 * 1. First request to /marketplace
 *    - Query DB: SELECT * FROM Pdf WHERE status = 'APPROVED'
 *    - Cache result for 60 seconds
 *    - Return to user
 * 
 * 2. User navigates away and back (within 60s)
 *    - NO DB CALL
 *    - Return cached result instantly
 *    - Skips all of: getCurrentUser, getApprovedPdfs DB query
 * 
 * 3. After 60 seconds (revalidate window)
 *    - Next request refreshes cache from DB
 * 
 * HOW TO MANUALLY CLEAR CACHE?
 * When admin approves a new PDF, trigger cache revalidation:
 * 
 *   import { revalidateTag } from "next/cache";
 *   // In your admin API route after approving PDF:
 *   revalidateTag("marketplace-pdfs");
 * 
 * ============================================================================
 * PAGINATION IMPLEMENTATION
 * ============================================================================
 * 
 * CURSOR-BASED PAGINATION (not offset)
 * Why? Offset pagination breaks if data changes between requests.
 * Cursor pagination is stable and efficient.
 * 
 * HOW IT WORKS:
 * Page 1: /marketplace → shows items 1-12
 * - Query: { take: 12, cursor: null }
 * - Returns: 13 items (to check if hasNextPage)
 * - Shows: first 12
 * - Next button: /marketplace?cursor=<id-of-item-12>
 * 
 * Page 2: /marketplace?cursor=xyz → shows items 13-24
 * - Query: { take: 12, cursor: { id: "xyz" }, skip: 1 }
 * - Skip 1 because cursor points to last item of previous page
 * - Shows: next 12 items
 * 
 * ADDING MORE ITEMS PER PAGE:
 * In lib/marketplace.ts, getCachedApprovedPdfs:
 *   Change: getCachedApprovedPdfs(12, cursor)  // 12 per page
 *   To:     getCachedApprovedPdfs(24, cursor)  // 24 per page
 * 
 * ============================================================================
 * DATABASE OPTIMIZATION
 * ============================================================================
 * 
 * ADD THESE INDEXES TO prisma/schema.prisma:
 * 
 * model Pdf {
 *   // ... existing fields ...
 * 
 *   // Index for marketplace queries (filter by status, order by createdAt)
 *   @@index([status, createdAt])
 * }
 * 
 * model Purchase {
 *   // ... existing fields ...
 * 
 *   // Composite index for user purchase lookups
 *   @@index([userId, pdfId])
 * }
 * 
 * WHY THESE INDEXES?
 * 
 * pdf(status, createdAt):
 * - Marketplace query: WHERE status = 'APPROVED' ORDER BY createdAt DESC
 * - Index allows DB to find approved PDFs in O(log n) without full table scan
 * - Critical for fast pagination
 * 
 * purchase(userId, pdfId):
 * - Query: WHERE userId = ? AND pdfId IN (...)
 * - Index speeds up purchase lookup by user
 * - Especially important with IN clause on pdfId
 * 
 * ============================================================================
 * COMPONENT ARCHITECTURE (Server vs Client)
 * ============================================================================
 * 
 * BEFORE (monolithic):
 *   PdfCard (Client Component)
 *   - Renders: PDF data, purchase button, modal
 *   - Problem: Entire grid must hydrate (expensive)
 * 
 * AFTER (split):
 *   PdfCardContent (Server Component) ← 90% of the card
 *   - Renders: title, description, price, badges
 *   - No hydration needed
 *   - Lightweight SSR
 * 
 *   PurchaseButton (Client Component) ← 10% of the card
 *   - Renders: buy/download buttons, modal logic
 *   - Only interactive parts
 *   - Minimal hydration overhead
 * 
 * RESULT:
 * - Grid renders instantly (server-side)
 * - Only purchase buttons hydrate (small JS bundle)
 * - Better Time to Interactive (TTI)
 * - Faster page navigation
 * 
 * ============================================================================
 * QUERY OPTIMIZATION DETAILS
 * ============================================================================
 * 
 * OLD QUERY (INEFFICIENT):
 *   await prisma.purchase.findMany({
 *     where: { userId: user.id }
 *   })
 *   - Fetches ALL purchases for the user
 *   - Returns: { pdfId: "123" }, { pdfId: "456" }, ... (could be 100+)
 *   - Problem: Creates large data transfer, memory usage
 * 
 * NEW QUERY (OPTIMIZED):
 *   await prisma.purchase.findMany({
 *     where: {
 *       userId: user.id,
 *       pdfId: { in: pdfIds }  // ← Only PDFs on current page
 *     },
 *     select: { pdfId: true }
 *   })
 *   - Fetches purchases ONLY for visible PDFs (max 12)
 *   - Returns: { pdfId: "123" }, { pdfId: "456" }, ... (max 12)
 *   - Much smaller result set
 * 
 * IMPACT:
 * - 10 purchased PDFs / 100 total → fetch 100% (old) vs 10% (new)
 * - 1000 purchased PDFs / 100 visible → fetch all vs only 12
 * 
 * ============================================================================
 * WHEN DOES CACHING HELP MOST?
 * ============================================================================
 * 
 * SCENARIO 1: User browsing marketplace multiple times
 * - Visit: /marketplace → DB query + cache (1s)
 * - Browse: click PDF details → page load
 * - Return: back to /marketplace → CACHED (100ms) ✨
 * 
 * SCENARIO 2: Multiple users viewing marketplace
 * - User A: /marketplace → DB query, caches result (1s)
 * - User B: /marketplace (within 60s) → uses same cache (100ms) ✨
 * - User C: /marketplace (within 60s) → uses same cache (100ms) ✨
 * 
 * SCENARIO 3: Admin approves new material
 * - Marketplace is cached with 5 items
 * - Admin approves #6: revalidateTag("marketplace-pdfs")
 * - Cache cleared, next user sees 6 items ✨
 * 
 * ============================================================================
 * MONITORING & DEBUGGING
 * ============================================================================
 * 
 * CHECK IF CACHE IS WORKING:
 * 1. Open browser DevTools → Network tab
 * 2. Visit /marketplace (fresh load) → check server time
 * 3. Navigate away, click back
 * 4. Server time should be much faster (cache hit)
 * 
 * CLEAR CACHE DURING DEVELOPMENT:
 * - Full hard refresh: Ctrl+Shift+R (clears all caches)
 * - Or restart dev server: npm run dev
 * 
 * VIEW NEXT.JS CACHE LOGS:
 * In development, Next.js logs cache hits/misses in console
 * 
 * ============================================================================
 * FUTURE ENHANCEMENTS
 * ============================================================================
 * 
 * 1. INFINITE SCROLL INSTEAD OF BUTTON
 *    Replace "Load More" with Intersection Observer
 *    Loads next page automatically when user scrolls to bottom
 * 
 * 2. REAL-TIME CACHE INVALIDATION
 *    Use WebSockets to invalidate cache when admin approves PDF
 *    Instead of waiting for next user visit
 * 
 * 3. EDGE CACHING (Vercel, Cloudflare)
 *    Cache at CDN edge, not just origin
 *    Makes marketplace globally fast
 * 
 * 4. SEARCH/FILTER CACHE
 *    Cache popular filters separately
 *    /marketplace?subject=Math → cached
 *    /marketplace?grade=Form1 → cached
 * 
 * 5. PERSONALIZED FEED
 *    Cache user's recommended PDFs (collaborative filtering)
 *    Faster than generating on every load
 * 
 * ============================================================================
 */

// This file is documentation only. See:
// - lib/marketplace.ts (cache implementation)
// - app/marketplace/page.tsx (usage in route)
// - app/marketplace/loading.tsx (skeleton UI)
// - app/marketplace/PdfCardContent.tsx (server component)
// - app/marketplace/PurchaseButton.tsx (client component)
