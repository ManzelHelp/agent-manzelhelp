import { ServiceCategory } from "@/types/supabase";

// Unified service category interface
export interface UnifiedServiceCategory {
  id: number;
  name_en: string;
  name_fr: string;
  name_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
  icon: string;
  color: string;
  is_popular: boolean; // For homepage display
  is_searchable: boolean; // For search page filtering
  services: {
    id: number;
    name_en: string;
    name_fr: string;
    name_ar: string;
    description_en: string;
    description_fr: string;
    description_ar: string;
  }[];
}

// Single source of truth for all service categories
export const serviceCategories: UnifiedServiceCategory[] = [
  {
    id: 1,
    name_en: "House Cleaning",
    name_fr: "Nettoyage de maison",
    name_ar: "تنظيف المنزل",
    description_en: "Professional cleaning services for your home",
    description_fr: "Services de nettoyage professionnel pour votre maison",
    description_ar: "خدمات تنظيف مهنية لمنزلك",
    icon: "🧹",
    color: "from-blue-500 to-blue-600",
    is_popular: true,
    is_searchable: true,
    services: [
      {
        id: 1,
        name_en: "House Cleaning",
        name_fr: "Nettoyage de maison",
        name_ar: "تنظيف المنزل",
        description_en: "Complete home cleaning service",
        description_fr: "Service de nettoyage complet à domicile",
        description_ar: "خدمة تنظيف منزلية شاملة",
      },
      {
        id: 2,
        name_en: "Office Cleaning",
        name_fr: "Nettoyage de bureau",
        name_ar: "تنظيف المكتب",
        description_en: "Professional office maintenance",
        description_fr: "Entretien professionnel de bureau",
        description_ar: "صيانة مكتبية مهنية",
      },
      {
        id: 3,
        name_en: "Deep Cleaning",
        name_fr: "Grand ménage",
        name_ar: "تنظيف عميق",
        description_en: "Thorough deep cleaning service",
        description_fr: "Service de grand ménage approfondi",
        description_ar: "خدمة تنظيف عميق شامل",
      },
      {
        id: 4,
        name_en: "Window Cleaning",
        name_fr: "Nettoyage de vitres",
        name_ar: "تنظيف النوافذ",
        description_en: "Crystal clear window cleaning",
        description_fr: "Nettoyage de vitres cristallin",
        description_ar: "تنظيف نوافذ صافٍ كالبلور",
      },
      {
        id: 5,
        name_en: "Carpet Cleaning",
        name_fr: "Nettoyage de tapis",
        name_ar: "تنظيف السجاد",
        description_en: "Professional carpet care",
        description_fr: "Entretien professionnel de tapis",
        description_ar: "رعاية مهنية للسجاد",
      },
      {
        id: 6,
        name_en: "Post-Construction",
        name_fr: "Nettoyage post-travaux",
        name_ar: "تنظيف ما بعد البناء",
        description_en: "Clean up after renovations",
        description_fr: "Nettoyage après rénovations",
        description_ar: "تنظيف بعد التجديدات",
      },
    ],
  },
  {
    id: 2,
    name_en: "Handyman Services",
    name_fr: "Services de bricolage",
    name_ar: "خدمات السباكة والكهرباء",
    description_en: "Skilled professionals for all your home repairs",
    description_fr: "Professionnels qualifiés pour toutes vos réparations",
    description_ar: "محترفون مهرة لجميع إصلاحات منزلك",
    icon: "🔧",
    color: "from-orange-500 to-orange-600",
    is_popular: true,
    is_searchable: true,
    services: [
      {
        id: 7,
        name_en: "Furniture Assembly",
        name_fr: "Montage de meubles",
        name_ar: "تجميع الأثاث",
        description_en: "Professional furniture setup",
        description_fr: "Installation professionnelle de meubles",
        description_ar: "تركيب أثاث مهني",
      },
      {
        id: 8,
        name_en: "Painting",
        name_fr: "Peinture",
        name_ar: "الطلاء",
        description_en: "Interior and exterior painting",
        description_fr: "Peinture intérieure et extérieure",
        description_ar: "طلاء داخلي وخارجي",
      },
      {
        id: 9,
        name_en: "Wall Mounting",
        name_fr: "Fixation murale",
        name_ar: "التثبيت على الحائط",
        description_en: "Secure mounting services",
        description_fr: "Services de fixation sécurisée",
        description_ar: "خدمات تثبيت آمنة",
      },
      {
        id: 10,
        name_en: "Door & Window Repair",
        name_fr: "Réparation portes et fenêtres",
        name_ar: "إصلاح الأبواب والنوافذ",
        description_en: "Fix and maintain doors/windows",
        description_fr: "Réparer et entretenir portes/fenêtres",
        description_ar: "إصلاح وصيانة الأبواب والنوافذ",
      },
      {
        id: 11,
        name_en: "Shelving Installation",
        name_fr: "Installation d'étagères",
        name_ar: "تركيب الرفوف",
        description_en: "Custom shelf installation",
        description_fr: "Installation d'étagères sur mesure",
        description_ar: "تركيب رفوف مخصصة",
      },
      {
        id: 12,
        name_en: "Minor Repairs",
        name_fr: "Petites réparations",
        name_ar: "إصلاحات صغيرة",
        description_en: "Quick fix solutions",
        description_fr: "Solutions de réparation rapide",
        description_ar: "حلول إصلاح سريعة",
      },
    ],
  },
  {
    id: 3,
    name_en: "Gardening",
    name_fr: "Jardinage",
    name_ar: "البستنة",
    description_en: "Beautiful gardens and landscaping services",
    description_fr: "Services de jardinage et d'aménagement paysager",
    description_ar: "خدمات البستنة وتنسيق الحدائق",
    icon: "🌱",
    color: "from-green-500 to-green-600",
    is_popular: true,
    is_searchable: false,
    services: [
      {
        id: 25,
        name_en: "Lawn Mowing",
        name_fr: "Tonte de pelouse",
        name_ar: "قص العشب",
        description_en: "Regular lawn maintenance",
        description_fr: "Entretien régulier de pelouse",
        description_ar: "صيانة منتظمة للعشب",
      },
      {
        id: 26,
        name_en: "Garden Maintenance",
        name_fr: "Entretien de jardin",
        name_ar: "صيانة الحديقة",
        description_en: "Complete garden care",
        description_fr: "Soins complets de jardin",
        description_ar: "رعاية شاملة للحديقة",
      },
      {
        id: 27,
        name_en: "Tree Trimming",
        name_fr: "Taille d'arbres",
        name_ar: "تقليم الأشجار",
        description_en: "Professional tree care",
        description_fr: "Soins professionnels d'arbres",
        description_ar: "رعاية مهنية للأشجار",
      },
      {
        id: 28,
        name_en: "Planting",
        name_fr: "Plantation",
        name_ar: "الزراعة",
        description_en: "New plant installation",
        description_fr: "Installation de nouvelles plantes",
        description_ar: "تركيب نباتات جديدة",
      },
      {
        id: 29,
        name_en: "Weeding",
        name_fr: "Désherbage",
        name_ar: "إزالة الأعشاب",
        description_en: "Garden weed control",
        description_fr: "Contrôle des mauvaises herbes",
        description_ar: "مكافحة الأعشاب الضارة",
      },
      {
        id: 30,
        name_en: "Irrigation Setup",
        name_fr: "Installation d'irrigation",
        name_ar: "تركيب الري",
        description_en: "Automatic watering systems",
        description_fr: "Systèmes d'arrosage automatique",
        description_ar: "أنظمة ري تلقائية",
      },
    ],
  },
  {
    id: 4,
    name_en: "Pet Care",
    name_fr: "Soins pour animaux",
    name_ar: "رعاية الحيوانات الأليفة",
    description_en: "Loving care for your beloved pets",
    description_fr: "Soins attentionnés pour vos animaux de compagnie",
    description_ar: "رعاية محبة لحيواناتك الأليفة",
    icon: "🐾",
    color: "from-amber-500 to-amber-600",
    is_popular: true,
    is_searchable: true,
    services: [
      {
        id: 61,
        name_en: "Pet Walking",
        name_fr: "Promenade d'animaux",
        name_ar: "مشي الحيوانات",
        description_en: "Regular pet exercise",
        description_fr: "Exercice régulier pour animaux",
        description_ar: "تمرين منتظم للحيوانات",
      },
      {
        id: 62,
        name_en: "Pet Sitting",
        name_fr: "Garde d'animaux",
        name_ar: "رعاية الحيوانات",
        description_en: "Pet care while you're away",
        description_fr: "Garde d'animaux en votre absence",
        description_ar: "رعاية الحيوانات أثناء غيابك",
      },
      {
        id: 63,
        name_en: "Pet Grooming",
        name_fr: "Toilettage d'animaux",
        name_ar: "تجميل الحيوانات",
        description_en: "Professional pet grooming",
        description_fr: "Toilettage professionnel d'animaux",
        description_ar: "تجميل مهني للحيوانات",
      },
      {
        id: 64,
        name_en: "Pet Training",
        name_fr: "Dressage d'animaux",
        name_ar: "تدريب الحيوانات",
        description_en: "Behavioral training",
        description_fr: "Dressage comportemental",
        description_ar: "تدريب سلوكي",
      },
    ],
  },
  {
    id: 5,
    name_en: "Tutoring",
    name_fr: "Cours particuliers",
    name_ar: "الدروس الخصوصية",
    description_en: "Expert educational support and tutoring",
    description_fr: "Soutien éducatif et cours particuliers d'experts",
    description_ar: "دعم تعليمي ودروس خصوصية من خبراء",
    icon: "📚",
    color: "from-indigo-500 to-indigo-600",
    is_popular: true,
    is_searchable: false,
    services: [
      {
        id: 46,
        name_en: "Math Tutoring",
        name_fr: "Cours de mathématiques",
        name_ar: "دروس الرياضيات",
        description_en: "Mathematics support",
        description_fr: "Soutien en mathématiques",
        description_ar: "دعم في الرياضيات",
      },
      {
        id: 47,
        name_en: "Language Tutoring",
        name_fr: "Cours de langues",
        name_ar: "دروس اللغات",
        description_en: "Language learning support",
        description_fr: "Soutien à l'apprentissage des langues",
        description_ar: "دعم تعلم اللغات",
      },
      {
        id: 48,
        name_en: "Science Tutoring",
        name_fr: "Cours de sciences",
        name_ar: "دروس العلوم",
        description_en: "Science subject help",
        description_fr: "Aide en matières scientifiques",
        description_ar: "مساعدة في المواد العلمية",
      },
      {
        id: 49,
        name_en: "Computer Skills",
        name_fr: "Compétences informatiques",
        name_ar: "مهارات الحاسوب",
        description_en: "Digital literacy training",
        description_fr: "Formation à la culture numérique",
        description_ar: "تدريب على الثقافة الرقمية",
      },
      {
        id: 50,
        name_en: "Music Lessons",
        name_fr: "Cours de musique",
        name_ar: "دروس الموسيقى",
        description_en: "Musical instrument lessons",
        description_fr: "Cours d'instruments de musique",
        description_ar: "دروس الآلات الموسيقية",
      },
    ],
  },
  {
    id: 6,
    name_en: "Moving & Packing",
    name_fr: "Déménagement",
    name_ar: "النقل والتعبئة",
    description_en: "Reliable moving and relocation services",
    description_fr: "Services de déménagement et de relocalisation fiables",
    description_ar: "خدمات نقل وانتقال موثوقة",
    icon: "📦",
    color: "from-purple-500 to-purple-600",
    is_popular: true,
    is_searchable: false,
    services: [
      {
        id: 31,
        name_en: "Home Moving",
        name_fr: "Déménagement domicile",
        name_ar: "نقل المنزل",
        description_en: "Complete home relocation",
        description_fr: "Relocalisation complète de domicile",
        description_ar: "انتقال منزلي كامل",
      },
      {
        id: 32,
        name_en: "Office Moving",
        name_fr: "Déménagement bureau",
        name_ar: "نقل المكتب",
        description_en: "Business relocation services",
        description_fr: "Services de relocalisation d'entreprise",
        description_ar: "خدمات نقل الأعمال",
      },
      {
        id: 33,
        name_en: "Packing Services",
        name_fr: "Services d'emballage",
        name_ar: "خدمات التعبئة",
        description_en: "Professional packing help",
        description_fr: "Aide professionnelle à l'emballage",
        description_ar: "مساعدة مهنية في التعبئة",
      },
      {
        id: 34,
        name_en: "Furniture Moving",
        name_fr: "Transport de meubles",
        name_ar: "نقل الأثاث",
        description_en: "Furniture transport service",
        description_fr: "Service de transport de meubles",
        description_ar: "خدمة نقل الأثاث",
      },
      {
        id: 35,
        name_en: "Storage Services",
        name_fr: "Services de stockage",
        name_ar: "خدمات التخزين",
        description_en: "Secure storage solutions",
        description_fr: "Solutions de stockage sécurisées",
        description_ar: "حلول تخزين آمنة",
      },
    ],
  },
  {
    id: 7,
    name_en: "Car Washing",
    name_fr: "Lavage de voiture",
    name_ar: "غسيل السيارات",
    description_en: "Professional automotive services",
    description_fr: "Services automobiles professionnels",
    description_ar: "خدمات سيارات مهنية",
    icon: "🚗",
    color: "from-blue-600 to-blue-700",
    is_popular: true,
    is_searchable: false,
    services: [
      {
        id: 56,
        name_en: "Car Washing",
        name_fr: "Lavage de voiture",
        name_ar: "غسيل السيارات",
        description_en: "Professional car cleaning",
        description_fr: "Nettoyage professionnel de voiture",
        description_ar: "تنظيف سيارات مهني",
      },
      {
        id: 57,
        name_en: "Oil Change",
        name_fr: "Changement d'huile",
        name_ar: "تغيير الزيت",
        description_en: "Engine oil replacement",
        description_fr: "Remplacement d'huile moteur",
        description_ar: "استبدال زيت المحرك",
      },
      {
        id: 58,
        name_en: "Tire Change",
        name_fr: "Changement de pneus",
        name_ar: "تغيير الإطارات",
        description_en: "Tire replacement service",
        description_fr: "Service de remplacement de pneus",
        description_ar: "خدمة استبدال الإطارات",
      },
      {
        id: 59,
        name_en: "Battery Replacement",
        name_fr: "Remplacement de batterie",
        name_ar: "استبدال البطارية",
        description_en: "Car battery service",
        description_fr: "Service de batterie automobile",
        description_ar: "خدمة بطارية السيارة",
      },
      {
        id: 60,
        name_en: "Car Detailing",
        name_fr: "Détailage automobile",
        name_ar: "تفصيل السيارات",
        description_en: "Comprehensive car care",
        description_fr: "Soins complets de voiture",
        description_ar: "رعاية شاملة للسيارات",
      },
    ],
  },
  {
    id: 8,
    name_en: "Event Planning",
    name_fr: "Organisation d'événements",
    name_ar: "تخطيط الفعاليات",
    description_en: "Make your events unforgettable",
    description_fr: "Rendez vos événements inoubliables",
    description_ar: "اجعل فعالياتك لا تُنسى",
    icon: "🎉",
    color: "from-rose-500 to-rose-600",
    is_popular: true,
    is_searchable: true,
    services: [
      {
        id: 65,
        name_en: "Event Planning",
        name_fr: "Planification d'événements",
        name_ar: "تخطيط الفعاليات",
        description_en: "Complete event coordination",
        description_fr: "Coordination complète d'événements",
        description_ar: "تنسيق فعاليات كامل",
      },
      {
        id: 66,
        name_en: "Catering Services",
        name_fr: "Services de restauration",
        name_ar: "خدمات التموين",
        description_en: "Professional catering",
        description_fr: "Restauration professionnelle",
        description_ar: "تموين مهني",
      },
      {
        id: 67,
        name_en: "Photography",
        name_fr: "Photographie",
        name_ar: "التصوير",
        description_en: "Event photography services",
        description_fr: "Services de photographie d'événements",
        description_ar: "خدمات تصوير الفعاليات",
      },
      {
        id: 68,
        name_en: "DJ Services",
        name_fr: "Services DJ",
        name_ar: "خدمات الدي جي",
        description_en: "Professional DJ entertainment",
        description_fr: "Divertissement DJ professionnel",
        description_ar: "ترفيه دي جي مهني",
      },
      {
        id: 69,
        name_en: "Decoration",
        name_fr: "Décoration",
        name_ar: "الديكور",
        description_en: "Event decoration services",
        description_fr: "Services de décoration d'événements",
        description_ar: "خدمات ديكور الفعاليات",
      },
    ],
  },
  // Additional categories for search page
  {
    id: 9,
    name_en: "Office Cleaning",
    name_fr: "Nettoyage de bureau",
    name_ar: "تنظيف المكتب",
    description_en: "Professional office maintenance",
    description_fr: "Entretien professionnel de bureau",
    description_ar: "صيانة مكتبية مهنية",
    icon: "🏢",
    color: "from-blue-500 to-blue-600",
    is_popular: false,
    is_searchable: true,
    services: [],
  },
  {
    id: 10,
    name_en: "Deep Cleaning",
    name_fr: "Grand ménage",
    name_ar: "تنظيف عميق",
    description_en: "Thorough deep cleaning service",
    description_fr: "Service de grand ménage approfondi",
    description_ar: "خدمة تنظيف عميق شامل",
    icon: "🧽",
    color: "from-blue-500 to-blue-600",
    is_popular: false,
    is_searchable: true,
    services: [],
  },
  {
    id: 11,
    name_en: "Furniture Assembly",
    name_fr: "Montage de meubles",
    name_ar: "تجميع الأثاث",
    description_en: "Professional furniture setup",
    description_fr: "Installation professionnelle de meubles",
    description_ar: "تركيب أثاث مهني",
    icon: "🔧",
    color: "from-orange-500 to-orange-600",
    is_popular: false,
    is_searchable: true,
    services: [],
  },
  {
    id: 12,
    name_en: "Event Organization",
    name_fr: "Organisation d'événements",
    name_ar: "تنظيم الفعاليات",
    description_en: "Complete event coordination",
    description_fr: "Coordination complète d'événements",
    description_ar: "تنسيق فعاليات كامل",
    icon: "🎉",
    color: "from-rose-500 to-rose-600",
    is_popular: false,
    is_searchable: true,
    services: [],
  },
];

