
import { useState } from 'react';
import { products } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

const Products = () => {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const series = Array.from(new Set(products.map(p => p.series)));
  
  const filteredProducts = selectedSeries 
    ? products.filter(p => p.series === selectedSeries)
    : products;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-8">Our Products</h1>
          
          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              className={`px-4 py-2 rounded-full text-sm ${
                selectedSeries === null 
                  ? 'bg-brand-green text-black' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
              onClick={() => setSelectedSeries(null)}
            >
              All
            </button>
            {series.map(s => (
              <button
                key={s}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedSeries === s 
                    ? 'bg-brand-green text-black' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
                onClick={() => setSelectedSeries(s)}
              >
                {s}
              </button>
            ))}
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
