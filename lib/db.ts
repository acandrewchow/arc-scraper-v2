/**
 * Database utilities using Supabase
 * Ported from app/db.py
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Subscription {
  email: string;
  product_url: string;
  token: string;
  verified: boolean;
  created_at?: string;
  last_notified?: string;
}

export interface StockState {
  color_stock?: Record<string, boolean>;
  color_size_stock?: Record<string, Record<string, boolean>>;
  last_checked?: string;
  has_sizes?: boolean;
  product_name?: string;
}

export interface PopularItem {
  product_url: string;
  product_name: string;
  subscription_count: number;
  has_sizes: boolean;
  last_checked?: string;
}

function getSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase not configured. Please set SUPABASE_URL and SUPABASE_KEY as environment variables.'
    );
  }

  return createClient(url, key);
}

export async function loadSubscriptions(): Promise<Record<string, Subscription>> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*');

    if (error) throw error;

    const subscriptions: Record<string, Subscription> = {};
    if (data) {
      for (const row of data) {
        subscriptions[row.id] = {
          email: row.email,
          product_url: row.product_url,
          token: row.token,
          verified: row.verified ?? false,
          created_at: row.created_at,
          last_notified: row.last_notified,
        };
      }
    }
    return subscriptions;
  } catch (error) {
    throw new Error(`Error loading subscriptions from Supabase: ${error}`);
  }
}

export async function saveSubscriptions(
  subscriptions: Record<string, Subscription>
): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    // Upsert all subscriptions
    const subscriptionData = Object.entries(subscriptions).map(([id, sub]) => ({
      id,
      email: sub.email,
      product_url: sub.product_url,
      token: sub.token,
      verified: sub.verified ?? false,
      created_at: sub.created_at,
      last_notified: sub.last_notified,
    }));

    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData);

    if (error) throw error;
  } catch (error) {
    throw new Error(`Error saving subscriptions to Supabase: ${error}`);
  }
}

export async function deleteSubscription(subscriptionId: string): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId);

    if (error) throw error;
  } catch (error) {
    throw new Error(`Error deleting subscription from Supabase: ${error}`);
  }
}

export async function loadState(productUrl: string): Promise<StockState> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('stock_state')
      .select('*')
      .eq('product_url', productUrl)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

    if (data) {
      return {
        color_stock: data.color_stock || {},
        color_size_stock: data.color_size_stock || {},
        last_checked: data.last_checked,
        has_sizes: data.has_sizes,
        product_name: data.product_name,
      };
    }

    return {
      color_stock: {},
      color_size_stock: {},
      last_checked: undefined,
      has_sizes: undefined,
    };
  } catch (error) {
    throw new Error(`Error loading state from Supabase: ${error}`);
  }
}

export async function saveState(
  productUrl: string,
  options: {
    color_stock?: Record<string, boolean>;
    color_size_stock?: Record<string, Record<string, boolean>>;
    has_sizes?: boolean;
    product_name?: string;
  }
): Promise<void> {
  const supabase = getSupabaseClient();

  const stateData: any = {
    product_url: productUrl,
    last_checked: new Date().toISOString(),
  };

  if (options.product_name !== undefined) {
    stateData.product_name = options.product_name;
  }

  if (options.has_sizes !== undefined) {
    stateData.has_sizes = options.has_sizes;
  }

  if (options.color_stock !== undefined) {
    stateData.color_stock = options.color_stock;
  }

  if (options.color_size_stock !== undefined) {
    stateData.color_size_stock = options.color_size_stock;
  }

  try {
    const { error } = await supabase
      .from('stock_state')
      .upsert(stateData);

    if (error) throw error;
  } catch (error) {
    throw new Error(`Error saving state to Supabase: ${error}`);
  }
}

export async function saveStockHistory(
  productUrl: string,
  productName: string,
  color: string,
  size?: string | null
): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    const historyData = {
      product_url: productUrl,
      product_name: productName,
      color,
      size: size || null,
      came_back_in_stock_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('stock_history')
      .insert(historyData);

    if (error) throw error;
  } catch (error) {
    throw new Error(`Error saving stock history to Supabase: ${error}`);
  }
}

export async function getPopularItems(limit: number = 20): Promise<PopularItem[]> {
  const supabase = getSupabaseClient();

  try {
    // Get subscription counts per product
    const subscriptions = await loadSubscriptions();
    const productCounts: Record<string, number> = {};

    for (const sub of Object.values(subscriptions)) {
      if (sub.verified) {
        const productUrl = sub.product_url;
        productCounts[productUrl] = (productCounts[productUrl] || 0) + 1;
      }
    }

    // Get product details from stock_state
    const popularItems: PopularItem[] = [];
    const sortedProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    for (const [productUrl, subCount] of sortedProducts) {
      const { data, error } = await supabase
        .from('stock_state')
        .select('*')
        .eq('product_url', productUrl)
        .single();

      if (!error && data) {
        popularItems.push({
          product_url: productUrl,
          product_name: data.product_name || 'Unknown Product',
          subscription_count: subCount,
          has_sizes: data.has_sizes ?? false,
          last_checked: data.last_checked,
        });
      }
    }

    return popularItems;
  } catch (error) {
    throw new Error(`Error getting popular items from Supabase: ${error}`);
  }
}

export async function getLastInStockTimes(
  productUrl: string
): Promise<Record<string, Record<string, string>>> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('stock_history')
      .select('color, size, came_back_in_stock_at')
      .eq('product_url', productUrl)
      .order('came_back_in_stock_at', { ascending: false });

    if (error) throw error;

    const lastTimes: Record<string, Record<string, string>> = {};
    const seenCombinations = new Set<string>();

    if (data) {
      for (const row of data) {
        const color = row.color;
        const size = row.size || 'null'; // Use string 'null' instead of null for key
        const timestamp = row.came_back_in_stock_at;

        // Create a unique key for this color/size combination
        const combinationKey = `${color}:${size}`;

        // Since results are ordered by timestamp DESC, first occurrence is most recent
        if (!seenCombinations.has(combinationKey)) {
          seenCombinations.add(combinationKey);

          if (!lastTimes[color]) {
            lastTimes[color] = {};
          }

          lastTimes[color][size] = timestamp;
        }
      }
    }

    return lastTimes;
  } catch (error) {
    throw new Error(`Error getting last in-stock times from Supabase: ${error}`);
  }
}
