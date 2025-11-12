import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'ja' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.explore': 'Explore',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'hero.title': 'Fund Dreams with Bitcoin',
    'hero.subtitle': 'Create wishlists, share your story, and receive Bitcoin support from around the world',
    'hero.cta': 'Get Started',
    'hero.explore': 'Explore Wishlists',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.pricing': 'Pricing',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.tagline': 'Empowering dreams with Bitcoin',
    'explore.title': 'Explore Wishlists',
    'explore.subtitle': 'Discover amazing creators and support their dreams around the world',
    'explore.search': 'Search wishlists...',
    'explore.allCountries': 'All Countries',
    'explore.showMap': 'Show Map',
    'explore.hideMap': 'Hide Map',
    'explore.mapTitle': 'Wishlists Around the World',
    'explore.raised': 'raised',
    'explore.noResults': 'No results found',
    'explore.tryAgain': 'Try adjusting your filters',
    'about.title': 'About BitWish',
    'about.subtitle': 'Our Mission',
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Get in Touch',
    'pricing.title': 'Pricing',
    'pricing.subtitle': 'Simple, Transparent',
  },
  es: {
    'nav.explore': 'Explorar',
    'nav.dashboard': 'Panel',
    'nav.settings': 'Ajustes',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'hero.title': 'Financia Sueños con Bitcoin',
    'hero.subtitle': 'Crea listas de deseos, comparte tu historia y recibe apoyo en Bitcoin de todo el mundo',
    'hero.cta': 'Comenzar',
    'hero.explore': 'Explorar Listas',
    'footer.about': 'Acerca de',
    'footer.contact': 'Contacto',
    'footer.pricing': 'Precios',
    'footer.terms': 'Términos de Servicio',
    'footer.privacy': 'Política de Privacidad',
    'footer.tagline': 'Empoderando sueños con Bitcoin',
    'explore.title': 'Explorar Listas de Deseos',
    'explore.subtitle': 'Descubre creadores increíbles y apoya sus sueños en todo el mundo',
    'explore.search': 'Buscar listas...',
    'explore.allCountries': 'Todos los Países',
    'explore.showMap': 'Mostrar Mapa',
    'explore.hideMap': 'Ocultar Mapa',
    'explore.mapTitle': 'Listas de Deseos en el Mundo',
    'explore.raised': 'recaudado',
    'explore.noResults': 'No se encontraron resultados',
    'explore.tryAgain': 'Intenta ajustar tus filtros',
    'about.title': 'Acerca de BitWish',
    'about.subtitle': 'Nuestra Misión',
    'contact.title': 'Contáctanos',
    'contact.subtitle': 'Ponte en Contacto',
    'pricing.title': 'Precios',
    'pricing.subtitle': 'Simple y Transparente',
  },
  pt: {
    'nav.explore': 'Explorar',
    'nav.dashboard': 'Painel',
    'nav.settings': 'Configurações',
    'nav.login': 'Entrar',
    'nav.signup': 'Cadastrar',
    'hero.title': 'Financie Sonhos com Bitcoin',
    'hero.subtitle': 'Crie listas de desejos, compartilhe sua história e receba apoio em Bitcoin do mundo todo',
    'hero.cta': 'Começar',
    'hero.explore': 'Explorar Listas',
    'footer.about': 'Sobre',
    'footer.contact': 'Contato',
    'footer.pricing': 'Preços',
    'footer.terms': 'Termos de Serviço',
    'footer.privacy': 'Política de Privacidade',
    'footer.tagline': 'Capacitando sonhos com Bitcoin',
    'explore.title': 'Explorar Listas de Desejos',
    'explore.subtitle': 'Descubra criadores incríveis e apoie seus sonhos ao redor do mundo',
    'explore.search': 'Pesquisar listas...',
    'explore.allCountries': 'Todos os Países',
    'explore.showMap': 'Mostrar Mapa',
    'explore.hideMap': 'Esconder Mapa',
    'explore.mapTitle': 'Listas de Desejos pelo Mundo',
    'explore.raised': 'arrecadado',
    'explore.noResults': 'Nenhum resultado encontrado',
    'explore.tryAgain': 'Tente ajustar seus filtros',
    'about.title': 'Sobre BitWish',
    'about.subtitle': 'Nossa Missão',
    'contact.title': 'Fale Conosco',
    'contact.subtitle': 'Entre em Contato',
    'pricing.title': 'Preços',
    'pricing.subtitle': 'Simples e Transparente',
  },
  fr: {
    'nav.explore': 'Explorer',
    'nav.dashboard': 'Tableau de Bord',
    'nav.settings': 'Paramètres',
    'nav.login': 'Connexion',
    'nav.signup': 'S\'inscrire',
    'hero.title': 'Financez des Rêves avec Bitcoin',
    'hero.subtitle': 'Créez des listes de souhaits, partagez votre histoire et recevez du soutien Bitcoin du monde entier',
    'hero.cta': 'Commencer',
    'hero.explore': 'Explorer les Listes',
    'footer.about': 'À Propos',
    'footer.contact': 'Contact',
    'footer.pricing': 'Tarifs',
    'footer.terms': 'Conditions d\'Utilisation',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.tagline': 'Donner vie aux rêves avec Bitcoin',
    'explore.title': 'Explorer les Listes de Souhaits',
    'explore.subtitle': 'Découvrez des créateurs incroyables et soutenez leurs rêves à travers le monde',
    'explore.search': 'Rechercher des listes...',
    'explore.allCountries': 'Tous les Pays',
    'explore.showMap': 'Afficher la Carte',
    'explore.hideMap': 'Masquer la Carte',
    'explore.mapTitle': 'Listes de Souhaits dans le Monde',
    'explore.raised': 'collecté',
    'explore.noResults': 'Aucun résultat trouvé',
    'explore.tryAgain': 'Essayez d\'ajuster vos filtres',
    'about.title': 'À Propos de BitWish',
    'about.subtitle': 'Notre Mission',
    'contact.title': 'Nous Contacter',
    'contact.subtitle': 'Prenez Contact',
    'pricing.title': 'Tarifs',
    'pricing.subtitle': 'Simple et Transparent',
  },
  de: {
    'nav.explore': 'Entdecken',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Einstellungen',
    'nav.login': 'Anmelden',
    'nav.signup': 'Registrieren',
    'hero.title': 'Finanziere Träume mit Bitcoin',
    'hero.subtitle': 'Erstelle Wunschlisten, teile deine Geschichte und erhalte Bitcoin-Unterstützung aus der ganzen Welt',
    'hero.cta': 'Loslegen',
    'hero.explore': 'Listen Entdecken',
    'footer.about': 'Über Uns',
    'footer.contact': 'Kontakt',
    'footer.pricing': 'Preise',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.privacy': 'Datenschutz',
    'footer.tagline': 'Träume verwirklichen mit Bitcoin',
    'explore.title': 'Wunschlisten Entdecken',
    'explore.subtitle': 'Entdecke erstaunliche Kreative und unterstütze ihre Träume weltweit',
    'explore.search': 'Listen durchsuchen...',
    'explore.allCountries': 'Alle Länder',
    'explore.showMap': 'Karte Anzeigen',
    'explore.hideMap': 'Karte Verbergen',
    'explore.mapTitle': 'Wunschlisten Weltweit',
    'explore.raised': 'gesammelt',
    'explore.noResults': 'Keine Ergebnisse gefunden',
    'explore.tryAgain': 'Versuche deine Filter anzupassen',
    'about.title': 'Über BitWish',
    'about.subtitle': 'Unsere Mission',
    'contact.title': 'Kontakt',
    'contact.subtitle': 'Melde Dich',
    'pricing.title': 'Preise',
    'pricing.subtitle': 'Einfach und Transparent',
  },
  ja: {
    'nav.explore': '探索',
    'nav.dashboard': 'ダッシュボード',
    'nav.settings': '設定',
    'nav.login': 'ログイン',
    'nav.signup': '新規登録',
    'hero.title': 'Bitcoinで夢を応援',
    'hero.subtitle': 'ウィッシュリストを作成し、あなたのストーリーを共有して、世界中からBitcoinサポートを受け取りましょう',
    'hero.cta': '始める',
    'hero.explore': 'リストを探す',
    'footer.about': '私たちについて',
    'footer.contact': 'お問い合わせ',
    'footer.pricing': '料金',
    'footer.terms': '利用規約',
    'footer.privacy': 'プライバシーポリシー',
    'footer.tagline': 'Bitcoinで夢を実現',
    'explore.title': 'ウィッシュリストを探す',
    'explore.subtitle': '素晴らしいクリエイターを発見し、世界中の夢を応援しよう',
    'explore.search': 'リストを検索...',
    'explore.allCountries': 'すべての国',
    'explore.showMap': '地図を表示',
    'explore.hideMap': '地図を非表示',
    'explore.mapTitle': '世界中のウィッシュリスト',
    'explore.raised': '達成',
    'explore.noResults': '結果が見つかりません',
    'explore.tryAgain': 'フィルターを調整してください',
    'about.title': 'BitWishについて',
    'about.subtitle': '私たちのミッション',
    'contact.title': 'お問い合わせ',
    'contact.subtitle': 'ご連絡ください',
    'pricing.title': '料金',
    'pricing.subtitle': 'シンプルで透明',
  },
  zh: {
    'nav.explore': '探索',
    'nav.dashboard': '仪表板',
    'nav.settings': '设置',
    'nav.login': '登录',
    'nav.signup': '注册',
    'hero.title': '用比特币资助梦想',
    'hero.subtitle': '创建心愿单，分享您的故事，并从世界各地获得比特币支持',
    'hero.cta': '开始使用',
    'hero.explore': '探索心愿单',
    'footer.about': '关于我们',
    'footer.contact': '联系我们',
    'footer.pricing': '定价',
    'footer.terms': '服务条款',
    'footer.privacy': '隐私政策',
    'footer.tagline': '用比特币实现梦想',
    'explore.title': '探索心愿单',
    'explore.subtitle': '发现了不起的创作者，支持他们在全世界的梦想',
    'explore.search': '搜索心愿单...',
    'explore.allCountries': '所有国家',
    'explore.showMap': '显示地图',
    'explore.hideMap': '隐藏地图',
    'explore.mapTitle': '世界各地的心愿单',
    'explore.raised': '已筹集',
    'explore.noResults': '未找到结果',
    'explore.tryAgain': '尝试调整您的筛选条件',
    'about.title': '关于 BitWish',
    'about.subtitle': '我们的使命',
    'contact.title': '联系我们',
    'contact.subtitle': '保持联系',
    'pricing.title': '定价',
    'pricing.subtitle': '简单透明',
  },
};

export const languageFlags: Record<Language, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  pt: '🇧🇷',
  fr: '🇫🇷',
  de: '🇩🇪',
  ja: '🇯🇵',
  zh: '🇨🇳',
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bitwish-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('bitwish-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
