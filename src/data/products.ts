
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  series: string;
  type: 'vending' | 'claw';
  specs: {
    power: string;
    dimensions: string;
    weight: string;
    capacity?: string;
    features: string[];
  };
}

export const products: Product[] = [
  // Vending Machine Series
  {
    id: 't1-pro',
    name: 'VendMax T1 Pro',
    price: 8999,
    description: 'Professional vending machine with AI-powered inventory management and contactless payment systems.',
    image: '/placeholder.svg',
    series: 'T1',
    type: 'vending',
    specs: {
      power: '220V/110V',
      dimensions: '183 x 81 x 83 cm',
      weight: '280 kg',
      capacity: '450 products',
      features: ['AI Inventory', 'Contactless Payment', 'Remote Monitoring', 'Climate Control']
    }
  },
  {
    id: 's1-pro',
    name: 'VendMax S1 Pro',
    price: 6499,
    description: 'Compact smart vending solution perfect for offices and small businesses.',
    image: '/placeholder.svg',
    series: 'S1',
    type: 'vending',
    specs: {
      power: '220V/110V',
      dimensions: '150 x 70 x 75 cm',
      weight: '180 kg',
      capacity: '280 products',
      features: ['Smart Payment', 'Energy Efficient', 'Compact Design', 'Mobile App Control']
    }
  },
  {
    id: 'x1-pro',
    name: 'VendMax X1 Pro',
    price: 12999,
    description: 'Enterprise-grade vending machine with advanced analytics and multi-zone temperature control.',
    image: '/placeholder.svg',
    series: 'X1',
    type: 'vending',
    specs: {
      power: '220V/110V',
      dimensions: '190 x 85 x 90 cm',
      weight: '350 kg',
      capacity: '600 products',
      features: ['Multi-Zone Cooling', 'Advanced Analytics', 'Voice Assistant', 'Facial Recognition']
    }
  },
  
  // Claw Machine Series
  {
    id: 'k1-pro',
    name: 'ClawMaster K1 Pro',
    price: 4999,
    description: 'Premium claw machine with precision control and LED lighting effects for maximum player engagement.',
    image: '/placeholder.svg',
    series: 'K1',
    type: 'claw',
    specs: {
      power: '220V/110V',
      dimensions: '85 x 85 x 180 cm',
      weight: '120 kg',
      features: ['Precision Claw Control', 'LED Effects', 'Sound System', 'Prize Detection']
    }
  },
  {
    id: 'n1-pro',
    name: 'ClawMaster N1 Pro',
    price: 3499,
    description: 'Compact claw machine designed for smaller spaces with modern joystick controls.',
    image: '/placeholder.svg',
    series: 'N1',
    type: 'claw',
    specs: {
      power: '220V/110V',
      dimensions: '70 x 70 x 160 cm',
      weight: '85 kg',
      features: ['Modern Joystick', 'Compact Design', 'Easy Maintenance', 'Multiple Game Modes']
    }
  },
  {
    id: 'l1-pro',
    name: 'ClawMaster L1 Pro',
    price: 7999,
    description: 'Luxury claw machine with premium materials, holographic displays, and advanced prize management.',
    image: '/placeholder.svg',
    series: 'L1',
    type: 'claw',
    specs: {
      power: '220V/110V',
      dimensions: '95 x 95 x 200 cm',
      weight: '160 kg',
      features: ['Holographic Display', 'Premium Materials', 'Advanced Prize Management', 'Custom Themes']
    }
  }
];
