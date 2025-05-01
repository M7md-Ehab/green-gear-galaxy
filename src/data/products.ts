
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
}

export const products: Product[] = [
  {
    id: "t1-basic",
    name: "T1",
    series: "T Series",
    price: 6000,
    description: "Entry-level machine with powerful performance and reliability for everyday tasks.",
    features: [
      "Compact design",
      "Energy efficient",
      "Basic functionality",
      "User-friendly interface",
      "1-year warranty"
    ],
    image: "/placeholder.svg",
    category: "entry-level",
    stock: 15
  },
  {
    id: "t1-pro",
    name: "T1 Pro",
    series: "T Series",
    price: 10000,
    description: "Enhanced version of T1 with premium features for more demanding tasks.",
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
    stock: 10
  },
  {
    id: "s1-basic",
    name: "S1",
    series: "S Series",
    price: 15000,
    description: "Mid-range machine with exceptional performance and advanced capabilities.",
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
    stock: 8
  },
  {
    id: "s1-pro",
    name: "S1 Pro",
    series: "S Series",
    price: 18000,
    description: "Professional-grade machine with superior performance for intensive use.",
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
    stock: 6
  },
  {
    id: "x1-basic",
    name: "X1",
    series: "X Series",
    price: 24000,
    description: "High-end machine with cutting-edge technology and unparalleled performance.",
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
    stock: 4
  },
  {
    id: "x1-pro",
    name: "X1 Pro",
    series: "X Series",
    price: 32000,
    description: "Ultimate flagship machine for professionals with no compromises.",
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
    stock: 2
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