// Helper functions to transform the unified data for different use cases

// Get categories for homepage (popular ones)
export function getPopularCategories(): Pick<
  ServiceCategory,
  "id" | "name_en" | "name_fr" | "name_ar"
>[] {
  return serviceCategories
    .filter((cat) => cat.is_popular)
    .map((cat) => ({
      id: cat.id,
      name_en: cat.name_en,
      name_fr: cat.name_fr,
      name_ar: cat.name_ar,
    }));
}

// Get categories for search page (searchable ones)
export function getSearchCategories(): Pick<
  ServiceCategory,
  "id" | "name_en" | "name_fr" | "name_ar"
>[] {
  return serviceCategories
    .filter((cat) => cat.is_searchable)
    .map((cat) => ({
      id: cat.id,
      name_en: cat.name_en,
      name_fr: cat.name_fr,
      name_ar: cat.name_ar,
    }));
}

// Get detailed categories for services page
export function getDetailedCategories() {
  return serviceCategories.map((cat) => ({
    id: cat.id,
    name: cat.name_en, // Use English as default for services page
    icon: cat.icon,
    description: cat.description_en,
    color: cat.color,
    services: cat.services.map((service) => ({
      id: service.id,
      name: service.name_en,
      description: service.description_en,
    })),
  }));
}

// Get category name by locale
export function getCategoryName(
  category: Pick<ServiceCategory, "name_en" | "name_fr" | "name_ar">,
  locale: string
): string {
  return (
    category[`name_${locale}` as keyof typeof category] || category.name_en
  );
}

// Get service name by locale
export function getServiceName(
  service: {
    name_en: string;
    name_fr: string;
    name_ar: string;
  },
  locale: string
): string {
  return service[`name_${locale}` as keyof typeof service] || service.name_en;
}

// Get all unique categories (for backward compatibility)
export function getAllCategories(): Pick<
  ServiceCategory,
  "id" | "name_en" | "name_fr" | "name_ar"
>[] {
  return serviceCategories.map((cat) => ({
    id: cat.id,
    name_en: cat.name_en,
    name_fr: cat.name_fr,
    name_ar: cat.name_ar,
  }));
}
