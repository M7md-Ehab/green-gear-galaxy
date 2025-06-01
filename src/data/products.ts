
export interface Product {
  id: string;
  name: string;
  series: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  category: string;
  stock: number;
  type: 'vending' | 'claw';
}

export const products: Product[] = [
  // Vending Machine Series
  {
    id: "t1-basic",
    name: "T1",
    series: "T Series",
    price: 6000,
    description: "Entry-level vending machine with powerful performance and reliability for everyday operations.",
    features: [
      "Compact design",
      "Energy efficient",
      "Basic functionality",
      "User-friendly interface",
      "1-year warranty"
    ],
    image: "/placeholder.svg",
    category: "entry-level",
    stock: 15,
    type: "vending"
  },
  {
    id: "t1-pro",
    name: "T1 Pro",
    series: "T Series",
    price: 10000,
    description: "Enhanced version of T1 with premium features for demanding vending operations.",
    features: [
      "Advanced compact design",
      "Improved energy efficiency",
      "Extended functionality",
      "Premium interface",
      "2-year warranty",
      "Priority support"
    ],
    image: "/placeholder.svg",
    category: "entry-level",
    stock: 10,
    type: "vending"
  },
  {
    id: "s1-basic",
    name: "S1",
    series: "S Series",
    price: 15000,
    description: "Mid-range vending machine with exceptional performance and advanced capabilities.",
    features: [
      "Sleek design",
      "High-performance components",
      "Advanced features",
      "Intuitive control system",
      "2-year warranty",
      "Technical support"
    ],
    image: "/placeholder.svg",
    category: "mid-range",
    stock: 8,
    type: "vending"
  },
  {
    id: "s1-pro",
    name: "S1 Pro",
    series: "S Series",
    price: 18000,
    description: "Professional-grade vending machine with superior performance for intensive use.",
    features: [
      "Premium design",
      "Top-tier components",
      "Professional-grade features",
      "Enhanced control system",
      "3-year warranty",
      "24/7 technical support",
      "Free software updates"
    ],
    image: "/placeholder.svg",
    category: "mid-range",
    stock: 6,
    type: "vending"
  },
  {
    id: "x1-basic",
    name: "X1",
    series: "X Series",
    price: 24000,
    description: "High-end vending machine with cutting-edge technology and unparalleled performance.",
    features: [
      "Futuristic design",
      "State-of-the-art components",
      "Exclusive features",
      "Advanced control system",
      "3-year warranty",
      "Priority 24/7 support",
      "Lifetime software updates",
      "Optional performance upgrades"
    ],
    image: "/placeholder.svg",
    category: "high-end",
    stock: 4,
    type: "vending"
  },
  {
    id: "x1-pro",
    name: "X1 Pro",
    series: "X Series",
    price: 32000,
    description: "Ultimate flagship vending machine for professionals with no compromises.",
    features: [
      "Premium materials",
      "Best-in-class components",
      "Comprehensive feature set",
      "Ultimate control system",
      "5-year warranty",
      "VIP support",
      "Lifetime software and hardware updates",
      "Exclusive customization options",
      "White-glove delivery and setup"
    ],
    image: "/placeholder.svg",
    category: "high-end",
    stock: 2,
    type: "vending"
  },
  // Claw Machine Series
  {
    id: "k1-basic",
    name: "K1",
    series: "K Series",
    price: 6000,
    description: "Entry-level claw machine with reliable claw mechanics and engaging gameplay.",
    features: [
      "Precision claw system",
      "LED lighting effects",
      "Coin-operated mechanism",
      "Prize detection system",
      "1-year warranty"
    ],
    image: "/placeholder.svg",
    category: "entry-level",
    stock: 12,
    type: "claw"
  },
  {
    id: "k1-pro",
    name: "K1 Pro",
    series: "K Series",
    price: 10000,
    description: "Enhanced claw machine with advanced grip control and premium features.",
    features: [
      "Advanced claw mechanics",
      "RGB lighting system",
      "Multiple payment options",
      "Smart prize management",
      "2-year warranty",
      "Remote monitoring"
    ],
    image: "/placeholder.svg",
    category: "entry-level",
    stock: 8,
    type: "claw"
  },
  {
    id: "n1-basic",
    name: "N1",
    series: "N Series",
    price: 15000,
    description: "Mid-range claw machine with enhanced gameplay and durability.",
    features: [
      "Dual-claw system",
      "Interactive display",
      "Sound effects",
      "Anti-tampering features",
      "2-year warranty",
      "Technical support"
    ],
    image: "/placeholder.svg",
    category: "mid-range",
    stock: 6,
    type: "claw"
  },
  {
    id: "n1-pro",
    name: "N1 Pro",
    series: "N Series",
    price: 18000,
    description: "Professional claw machine with superior mechanics and entertainment value.",
    features: [
      "Triple-claw configuration",
      "HD display integration",
      "Customizable difficulty",
      "Revenue tracking",
      "3-year warranty",
      "24/7 support",
      "Software updates"
    ],
    image: "/placeholder.svg",
    category: "mid-range",
    stock: 4,
    type: "claw"
  },
  {
    id: "l1-basic",
    name: "L1",
    series: "L Series",
    price: 24000,
    description: "High-end claw machine with cutting-edge technology and premium experience.",
    features: [
      "AI-powered claw control",
      "4K display system",
      "Biometric payment",
      "Real-time analytics",
      "3-year warranty",
      "Priority support",
      "Lifetime updates",
      "Custom themes"
    ],
    image: "/placeholder.svg",
    category: "high-end",
    stock: 3,
    type: "claw"
  },
  {
    id: "l1-pro",
    name: "L1 Pro",
    series: "L Series",
    price: 32000,
    description: "Ultimate claw machine with revolutionary features and unmatched performance.",
    features: [
      "Quantum claw precision",
      "Holographic displays",
      "Contactless operation",
      "Cloud integration",
      "5-year warranty",
      "VIP support",
      "Lifetime updates",
      "Exclusive customization",
      "White-glove setup"
    ],
    image: "/placeholder.svg",
    category: "high-end",
    stock: 2,
    type: "claw"
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getProductsBySeries = (series: string): Product[] => {
  return products.filter(product => product.series === series);
};

export const getProductsByType = (type: 'vending' | 'claw'): Product[] => {
  return products.filter(product => product.type === type);
};
