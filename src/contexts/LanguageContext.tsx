
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇪🇬' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    'home': 'Home',
    'products': 'Products',
    'accessories': 'Accessories',
    'about': 'About',
    'contact': 'Contact',
    'cart': 'Cart',
    // Hero
    'hero_title_1': 'Next Generation',
    'hero_title_2': 'Vlitrix Machines',
    'hero_desc': 'Experience unprecedented entertainment with our cutting-edge',
    'hero_claw': 'claw machines',
    'hero_and': 'and',
    'hero_vending': 'vending machines',
    'hero_desc_2': 'designed for the modern arcade.',
    'explore_products': 'Explore All Products',
    // Features
    'why_choose': 'Why Choose Vlitrix?',
    'why_choose_desc': 'Discover the future of gaming entertainment with our innovative technology',
    'fast_delivery': 'Fast Delivery',
    'fast_delivery_desc': 'Lightning-fast shipping with premium packaging and white-glove service.',
    'secure_payment': 'Secure Payment',
    'secure_payment_desc': 'Advanced encryption and multiple payment options for your peace of mind.',
    'support_24_7': '24/7 Support',
    'support_24_7_desc': 'Round-the-clock technical assistance from our expert team.',
    'secure_100': '100% Secure',
    'secure_100_desc': 'Military-grade security for all your personal and business data.',
    // Products
    'featured_machines': 'Featured Gaming Machines',
    'featured_desc': 'Experience the perfect blend of cutting-edge technology and entertainment with our premium claw and vending machines.',
    'add_to_cart': 'Add to Cart',
    'buy_now': 'Buy Now',
    // Technology
    'advanced_engineering': 'Advanced Engineering',
    'advanced_desc': 'Our machines feature state-of-the-art technology including smart automation systems, precision engineering, and advanced user interfaces that deliver exceptional gaming experiences.',
    'smart_systems': 'Smart Systems',
    'smart_systems_desc': 'Intelligent automation',
    'precision_tech': 'Precision Tech',
    'precision_tech_desc': 'Engineered excellence',
    'premium_quality': 'Premium Quality',
    'premium_quality_desc': 'Superior craftsmanship',
    'uptime_reliability': 'Uptime Reliability',
    // CTA
    'ready_elevate': 'Ready to Elevate Your Business?',
    'ready_desc': 'Join innovative businesses worldwide who have transformed their customer experience with our cutting-edge gaming machines and technology solutions.',
    // Footer
    'company': 'Company',
    'about_us': 'About Us',
    'privacy_policy': 'Privacy Policy',
    'terms_conditions': 'Terms & Conditions',
    'return_policy': 'Return Policy',
    'support': 'Support',
    'footer_desc': 'Leading provider of innovative gaming and vending machines for the modern entertainment industry.',
  },
  ar: {
    // Navigation
    'home': 'الرئيسية',
    'products': 'المنتجات',
    'accessories': 'الإكسسوارات',
    'about': 'من نحن',
    'contact': 'اتصل بنا',
    'cart': 'السلة',
    // Hero
    'hero_title_1': 'الجيل القادم',
    'hero_title_2': 'آلات فليتريكس',
    'hero_desc': 'اختبر ترفيهًا غير مسبوق مع',
    'hero_claw': 'آلات المخلب',
    'hero_and': 'و',
    'hero_vending': 'آلات البيع',
    'hero_desc_2': 'المصممة للصالات الحديثة.',
    'explore_products': 'استكشف جميع المنتجات',
    // Features
    'why_choose': 'لماذا تختار فليتريكس؟',
    'why_choose_desc': 'اكتشف مستقبل الترفيه الألعابي مع تقنيتنا المبتكرة',
    'fast_delivery': 'توصيل سريع',
    'fast_delivery_desc': 'شحن سريع مع تغليف فاخر وخدمة متميزة.',
    'secure_payment': 'دفع آمن',
    'secure_payment_desc': 'تشفير متقدم وخيارات دفع متعددة لراحة بالك.',
    'support_24_7': 'دعم 24/7',
    'support_24_7_desc': 'مساعدة فنية على مدار الساعة من فريقنا المتخصص.',
    'secure_100': 'آمن 100%',
    'secure_100_desc': 'أمان عسكري لجميع بياناتك الشخصية والتجارية.',
    // Products
    'featured_machines': 'آلات الألعاب المميزة',
    'featured_desc': 'اختبر المزيج المثالي من التكنولوجيا المتطورة والترفيه مع آلات المخلب والبيع المميزة.',
    'add_to_cart': 'أضف إلى السلة',
    'buy_now': 'اشتري الآن',
    // Technology
    'advanced_engineering': 'هندسة متقدمة',
    'advanced_desc': 'تتميز آلاتنا بتكنولوجيا متطورة تشمل أنظمة أتمتة ذكية وهندسة دقيقة وواجهات مستخدم متقدمة توفر تجارب لعب استثنائية.',
    'smart_systems': 'أنظمة ذكية',
    'smart_systems_desc': 'أتمتة ذكية',
    'precision_tech': 'تقنية دقيقة',
    'precision_tech_desc': 'تميز هندسي',
    'premium_quality': 'جودة فائقة',
    'premium_quality_desc': 'حرفية متفوقة',
    'uptime_reliability': 'موثوقية وقت التشغيل',
    // CTA
    'ready_elevate': 'هل أنت مستعد لتطوير عملك؟',
    'ready_desc': 'انضم إلى الشركات المبتكرة حول العالم التي حولت تجربة عملائها مع آلات الألعاب والحلول التقنية المتطورة.',
    // Footer
    'company': 'الشركة',
    'about_us': 'من نحن',
    'privacy_policy': 'سياسة الخصوصية',
    'terms_conditions': 'الشروط والأحكام',
    'return_policy': 'سياسة الإرجاع',
    'support': 'الدعم',
    'footer_desc': 'المزود الرائد لآلات الألعاب والبيع المبتكرة لصناعة الترفيه الحديثة.',
  },
  fr: {
    // Navigation
    'home': 'Accueil',
    'products': 'Produits',
    'accessories': 'Accessoires',
    'about': 'À propos',
    'contact': 'Contact',
    'cart': 'Panier',
    // Hero
    'hero_title_1': 'Nouvelle Génération',
    'hero_title_2': 'Machines Vlitrix',
    'hero_desc': 'Découvrez un divertissement sans précédent avec nos',
    'hero_claw': 'machines à griffes',
    'hero_and': 'et',
    'hero_vending': 'distributeurs automatiques',
    'hero_desc_2': 'conçus pour les salles de jeux modernes.',
    'explore_products': 'Explorer tous les produits',
    // Features
    'why_choose': 'Pourquoi choisir Vlitrix?',
    'why_choose_desc': 'Découvrez le futur du divertissement gaming avec notre technologie innovante',
    'fast_delivery': 'Livraison rapide',
    'fast_delivery_desc': 'Expédition ultra-rapide avec emballage premium et service premium.',
    'secure_payment': 'Paiement sécurisé',
    'secure_payment_desc': 'Cryptage avancé et options de paiement multiples pour votre tranquillité.',
    'support_24_7': 'Support 24/7',
    'support_24_7_desc': 'Assistance technique 24h/24 de notre équipe d\'experts.',
    'secure_100': '100% Sécurisé',
    'secure_100_desc': 'Sécurité militaire pour toutes vos données personnelles et professionnelles.',
    // Products
    'featured_machines': 'Machines de jeu vedettes',
    'featured_desc': 'Découvrez le mélange parfait de technologie de pointe et de divertissement avec nos machines à griffes et distributeurs premium.',
    'add_to_cart': 'Ajouter au panier',
    'buy_now': 'Acheter maintenant',
    // Technology
    'advanced_engineering': 'Ingénierie avancée',
    'advanced_desc': 'Nos machines intègrent une technologie de pointe comprenant des systèmes d\'automatisation intelligents, une ingénierie de précision et des interfaces utilisateur avancées offrant des expériences de jeu exceptionnelles.',
    'smart_systems': 'Systèmes intelligents',
    'smart_systems_desc': 'Automatisation intelligente',
    'precision_tech': 'Technologie de précision',
    'precision_tech_desc': 'Excellence technique',
    'premium_quality': 'Qualité premium',
    'premium_quality_desc': 'Artisanat supérieur',
    'uptime_reliability': 'Fiabilité du temps de fonctionnement',
    // CTA
    'ready_elevate': 'Prêt à élever votre entreprise?',
    'ready_desc': 'Rejoignez les entreprises innovantes du monde entier qui ont transformé leur expérience client avec nos machines de jeu et solutions technologiques de pointe.',
    // Footer
    'company': 'Entreprise',
    'about_us': 'À propos de nous',
    'privacy_policy': 'Politique de confidentialité',
    'terms_conditions': 'Termes et conditions',
    'return_policy': 'Politique de retour',
    'support': 'Support',
    'footer_desc': 'Fournisseur leader de machines de jeu et distributeurs innovants pour l\'industrie du divertissement moderne.',
  },
  es: {
    // Navigation
    'home': 'Inicio',
    'products': 'Productos',
    'accessories': 'Accesorios',
    'about': 'Acerca de',
    'contact': 'Contacto',
    'cart': 'Carrito',
    // Hero
    'hero_title_1': 'Nueva Generación',
    'hero_title_2': 'Máquinas Vlitrix',
    'hero_desc': 'Experimenta entretenimiento sin precedentes con nuestras',
    'hero_claw': 'máquinas de garra',
    'hero_and': 'y',
    'hero_vending': 'máquinas expendedoras',
    'hero_desc_2': 'diseñadas para la sala de juegos moderna.',
    'explore_products': 'Explorar todos los productos',
    // Features
    'why_choose': '¿Por qué elegir Vlitrix?',
    'why_choose_desc': 'Descubre el futuro del entretenimiento gaming con nuestra tecnología innovadora',
    'fast_delivery': 'Entrega rápida',
    'fast_delivery_desc': 'Envío ultrarrápido con embalaje premium y servicio de guante blanco.',
    'secure_payment': 'Pago seguro',
    'secure_payment_desc': 'Encriptación avanzada y múltiples opciones de pago para tu tranquilidad.',
    'support_24_7': 'Soporte 24/7',
    'support_24_7_desc': 'Asistencia técnica las 24 horas de nuestro equipo experto.',
    'secure_100': '100% Seguro',
    'secure_100_desc': 'Seguridad de grado militar para todos tus datos personales y empresariales.',
    // Products
    'featured_machines': 'Máquinas de juego destacadas',
    'featured_desc': 'Experimenta la combinación perfecta de tecnología de vanguardia y entretenimiento con nuestras máquinas de garra y expendedoras premium.',
    'add_to_cart': 'Añadir al carrito',
    'buy_now': 'Comprar ahora',
    // Technology
    'advanced_engineering': 'Ingeniería avanzada',
    'advanced_desc': 'Nuestras máquinas cuentan con tecnología de última generación que incluye sistemas de automatización inteligente, ingeniería de precisión e interfaces de usuario avanzadas que brindan experiencias de juego excepcionales.',
    'smart_systems': 'Sistemas inteligentes',
    'smart_systems_desc': 'Automatización inteligente',
    'precision_tech': 'Tecnología de precisión',
    'precision_tech_desc': 'Excelencia técnica',
    'premium_quality': 'Calidad premium',
    'premium_quality_desc': 'Artesanía superior',
    'uptime_reliability': 'Fiabilidad del tiempo de actividad',
    // CTA
    'ready_elevate': '¿Listo para elevar tu negocio?',
    'ready_desc': 'Únete a empresas innovadoras de todo el mundo que han transformado su experiencia de cliente con nuestras máquinas de juego y soluciones tecnológicas de vanguardia.',
    // Footer
    'company': 'Empresa',
    'about_us': 'Acerca de nosotros',
    'privacy_policy': 'Política de privacidad',
    'terms_conditions': 'Términos y condiciones',
    'return_policy': 'Política de devolución',
    'support': 'Soporte',
    'footer_desc': 'Proveedor líder de máquinas de juego y expendedoras innovadoras para la industria del entretenimiento moderno.',
  },
  de: {
    // Navigation
    'home': 'Startseite',
    'products': 'Produkte',
    'accessories': 'Zubehör',
    'about': 'Über uns',
    'contact': 'Kontakt',
    'cart': 'Warenkorb',
    // Hero
    'hero_title_1': 'Nächste Generation',
    'hero_title_2': 'Vlitrix Maschinen',
    'hero_desc': 'Erleben Sie beispiellose Unterhaltung mit unseren hochmodernen',
    'hero_claw': 'Greifautomaten',
    'hero_and': 'und',
    'hero_vending': 'Verkaufsautomaten',
    'hero_desc_2': 'für moderne Spielhallen entwickelt.',
    'explore_products': 'Alle Produkte erkunden',
    // Features
    'why_choose': 'Warum Vlitrix wählen?',
    'why_choose_desc': 'Entdecken Sie die Zukunft der Gaming-Unterhaltung mit unserer innovativen Technologie',
    'fast_delivery': 'Schnelle Lieferung',
    'fast_delivery_desc': 'Blitzschneller Versand mit Premium-Verpackung und Premium-Service.',
    'secure_payment': 'Sichere Zahlung',
    'secure_payment_desc': 'Fortgeschrittene Verschlüsselung und mehrere Zahlungsoptionen für Ihre Sicherheit.',
    'support_24_7': '24/7 Support',
    'support_24_7_desc': 'Rund um die Uhr technische Unterstützung von unserem Expertenteam.',
    'secure_100': '100% Sicher',
    'secure_100_desc': 'Militärische Sicherheit für alle Ihre persönlichen und geschäftlichen Daten.',
    // Products
    'featured_machines': 'Featured Gaming-Maschinen',
    'featured_desc': 'Erleben Sie die perfekte Mischung aus modernster Technologie und Unterhaltung mit unseren Premium-Greif- und Verkaufsautomaten.',
    'add_to_cart': 'In den Warenkorb',
    'buy_now': 'Jetzt kaufen',
    // Technology
    'advanced_engineering': 'Fortgeschrittene Technik',
    'advanced_desc': 'Unsere Maschinen verfügen über modernste Technologie einschließlich intelligenter Automatisierungssysteme, Präzisionstechnik und fortschrittlicher Benutzeroberflächen, die außergewöhnliche Spielerlebnisse bieten.',
    'smart_systems': 'Intelligente Systeme',
    'smart_systems_desc': 'Intelligente Automatisierung',
    'precision_tech': 'Präzisionstechnik',
    'precision_tech_desc': 'Technische Exzellenz',
    'premium_quality': 'Premium-Qualität',
    'premium_quality_desc': 'Überlegene Handwerkskunst',
    'uptime_reliability': 'Betriebszeit-Zuverlässigkeit',
    // CTA
    'ready_elevate': 'Bereit, Ihr Geschäft zu verbessern?',
    'ready_desc': 'Schließen Sie sich innovativen Unternehmen weltweit an, die ihre Kundenerfahrung mit unseren hochmodernen Gaming-Maschinen und Technologielösungen transformiert haben.',
    // Footer
    'company': 'Unternehmen',
    'about_us': 'Über uns',
    'privacy_policy': 'Datenschutzrichtlinie',
    'terms_conditions': 'Allgemeine Geschäftsbedingungen',
    'return_policy': 'Rückgaberichtlinie',
    'support': 'Support',
    'footer_desc': 'Führender Anbieter innovativer Gaming- und Verkaufsautomaten für die moderne Unterhaltungsindustrie.',
  },
  zh: {
    // Navigation
    'home': '首页',
    'products': '产品',
    'accessories': '配件',
    'about': '关于我们',
    'contact': '联系我们',
    'cart': '购物车',
    // Hero
    'hero_title_1': '下一代',
    'hero_title_2': 'Vlitrix 机器',
    'hero_desc': '体验我们尖端的前所未有的娱乐',
    'hero_claw': '抓娃娃机',
    'hero_and': '和',
    'hero_vending': '自动售货机',
    'hero_desc_2': '专为现代游戏厅设计。',
    'explore_products': '探索所有产品',
    // Features
    'why_choose': '为什么选择 Vlitrix？',
    'why_choose_desc': '通过我们的创新技术发现游戏娱乐的未来',
    'fast_delivery': '快速配送',
    'fast_delivery_desc': '闪电般快速的运输，配备高级包装和白手套服务。',
    'secure_payment': '安全支付',
    'secure_payment_desc': '先进的加密技术和多种支付选项，让您安心。',
    'support_24_7': '24/7 支持',
    'support_24_7_desc': '我们的专家团队提供全天候技术支持。',
    'secure_100': '100% 安全',
    'secure_100_desc': '军事级安全保护您的所有个人和商业数据。',
    // Products
    'featured_machines': '特色游戏机',
    'featured_desc': '通过我们的高级抓娃娃机和自动售货机，体验尖端技术和娱乐的完美结合。',
    'add_to_cart': '加入购物车',
    'buy_now': '立即购买',
    // Technology
    'advanced_engineering': '先进工程',
    'advanced_desc': '我们的机器采用最先进的技术，包括智能自动化系统、精密工程和先进的用户界面，提供卓越的游戏体验。',
    'smart_systems': '智能系统',
    'smart_systems_desc': '智能自动化',
    'precision_tech': '精密技术',
    'precision_tech_desc': '卓越工程',
    'premium_quality': '优质品质',
    'premium_quality_desc': '卓越工艺',
    'uptime_reliability': '运行时间可靠性',
    // CTA
    'ready_elevate': '准备好提升您的业务了吗？',
    'ready_desc': '加入全球创新企业，通过我们的尖端游戏机和技术解决方案改变客户体验。',
    // Footer
    'company': '公司',
    'about_us': '关于我们',
    'privacy_policy': '隐私政策',
    'terms_conditions': '条款和条件',
    'return_policy': '退货政策',
    'support': '支持',
    'footer_desc': '现代娱乐行业创新游戏和售货机的领先供应商。',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang) {
      const lang = languages.find(l => l.code === savedLang);
      if (lang) {
        setCurrentLanguage(lang);
      }
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language.code);
  };

  const t = (key: string): string => {
    return translations[currentLanguage.code]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
