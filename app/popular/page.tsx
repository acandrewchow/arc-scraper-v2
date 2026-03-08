'use client';

import PopularItemsList from '@/components/PopularItemsList';

export default function PopularPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Popular Items</h1>
      <p className="text-neutral-400 mb-4 sm:mb-6 text-sm sm:text-base">
        See the most subscribed products and when each size/color last came back in stock.
      </p>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6">
        <PopularItemsList />
      </div>
    </div>
  );
}
