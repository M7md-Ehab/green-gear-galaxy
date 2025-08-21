import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/use-products';

const Accessories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  
  const [searchQuery, setSearchQuery] = useState('');
  const { products, loading, error } = useProducts();
  
  // Filter only accessory products
  const accessories = products.filter(p => p.category === 'accessory');
  
  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);
  
  const filteredAccessories = accessories.filter(p => {
    if (!searchQuery) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query) {
      searchParams.set('search', query);
    } else {
      searchParams.delete('search');
    }
    
    setSearchParams(searchParams);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading accessories...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Error loading accessories: {error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <div className="animate-fade-in">
            <h1 className="text-5xl font-bold mb-4">Gaming Accessories</h1>
            <p className="text-muted-foreground text-xl mb-12">Essential accessories to enhance your gaming machines</p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-8 animate-fade-in delay-200">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search accessories..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          {/* Accessories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in delay-400">
            {filteredAccessories.map((accessory, index) => (
              <div key={accessory.id} className={`animate-fade-in delay-${(index % 6 + 1) * 100}`}>
                <ProductCard product={{
                  ...accessory,
                  images: [accessory.image_url || '/placeholder.svg'],
                  series: 'Accessories',
                  type: 'accessory' as const,
                  stock: accessory.inventory_count || 0,
                  specs: {
                    power: 'Variable',
                    dimensions: 'See description',
                    weight: 'Variable',
                    features: ['Universal Compatibility', 'Easy Installation']
                  }
                }} />
              </div>
            ))}
          </div>
          
          {filteredAccessories.length === 0 && !loading && (
            <div className="text-center py-16 animate-fade-in">
              <p className="text-muted-foreground text-xl">
                {searchQuery ? 'No accessories found matching your search.' : 'No accessories available yet.'}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Accessories;