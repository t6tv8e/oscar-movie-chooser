import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FilterBar({ year, category, onYearChange, onCategoryChange, categoryList, minYear, maxYear }) {
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  // Scroll active tab into view
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeTab = tabsRef.current.querySelector('[data-active="true"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    setTimeout(updateScrollState, 300);
  }, [category, updateScrollState]);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction) => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  return (
    <div className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 pb-4">
      {/* Category Tabs */}
      <div className="relative flex items-center">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-gray-950 via-gray-950/90 to-transparent flex items-center"
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={20} className="text-gray-300" />
          </button>
        )}

        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3 w-full"
        >
          {categoryList.map((cat) => (
            <button
              key={cat.key}
              data-active={cat.key === category}
              onClick={() => onCategoryChange(cat.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                cat.key === category
                  ? 'bg-gold text-gray-950'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-gray-950 via-gray-950/90 to-transparent flex items-center"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        )}
      </div>

      {/* Year Slider */}
      <div className="px-4 flex items-center gap-4">
        <label className="text-sm text-gray-400 shrink-0 w-10">{minYear}</label>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={year}
          onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
          className="flex-1 accent-gold h-2 cursor-pointer"
        />
        <label className="text-sm text-gray-400 shrink-0 w-10">{maxYear}</label>
        <span className="text-lg font-bold text-gold tabular-nums min-w-[4ch] text-right">{year}</span>
      </div>
    </div>
  );
}
