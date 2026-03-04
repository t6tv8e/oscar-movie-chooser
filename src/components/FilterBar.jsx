import { useRef, useEffect } from 'react';

export default function FilterBar({ year, category, onYearChange, onCategoryChange, categoryList, minYear, maxYear }) {
  const tabsRef = useRef(null);

  // Scroll active tab into view
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeTab = tabsRef.current.querySelector('[data-active="true"]');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [category]);

  return (
    <div className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 pb-4">
      {/* Category Tabs */}
      <div
        ref={tabsRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3"
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
