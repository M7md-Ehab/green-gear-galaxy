
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seriesParam = searchParams.get('series');
  
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const series = Array.from(new Set(products.map(p => p.series)));
  
  useEffect(() => {
    if (seriesParam) {
      setSelectedSeries(seriesParam);
    }
  }, [seriesParam]);
  
  const filteredProducts = selectedSeries 
    ? products.filter(p => p.series === selectedSeries)
    : products;

  const handleSeriesFilter = (series: string | null) => {
    setSelectedSeries(series);
    
    if (series) {
      searchParams.set('series', series);
    } else {
      searchParams.delete('series');
    }
    
    setSearchParams(searchParams);
  };

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
              onClick={() => handleSeriesFilter(null)}
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
                onClick={() => handleSeriesFilter(s)}
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
