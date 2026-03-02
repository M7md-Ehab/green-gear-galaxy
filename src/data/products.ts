
// Product type now matches database schema
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  images: string[] | null;
  series: string | null;
  type: string | null;
  category: string;
  in_stock: boolean | null;
  inventory_count: number | null;
  specs: any;
  created_at: string | null;
  updated_at: string | null;
}

// No more hardcoded products - everything comes from the database
export const products: Product[] = [];
