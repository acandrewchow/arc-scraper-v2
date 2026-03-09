'use client';

import PopularItemsList from '@/components/PopularItemsList';

export default function PopularPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
          Popular Items
        </h1>
        <p className="text-neutral-400 text-sm sm:text-[15px] leading-relaxed max-w-lg">
          The most watched products and their latest stock activity.
        </p>
      </div>

      <PopularItemsList />
    </div>
  );
}
