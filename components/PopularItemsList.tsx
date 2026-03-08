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
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <div className="text-neutral-400 text-center py-4">Loading popular items...</div>;
  }

  if (error) {
    return <div className="text-red-400 py-4">{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-neutral-500 py-4">
        No popular items yet. Subscribe to products to see them here!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-neutral-400 mb-2">
        Total Popular Products: <span className="text-white font-medium">{items.length}</span>
      </div>

      {items.map((item) => {
        const isExpanded = expandedItems.has(item.product_url);
        return (
          <div
            key={item.product_url}
            className="border border-neutral-700 rounded-md"
          >
            <button
              onClick={() => toggleExpanded(item.product_url)}
              className="w-full text-left flex justify-between items-start gap-2 p-3 sm:p-4 hover:bg-neutral-800/50 transition-colors rounded-md"
            >
              <h3 className="font-semibold text-white text-sm sm:text-base">
                {item.product_name}{' '}
                <span className="text-neutral-400 font-normal text-xs sm:text-sm">
                  ({item.subscription_count} subscribers)
                </span>
              </h3>
              <span className="text-neutral-500 flex-shrink-0">{isExpanded ? '−' : '+'}</span>
            </button>

            {isExpanded && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4 border-t border-neutral-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 sm:pt-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-400 mb-1">Product URL:</p>
                    <a
                      href={item.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline break-all text-xs sm:text-sm"
                    >
                      {item.product_url}
                    </a>
                    {item.last_checked && (
                      <p className="text-xs text-neutral-500 mt-1">
                        Last checked: {formatDate(item.last_checked)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400">
                      Subscribers: <span className="text-white">{item.subscription_count}</span>
                    </p>
                  </div>
                </div>

                {item.last_in_stock_times && Object.keys(item.last_in_stock_times).length > 0 && (
                  <div>
                    <h4 className="font-semibold text-neutral-200 mb-2 text-sm">Last In-Stock Times</h4>
                    {item.has_sizes ? (
                      <div className="space-y-3">
                        {Object.entries(item.last_in_stock_times).map(([color, sizeTimes]) => (
                          <div key={color}>
                            <p className="font-medium text-neutral-300 text-sm">{color}</p>
                            {Object.keys(sizeTimes).length > 0 ? (
                              <div className="overflow-x-auto -mx-3 sm:mx-0">
                                <table className="w-full mt-1 text-sm min-w-[280px]">
                                  <thead>
                                    <tr className="border-b border-neutral-700">
                                      <th className="text-left py-1 px-3 sm:px-0 text-neutral-400 font-medium">Size</th>
                                      <th className="text-left py-1 px-3 sm:px-0 text-neutral-400 font-medium">Last In Stock</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(sizeTimes)
                                      .sort((a, b) => {
                                        const timeA = a[1] || '';
                                        const timeB = b[1] || '';
                                        return timeB.localeCompare(timeA);
                                      })
                                      .map(([size, timestamp]) => (
                                        <tr key={size} className="border-b border-neutral-800">
                                          <td className="py-1 px-3 sm:px-0 text-neutral-300">{size === 'null' ? 'N/A' : size}</td>
                                          <td className="py-1 px-3 sm:px-0 text-neutral-300 whitespace-nowrap">{formatDate(timestamp)}</td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-neutral-500">No stock history available</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-3 sm:mx-0">
                        <table className="w-full text-sm min-w-[280px]">
                          <thead>
                            <tr className="border-b border-neutral-700">
                              <th className="text-left py-1 px-3 sm:px-0 text-neutral-400 font-medium">Color</th>
                              <th className="text-left py-1 px-3 sm:px-0 text-neutral-400 font-medium">Last In Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(item.last_in_stock_times).map(([color, sizeTimes]) => {
                              const timestamps = Object.values(sizeTimes).filter(Boolean);
                              const latest = timestamps.length > 0 ? timestamps[0] : null;
                              const nullTimestamp = sizeTimes['null'];
                              const displayTimestamp = latest || nullTimestamp || null;
                              return (
                                <tr key={color} className="border-b border-neutral-800">
                                  <td className="py-1 px-3 sm:px-0 text-neutral-300">{color}</td>
                                  <td className="py-1 px-3 sm:px-0 text-neutral-300 whitespace-nowrap">{formatDate(displayTimestamp || undefined)}</td>
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
