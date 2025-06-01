
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '@/data/products';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const seriesParam = searchParams.get('series');
  const typeParam = searchParams.get('type');
  
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'vending' | 'claw' | null>(null);
  
  const series = Array.from(new Set(products.map(p => p.series)));
  const types = Array.from(new Set(products.map(p => p.type)));
  
  useEffect(() => {
    if (seriesParam) {
      setSelectedSeries(seriesParam);
    }
    if (typeParam) {
      setSelectedType(typeParam as 'vending' | 'claw');
    }
  }, [seriesParam, typeParam]);
  
  const filteredProducts = products.filter(p => {
    if (selectedSeries && p.series !== selectedSeries) return false;
    if (selectedType && p.type !== selectedType) return false;
    return true;
  });

  const handleSeriesFilter = (series: string | null) => {
    setSelectedSeries(series);
    
    if (series) {
      searchParams.set('series', series);
    } else {
      searchParams.delete('series');
    }
    
    setSearchParams(searchParams);
  };

  const handleTypeFilter = (type: 'vending' | 'claw' | null) => {
    setSelectedType(type);
    
    if (type) {
      searchParams.set('type', type);
    } else {
      searchParams.delete('type');
    }
    
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <div className="animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">Our Gaming Machines</h1>
            <p className="text-gray-400 text-xl mb-12">Discover the future of arcade entertainment</p>
          </div>
          
          {/* Machine Type Filters */}
          <div className="mb-8 animate-fade-in delay-200">
            <h3 className="text-lg font-semibold mb-4 text-brand-green">Machine Type</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all hover-scale ${
                  selectedType === null 
                    ? 'bg-brand-green text-black shadow-lg shadow-brand-green/30' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                }`}
                onClick={() => handleTypeFilter(null)}
              >
                All Machines
              </button>
              {types.map(type => (
                <button
                  key={type}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all hover-scale capitalize ${
                    selectedType === type 
                      ? 'bg-brand-green text-black shadow-lg shadow-brand-green/30' 
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                  }`}
                  onClick={() => handleTypeFilter(type as 'vending' | 'claw')}
                >
                  {type} Machines
                </button>
              ))}
            </div>
          </div>
          
          {/* Series Filters */}
          <div className="mb-8 animate-fade-in delay-300">
            <h3 className="text-lg font-semibold mb-4 text-brand-green">Series</h3>
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-4 py-2 rounded-full text-sm transition-all hover-scale ${
                  selectedSeries === null 
                    ? 'bg-brand-green text-black' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
                onClick={() => handleSeriesFilter(null)}
              >
                All Series
              </button>
              {series.map(s => (
                <button
                  key={s}
                  className={`px-4 py-2 rounded-full text-sm transition-all hover-scale ${
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
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in delay-400">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className={`animate-fade-in delay-${(index % 6 + 1) * 100}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-gray-400 text-xl">No products found matching your filters.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
