/**
 * API Route: Get popular items
 * GET /api/popular?limit=...
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPopularItems, getLastInStockTimes } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const popularItems = await getPopularItems(limit);

    // Get last in-stock times for each item
    const itemsWithHistory = await Promise.all(
      popularItems.map(async (item) => {
        try {
          const lastTimes = await getLastInStockTimes(item.product_url);
          return {
            ...item,
            last_in_stock_times: lastTimes,
          };
        } catch (error) {
          console.error(`Error getting last in-stock times for ${item.product_url}:`, error);
          return {
            ...item,
            last_in_stock_times: {},
          };
        }
      })
    );

    return NextResponse.json({ items: itemsWithHistory });
  } catch (error) {
    console.error('Error in popular route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
