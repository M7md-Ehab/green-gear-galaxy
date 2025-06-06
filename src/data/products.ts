
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  series: string;
  type: 'vending' | 'claw';
  stock: number;
  specs: {
    power: string;
    dimensions: string;
    weight: string;
    capacity?: string;
    features: string[];
  };
}

export const products: Product[] = [
  // Vending Machine Series - Standard Models
  {
    id: 't1-standard',
    name: 'T1',
    price: 6999,
    description: 'Smart vending machine with modern payment systems and basic inventory management.',
    image: '/placeholder.svg',
    series: 'T1',
    type: 'vending',
    stock: 25,
    specs: {
      power: '220V/110V',
      dimensions: '180 x 80 x 82 cm',
      weight: '260 kg',
      capacity: '400 products',
      features: ['Digital Payment', 'Basic Inventory', 'LED Display', 'Energy Efficient']
    }
  },
  {
    id: 't1-pro',
    name: 'T1 Pro',
    price: 8999,
    description: 'Professional vending machine with AI-powered inventory management and contactless payment systems.',
    image: '/placeholder.svg',
    series: 'T1',
    type: 'vending',
    stock: 15,
    specs: {
      power: '220V/110V',
      dimensions: '183 x 81 x 83 cm',
      weight: '280 kg',
      capacity: '450 products',
      features: ['AI Inventory', 'Contactless Payment', 'Remote Monitoring', 'Climate Control']
    }
  },
  {
    id: 's1-standard',
    name: 'S1',
    price: 4999,
    description: 'Compact vending solution perfect for small offices and retail spaces.',
    image: '/placeholder.svg',
    series: 'S1',
    type: 'vending',
    stock: 30,
    specs: {
      power: '220V/110V',
      dimensions: '145 x 68 x 73 cm',
      weight: '160 kg',
      capacity: '250 products',
      features: ['Compact Design', 'Basic Payment', 'Easy Maintenance', 'Cost Effective']
    }
  },
  {
    id: 's1-pro',
    name: 'S1 Pro',
    price: 6499,
    description: 'Compact smart vending solution perfect for offices and small businesses.',
    image: '/placeholder.svg',
    series: 'S1',
    type: 'vending',
    stock: 23,
    specs: {
      power: '220V/110V',
      dimensions: '150 x 70 x 75 cm',
      weight: '180 kg',
      capacity: '280 products',
      features: ['Smart Payment', 'Energy Efficient', 'Compact Design', 'Mobile App Control']
    }
  },
  {
    id: 'x1-standard',
    name: 'X1',
    price: 9999,
    description: 'Enterprise vending machine with advanced features and multi-zone cooling.',
    image: '/placeholder.svg',
    series: 'X1',
    type: 'vending',
    stock: 12,
    specs: {
      power: '220V/110V',
      dimensions: '185 x 82 x 88 cm',
      weight: '320 kg',
      capacity: '550 products',
      features: ['Multi-Zone Cooling', 'Advanced Display', 'Enterprise Grade', 'High Capacity']
    }
  },
  {
    id: 'x1-pro',
    name: 'X1 Pro',
    price: 12999,
    description: 'Enterprise-grade vending machine with advanced analytics and multi-zone temperature control.',
    image: '/placeholder.svg',
    series: 'X1',
    type: 'vending',
    stock: 8,
    specs: {
      power: '220V/110V',
      dimensions: '190 x 85 x 90 cm',
      weight: '350 kg',
      capacity: '600 products',
      features: ['Multi-Zone Cooling', 'Advanced Analytics', 'Voice Assistant', 'Facial Recognition']
    }
  },
  
  // Claw Machine Series - Standard and Pro Models
  {
    id: 'k1-standard',
    name: 'K1',
    price: 3499,
    description: 'Standard claw machine with reliable mechanics and basic lighting for entertainment venues.',
    image: '/placeholder.svg',
    series: 'K1',
    type: 'claw',
    stock: 20,
    specs: {
      power: '220V/110V',
      dimensions: '80 x 80 x 175 cm',
      weight: '100 kg',
      features: ['Standard Claw Control', 'Basic Lighting', 'Coin Operation', 'Durable Build']
    }
  },
  {
    id: 'k1-pro',
    name: 'K1 Pro',
    price: 4999,
    description: 'Premium claw machine with precision control and LED lighting effects for maximum player engagement.',
    image: '/placeholder.svg',
    series: 'K1',
    type: 'claw',
    stock: 12,
    specs: {
      power: '220V/110V',
      dimensions: '85 x 85 x 180 cm',
      weight: '120 kg',
      features: ['Precision Claw Control', 'LED Effects', 'Sound System', 'Prize Detection']
    }
  },
  {
    id: 'n1-standard',
    name: 'N1',
    price: 2499,
    description: 'Compact claw machine designed for smaller spaces with standard joystick controls.',
    image: '/placeholder.svg',
    series: 'N1',
    type: 'claw',
    stock: 25,
    specs: {
      power: '220V/110V',
      dimensions: '65 x 65 x 155 cm',
      weight: '70 kg',
      features: ['Standard Joystick', 'Compact Size', 'Basic Operation', 'Space Efficient']
    }
  },
  {
    id: 'n1-pro',
    name: 'N1 Pro',
    price: 3499,
    description: 'Compact claw machine designed for smaller spaces with modern joystick controls.',
    image: '/placeholder.svg',
    series: 'N1',
    type: 'claw',
    stock: 18,
    specs: {
      power: '220V/110V',
      dimensions: '70 x 70 x 160 cm',
      weight: '85 kg',
      features: ['Modern Joystick', 'Compact Design', 'Easy Maintenance', 'Multiple Game Modes']
    }
  },
  {
    id: 'l1-standard',
    name: 'L1',
    price: 5999,
    description: 'Luxury claw machine with premium materials and advanced display technology.',
    image: '/placeholder.svg',
    series: 'L1',
    type: 'claw',
    stock: 10,
    specs: {
      power: '220V/110V',
      dimensions: '90 x 90 x 195 cm',
      weight: '140 kg',
      features: ['Premium Display', 'Luxury Materials', 'Advanced Controls', 'Professional Grade']
    }
  },
  {
    id: 'l1-pro',
    name: 'L1 Pro',
    price: 7999,
    description: 'Luxury claw machine with premium materials, holographic displays, and advanced prize management.',
    image: '/placeholder.svg',
    series: 'L1',
    type: 'claw',
    stock: 5,
    specs: {
      power: '220V/110V',
      dimensions: '95 x 95 x 200 cm',
      weight: '160 kg',
      features: ['Holographic Display', 'Premium Materials', 'Advanced Prize Management', 'Custom Themes']
    }
  }
];
