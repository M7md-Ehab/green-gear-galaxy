
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
    // Auth
    'welcome_back': 'Welcome back',
    'create_account': 'Create your account',
    'email_address': 'Email address',
    'continue': 'Continue',
    'verify_email': 'Verify your email',
    'enter_code': 'Enter the 6-digit code sent to',
    'verify': 'Verify',
    'resend_code': 'Resend code',
    'back': 'Back',
    // Navigation
    'home': 'Home',
    'products': 'Products',
    'cart': 'Cart',
    'dashboard': 'Dashboard',
    'sign_out': 'Sign out',
    'sign_in': 'Sign in',
    // Products
    'add_to_cart': 'Add to Cart',
    'buy_now': 'Buy Now',
    'product_not_found': 'Product Not Found',
    'product_not_found_desc': "The product you're looking for doesn't exist or has been removed.",
    'back_to_products': 'Back to Products',
    // Cart & Checkout
    'checkout': 'Checkout',
    'place_order': 'Place Order',
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'phone_number': 'Phone Number',
    'address': 'Address',
    'city': 'City',
    'total': 'Total',
    // Messages
    'verification_sent': 'Verification code sent to your email',
    'invalid_code': 'Invalid verification code',
    'order_success': 'Order placed successfully!',
    'order_error': 'An error occurred processing your order',
  },
  ar: {
    // Auth
    'welcome_back': 'مرحباً بعودتك',
    'create_account': 'إنشاء حساب جديد',
    'email_address': 'عنوان البريد الإلكتروني',
    'continue': 'متابعة',
    'verify_email': 'تحقق من بريدك الإلكتروني',
    'enter_code': 'أدخل الرمز المكون من 6 أرقام المرسل إلى',
    'verify': 'تحقق',
    'resend_code': 'إعادة إرسال الرمز',
    'back': 'رجوع',
    // Navigation
    'home': 'الرئيسية',
    'products': 'المنتجات',
    'cart': 'السلة',
    'dashboard': 'لوحة التحكم',
    'sign_out': 'تسجيل الخروج',
    'sign_in': 'تسجيل الدخول',
    // Products
    'add_to_cart': 'أضف إلى السلة',
    'buy_now': 'اشتري الآن',
    'product_not_found': 'المنتج غير موجود',
    'product_not_found_desc': 'المنتج الذي تبحث عنه غير موجود أو تم حذفه.',
    'back_to_products': 'العودة إلى المنتجات',
    // Cart & Checkout
    'checkout': 'الدفع',
    'place_order': 'تأكيد الطلب',
    'first_name': 'الاسم الأول',
    'last_name': 'الاسم الأخير',
    'phone_number': 'رقم الهاتف',
    'address': 'العنوان',
    'city': 'المدينة',
    'total': 'المجموع',
    // Messages
    'verification_sent': 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
    'invalid_code': 'رمز التحقق غير صحيح',
    'order_success': 'تم تأكيد الطلب بنجاح!',
    'order_error': 'حدث خطأ أثناء معالجة طلبك',
  },
  fr: {
    // Auth
    'welcome_back': 'Content de vous revoir',
    'create_account': 'Créer votre compte',
    'email_address': 'Adresse e-mail',
    'continue': 'Continuer',
    'verify_email': 'Vérifiez votre e-mail',
    'enter_code': 'Entrez le code à 6 chiffres envoyé à',
    'verify': 'Vérifier',
    'resend_code': 'Renvoyer le code',
    'back': 'Retour',
    // Navigation
    'home': 'Accueil',
    'products': 'Produits',
    'cart': 'Panier',
    'dashboard': 'Tableau de bord',
    'sign_out': 'Se déconnecter',
    'sign_in': 'Se connecter',
    // Products
    'add_to_cart': 'Ajouter au panier',
    'buy_now': 'Acheter maintenant',
    'product_not_found': 'Produit non trouvé',
    'product_not_found_desc': "Le produit que vous cherchez n'existe pas ou a été supprimé.",
    'back_to_products': 'Retour aux produits',
    // Cart & Checkout
    'checkout': 'Commander',
    'place_order': 'Passer commande',
    'first_name': 'Prénom',
    'last_name': 'Nom',
    'phone_number': 'Numéro de téléphone',
    'address': 'Adresse',
    'city': 'Ville',
    'total': 'Total',
    // Messages
    'verification_sent': 'Code de vérification envoyé à votre e-mail',
    'invalid_code': 'Code de vérification invalide',
    'order_success': 'Commande passée avec succès!',
    'order_error': 'Une erreur est survenue lors du traitement de votre commande',
  },
  es: {
    // Auth
    'welcome_back': 'Bienvenido de nuevo',
    'create_account': 'Crear tu cuenta',
    'email_address': 'Dirección de correo electrónico',
    'continue': 'Continuar',
    'verify_email': 'Verifica tu correo electrónico',
    'enter_code': 'Ingresa el código de 6 dígitos enviado a',
    'verify': 'Verificar',
    'resend_code': 'Reenviar código',
    'back': 'Atrás',
    // Navigation
    'home': 'Inicio',
    'products': 'Productos',
    'cart': 'Carrito',
    'dashboard': 'Panel',
    'sign_out': 'Cerrar sesión',
    'sign_in': 'Iniciar sesión',
    // Products
    'add_to_cart': 'Añadir al carrito',
    'buy_now': 'Comprar ahora',
    'product_not_found': 'Producto no encontrado',
    'product_not_found_desc': 'El producto que buscas no existe o ha sido eliminado.',
    'back_to_products': 'Volver a productos',
    // Cart & Checkout
    'checkout': 'Pagar',
    'place_order': 'Realizar pedido',
    'first_name': 'Nombre',
    'last_name': 'Apellido',
    'phone_number': 'Número de teléfono',
    'address': 'Dirección',
    'city': 'Ciudad',
    'total': 'Total',
    // Messages
    'verification_sent': 'Código de verificación enviado a tu correo',
    'invalid_code': 'Código de verificación inválido',
    'order_success': '¡Pedido realizado con éxito!',
    'order_error': 'Ocurrió un error procesando tu pedido',
  },
  de: {
    // Auth
    'welcome_back': 'Willkommen zurück',
    'create_account': 'Konto erstellen',
    'email_address': 'E-Mail-Adresse',
    'continue': 'Weiter',
    'verify_email': 'E-Mail verifizieren',
    'enter_code': 'Geben Sie den 6-stelligen Code ein, der an',
    'verify': 'Verifizieren',
    'resend_code': 'Code erneut senden',
    'back': 'Zurück',
    // Navigation
    'home': 'Startseite',
    'products': 'Produkte',
    'cart': 'Warenkorb',
    'dashboard': 'Dashboard',
    'sign_out': 'Abmelden',
    'sign_in': 'Anmelden',
    // Products
    'add_to_cart': 'In den Warenkorb',
    'buy_now': 'Jetzt kaufen',
    'product_not_found': 'Produkt nicht gefunden',
    'product_not_found_desc': 'Das gesuchte Produkt existiert nicht oder wurde entfernt.',
    'back_to_products': 'Zurück zu Produkten',
    // Cart & Checkout
    'checkout': 'Kasse',
    'place_order': 'Bestellung aufgeben',
    'first_name': 'Vorname',
    'last_name': 'Nachname',
    'phone_number': 'Telefonnummer',
    'address': 'Adresse',
    'city': 'Stadt',
    'total': 'Gesamt',
    // Messages
    'verification_sent': 'Bestätigungscode an Ihre E-Mail gesendet',
    'invalid_code': 'Ungültiger Bestätigungscode',
    'order_success': 'Bestellung erfolgreich aufgegeben!',
    'order_error': 'Fehler bei der Bearbeitung Ihrer Bestellung',
  },
  zh: {
    // Auth
    'welcome_back': '欢迎回来',
    'create_account': '创建您的账户',
    'email_address': '电子邮件地址',
    'continue': '继续',
    'verify_email': '验证您的邮箱',
    'enter_code': '输入发送到以下邮箱的6位数字验证码',
    'verify': '验证',
    'resend_code': '重发验证码',
    'back': '返回',
    // Navigation
    'home': '首页',
    'products': '产品',
    'cart': '购物车',
    'dashboard': '仪表板',
    'sign_out': '退出登录',
    'sign_in': '登录',
    // Products
    'add_to_cart': '加入购物车',
    'buy_now': '立即购买',
    'product_not_found': '产品未找到',
    'product_not_found_desc': '您寻找的产品不存在或已被删除。',
    'back_to_products': '返回产品页',
    // Cart & Checkout
    'checkout': '结账',
    'place_order': '下订单',
    'first_name': '名字',
    'last_name': '姓氏',
    'phone_number': '电话号码',
    'address': '地址',
    'city': '城市',
    'total': '总计',
    // Messages
    'verification_sent': '验证码已发送到您的邮箱',
    'invalid_code': '验证码无效',
    'order_success': '订单下单成功！',
    'order_error': '处理订单时发生错误',
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
