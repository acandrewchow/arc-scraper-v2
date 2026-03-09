'use client';

import { useState, useEffect } from 'react';

interface LastInStockTimes {
  [color: string]: {
    [size: string]: string;
  };
}

interface PopularItem {
  product_url: string;
  product_name: string;
  subscription_count: number;
  has_sizes: boolean;
  last_checked?: string;
  last_in_stock_times?: LastInStockTimes;
}

export default function PopularItemsList() {
  const [items, setItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPopularItems();
  }, []);

  const fetchPopularItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/popular?limit=50');
      const data = await response.json();

      if (response.ok) {
        setItems(data.items || []);
      } else {
        setError(data.error || 'Failed to load popular items');
      }
    } catch (err) {
      setError('Failed to load popular items');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (productUrl: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(productUrl)) {
      newExpanded.delete(productUrl);
    } else {
      newExpanded.add(productUrl);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 border-2 border-neutral-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3.5 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card text-center py-12 px-6">
        <p className="text-sm text-neutral-500">No popular items yet. Subscribe to products to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-4">
        {items.length} product{items.length !== 1 ? 's' : ''} tracked
      </p>

      {items.map((item) => {
        const isExpanded = expandedItems.has(item.product_url);
        return (
          <div
            key={item.product_url}
            className="card overflow-hidden"
          >
            <button
              onClick={() => toggleExpanded(item.product_url)}
              className="w-full text-left flex items-center justify-between gap-3 p-4 hover:bg-neutral-800/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-white truncate">
                  {item.product_name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {item.subscription_count} subscriber{item.subscription_count !== 1 ? 's' : ''}
                  {item.last_checked && (
                    <> &middot; Checked {formatDate(item.last_checked)}</>
                  )}
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-neutral-500 flex-shrink-0 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-neutral-800/60 animate-fade-in">
                <div className="pt-4">
                  <a
                    href={item.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View on Arc&apos;teryx
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {item.last_in_stock_times && Object.keys(item.last_in_stock_times).length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
                      Stock History
                    </h4>
                    {item.has_sizes ? (
                      <div className="space-y-4">
                        {Object.entries(item.last_in_stock_times).map(([color, sizeTimes]) => (
                          <div key={color}>
                            <p className="text-xs font-medium text-neutral-300 mb-2">{color}</p>
                            {Object.keys(sizeTimes).length > 0 ? (
                              <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <table className="w-full text-xs min-w-[260px]">
                                  <thead>
                                    <tr className="border-b border-neutral-800/60">
                                      <th className="text-left py-2 px-4 sm:px-0 text-neutral-500 font-medium">Size</th>
                                      <th className="text-right py-2 px-4 sm:px-0 text-neutral-500 font-medium">Last In Stock</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(sizeTimes)
                                      .sort((a, b) => (b[1] || '').localeCompare(a[1] || ''))
                                      .map(([size, timestamp]) => (
                                        <tr key={size} className="border-b border-neutral-800/40">
                                          <td className="py-2 px-4 sm:px-0 text-neutral-300">{size === 'null' ? '—' : size}</td>
                                          <td className="py-2 px-4 sm:px-0 text-neutral-400 text-right whitespace-nowrap">{formatDate(timestamp)}</td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-xs text-neutral-600">No stock history</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-xs min-w-[260px]">
                          <thead>
                            <tr className="border-b border-neutral-800/60">
                              <th className="text-left py-2 px-4 sm:px-0 text-neutral-500 font-medium">Color</th>
                              <th className="text-right py-2 px-4 sm:px-0 text-neutral-500 font-medium">Last In Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(item.last_in_stock_times).map(([color, sizeTimes]) => {
                              const timestamps = Object.values(sizeTimes).filter(Boolean);
                              const latest = timestamps.length > 0 ? timestamps[0] : null;
                              const nullTimestamp = sizeTimes['null'];
                              const displayTimestamp = latest || nullTimestamp || null;
                              return (
                                <tr key={color} className="border-b border-neutral-800/40">
                                  <td className="py-2 px-4 sm:px-0 text-neutral-300">{color}</td>
                                  <td className="py-2 px-4 sm:px-0 text-neutral-400 text-right whitespace-nowrap">{formatDate(displayTimestamp || undefined)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
