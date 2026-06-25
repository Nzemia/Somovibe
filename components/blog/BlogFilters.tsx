"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface BlogFiltersProps {
  tags: Tag[];
}

export function BlogFilters({ tags }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initial State from URL
  const currentSearch = searchParams.get("search") || "";
  const currentTag = searchParams.get("tag") || "";
  const currentSort = searchParams.get("sort") || "latest";

  const [search, setSearch] = useState(currentSearch);

  // Sync state if URL changes
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  // Debounced search logic (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== currentSearch) {
        updateParams({ search, page: "1" }); // Reset page to 1 on search
      }
    }, 300000 / 1000); // 300ms (300000/1000 is 300, wait, let's write 300 directly to avoid any math)
    
    // Wait, let's write 300 directly
    const directTimer = setTimeout(() => {
      if (search !== currentSearch) {
        updateParams({ search, page: "1" });
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      clearTimeout(directTimer);
    };
  }, [search, currentSearch]);

  // Helper to update search params
  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/blog?${params.toString()}`);
  };

  const handleTagClick = (tagSlug: string) => {
    // If tag is already active, click it again to clear filter
    const nextTag = currentTag === tagSlug ? "" : tagSlug;
    updateParams({ tag: nextTag, page: "1" });
  };

  return (
    <div className="space-y-6">
      {/* Search & Sort Panel */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search blog posts by title or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#d1e8dc] rounded-2xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent transition-all bg-white hover:bg-gray-50/50"
          />
        </div>

        {/* Sort Select */}
        <div className="relative w-full md:w-56 shrink-0">
          <select
            value={currentSort}
            onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}
            className="w-full appearance-none pl-4 pr-10 py-3 border border-[#d1e8dc] bg-white rounded-2xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008c43] focus:border-transparent cursor-pointer"
          >
            <option value="latest">Latest Posts</option>
            <option value="views">Most Viewed</option>
            <option value="oldest">Oldest Posts</option>
          </select>
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Tag Badges Filter Bar */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#5a7a68] uppercase tracking-wider block">
          Filter by topic
        </span>
        <div className="flex flex-wrap gap-2">
          {/* "All" Tag */}
          <button
            onClick={() => updateParams({ tag: "", page: "1" })}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              currentTag === ""
                ? "bg-[#008c43] text-white border-[#008c43] shadow-sm shadow-[#008c43]/20"
                : "bg-white text-[#004d25] border-[#d1e8dc] hover:bg-[#f0faf5]"
            }`}
          >
            All Topics
          </button>
          
          {/* Dynamic Tags */}
          {tags.map((tag) => {
            const isActive = currentTag === tag.slug;
            return (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-[#008c43] text-white border-[#008c43] shadow-sm shadow-[#008c43]/20"
                    : "bg-white text-[#004d25] border-[#d1e8dc] hover:bg-[#f0faf5]"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
