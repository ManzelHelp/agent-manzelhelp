// Base category interface with multilingual support
export interface Category {
  id: number;
  parent_id: number | null; // null for parent categories
  name_en: string;
  name_de: string;
  name_fr: string;
  name_ar: string;
  description_en: string;
  description_de: string;
  description_fr: string;
  description_ar: string;
}

// Type for category names in different locales
export type CategoryName = Pick<
  Category,
  "name_en" | "name_de" | "name_fr" | "name_ar"
>;

// Type for category descriptions in different locales
export type CategoryDescription = Pick<
  Category,
  "description_en" | "description_de" | "description_fr" | "description_ar"
>;

export const categories: Category[] = [
  // Parent Categories
  {
    id: 1,
    parent_id: null,
    name_en: "House Cleaning",
    name_de: "Hausreinigung",
    name_fr: "Nettoyage de maison",
    name_ar: "تنظيف المنزل",
    description_en: "Professional cleaning services for your home",
    description_de: "Professionelle Reinigungsdienste für Ihr Zuhause",
    description_fr: "Services de nettoyage professionnel pour votre maison",
    description_ar: "خدمات تنظيف مهنية لمنزلك",
  },
  {
    id: 2,
    parent_id: null,
    name_en: "Handyman Services",
    name_de: "Handwerkerdienste",
    name_fr: "Services de bricolage",
    name_ar: "خدمات السباكة والكهرباء",
    description_en: "Skilled professionals for all your home repairs",
    description_de: "Qualifizierte Fachkräfte für alle Ihre Hausreparaturen",
    description_fr: "Professionnels qualifiés pour toutes vos réparations",
    description_ar: "محترفون مهرة لجميع إصلاحات منزلك",
  },
  {
    id: 3,
    parent_id: null,
    name_en: "Gardening",
    name_de: "Gartenarbeit",
    name_fr: "Jardinage",
    name_ar: "البستنة",
    description_en: "Beautiful gardens and landscaping services",
    description_de: "Schöne Gärten und Landschaftsgestaltungsdienste",
    description_fr: "Services de jardinage et d'aménagement paysager",
    description_ar: "خدمات البستنة وتنسيق الحدائق",
  },
  {
    id: 4,
    parent_id: null,
    name_en: "Pet Care",
    name_de: "Tierpflege",
    name_fr: "Soins pour animaux",
    name_ar: "رعاية الحيوانات الأليفة",
    description_en: "Loving care for your beloved pets",
    description_de: "Liebevolle Pflege für Ihre geliebten Haustiere",
    description_fr: "Soins attentionnés pour vos animaux de compagnie",
    description_ar: "رعاية محبة لحيواناتك الأليفة",
  },
  {
    id: 5,
    parent_id: null,
    name_en: "Tutoring",
    name_de: "Nachhilfe",
    name_fr: "Cours particuliers",
    name_ar: "الدروس الخصوصية",
    description_en: "Expert educational support and tutoring",
    description_de: "Experte Bildungsunterstützung und Nachhilfe",
    description_fr: "Soutien éducatif et cours particuliers d'experts",
    description_ar: "دعم تعليمي ودروس خصوصية من خبراء",
  },
  {
    id: 6,
    parent_id: null,
    name_en: "Moving & Packing",
    name_de: "Umzug & Verpackung",
    name_fr: "Déménagement",
    name_ar: "النقل والتعبئة",
    description_en: "Reliable moving and relocation services",
    description_de: "Zuverlässige Umzugs- und Umsiedlungsdienste",
    description_fr: "Services de déménagement et de relocalisation fiables",
    description_ar: "خدمات نقل وانتقال موثوقة",
  },
  {
    id: 7,
    parent_id: null,
    name_en: "Car Services",
    name_de: "Autodienste",
    name_fr: "Services automobiles",
    name_ar: "خدمات السيارات",
    description_en: "Professional automotive services",
    description_de: "Professionelle Automobildienste",
    description_fr: "Services automobiles professionnels",
    description_ar: "خدمات سيارات مهنية",
  },
  {
    id: 8,
    parent_id: null,
    name_en: "Event Planning",
    name_de: "Eventplanung",
    name_fr: "Organisation d'événements",
    name_ar: "تخطيط الفعاليات",
    description_en: "Make your events unforgettable",
    description_de: "Machen Sie Ihre Veranstaltungen unvergesslich",
    description_fr: "Rendez vos événements inoubliables",
    description_ar: "اجعل فعالياتك لا تُنسى",
  },

  // Subcategories for House Cleaning (parent_id: 1)
  {
    id: 101,
    parent_id: 1,
    name_en: "House Cleaning",
    name_de: "Hausreinigung",
    name_fr: "Nettoyage de maison",
    name_ar: "تنظيف المنزل",
    description_en: "Complete home cleaning service",
    description_de: "Kompletter Hausreinigungsdienst",
    description_fr: "Service de nettoyage complet à domicile",
    description_ar: "خدمة تنظيف منزلية شاملة",
  },
  {
    id: 102,
    parent_id: 1,
    name_en: "Office Cleaning",
    name_de: "Büroreinigung",
    name_fr: "Nettoyage de bureau",
    name_ar: "تنظيف المكتب",
    description_en: "Professional office maintenance",
    description_de: "Professionelle Bürowartung",
    description_fr: "Entretien professionnel de bureau",
    description_ar: "صيانة مكتبية مهنية",
  },
  {
    id: 103,
    parent_id: 1,
    name_en: "Deep Cleaning",
    name_de: "Grundreinigung",
    name_fr: "Grand ménage",
    name_ar: "تنظيف عميق",
    description_en: "Thorough deep cleaning service",
    description_de: "Gründlicher Tiefenreinigungsdienst",
    description_fr: "Service de grand ménage approfondi",
    description_ar: "خدمة تنظيف عميق شامل",
  },
  {
    id: 104,
    parent_id: 1,
    name_en: "Window Cleaning",
    name_de: "Fensterreinigung",
    name_fr: "Nettoyage de vitres",
    name_ar: "تنظيف النوافذ",
    description_en: "Crystal clear window cleaning",
    description_de: "Kristallklare Fensterreinigung",
    description_fr: "Nettoyage de vitres cristallin",
    description_ar: "تنظيف نوافذ صافٍ كالبلور",
  },
  {
    id: 105,
    parent_id: 1,
    name_en: "Carpet Cleaning",
    name_de: "Teppichreinigung",
    name_fr: "Nettoyage de tapis",
    name_ar: "تنظيف السجاد",
    description_en: "Professional carpet care",
    description_de: "Professionelle Teppichpflege",
    description_fr: "Entretien professionnel de tapis",
    description_ar: "رعاية مهنية للسجاد",
  },
  {
    id: 106,
    parent_id: 1,
    name_en: "Post-Construction",
    name_de: "Nachbauarbeiten",
    name_fr: "Nettoyage post-travaux",
    name_ar: "تنظيف ما بعد البناء",
    description_en: "Clean up after renovations",
    description_de: "Aufräumen nach Renovierungen",
    description_fr: "Nettoyage après rénovations",
    description_ar: "تنظيف بعد التجديدات",
  },

  // Subcategories for Handyman Services (parent_id: 2)
  {
    id: 201,
    parent_id: 2,
    name_en: "Furniture Assembly",
    name_de: "Möbelmontage",
    name_fr: "Montage de meubles",
    name_ar: "تجميع الأثاث",
    description_en: "Professional furniture setup",
    description_de: "Professionelle Möbelmontage",
    description_fr: "Installation professionnelle de meubles",
    description_ar: "تركيب أثاث مهني",
  },
  {
    id: 202,
    parent_id: 2,
    name_en: "Painting",
    name_de: "Malen",
    name_fr: "Peinture",
    name_ar: "الطلاء",
    description_en: "Interior and exterior painting",
    description_de: "Innen- und Außenanstrich",
    description_fr: "Peinture intérieure et extérieure",
    description_ar: "طلاء داخلي وخارجي",
  },
  {
    id: 203,
    parent_id: 2,
    name_en: "Wall Mounting",
    name_de: "Wandmontage",
    name_fr: "Fixation murale",
    name_ar: "التثبيت على الحائط",
    description_en: "Secure mounting services",
    description_de: "Sichere Montagedienste",
    description_fr: "Services de fixation sécurisée",
    description_ar: "خدمات تثبيت آمنة",
  },
  {
    id: 204,
    parent_id: 2,
    name_en: "Door & Window Repair",
    name_de: "Tür- und Fensterreparatur",
    name_fr: "Réparation portes et fenêtres",
    name_ar: "إصلاح الأبواب والنوافذ",
    description_en: "Fix and maintain doors/windows",
    description_de: "Türen und Fenster reparieren und warten",
    description_fr: "Réparer et entretenir portes/fenêtres",
    description_ar: "إصلاح وصيانة الأبواب والنوافذ",
  },
  {
    id: 205,
    parent_id: 2,
    name_en: "Shelving Installation",
    name_de: "Regalinstallation",
    name_fr: "Installation d'étagères",
    name_ar: "تركيب الرفوف",
    description_en: "Custom shelf installation",
    description_de: "Maßgeschneiderte Regalinstallation",
    description_fr: "Installation d'étagères sur mesure",
    description_ar: "تركيب رفوف مخصصة",
  },
  {
    id: 206,
    parent_id: 2,
    name_en: "Minor Repairs",
    name_de: "Kleinreparaturen",
    name_fr: "Petites réparations",
    name_ar: "إصلاحات صغيرة",
    description_en: "Quick fix solutions",
    description_de: "Schnelle Reparaturlösungen",
    description_fr: "Solutions de réparation rapide",
    description_ar: "حلول إصلاح سريعة",
  },

  // Subcategories for Gardening (parent_id: 3)
  {
    id: 301,
    parent_id: 3,
    name_en: "Lawn Mowing",
    name_de: "Rasenmähen",
    name_fr: "Tonte de pelouse",
    name_ar: "قص العشب",
    description_en: "Regular lawn maintenance",
    description_de: "Regelmäßige Rasenpflege",
    description_fr: "Entretien régulier de pelouse",
    description_ar: "صيانة منتظمة للعشب",
  },
  {
    id: 302,
    parent_id: 3,
    name_en: "Garden Maintenance",
    name_de: "Gartenpflege",
    name_fr: "Entretien de jardin",
    name_ar: "صيانة الحديقة",
    description_en: "Complete garden care",
    description_de: "Komplette Gartenpflege",
    description_fr: "Soins complets de jardin",
    description_ar: "رعاية شاملة للحديقة",
  },
  {
    id: 303,
    parent_id: 3,
    name_en: "Tree Trimming",
    name_de: "Baumschnitt",
    name_fr: "Taille d'arbres",
    name_ar: "تقليم الأشجار",
    description_en: "Professional tree care",
    description_de: "Professionelle Baumpflege",
    description_fr: "Soins professionnels d'arbres",
    description_ar: "رعاية مهنية للأشجار",
  },
  {
    id: 304,
    parent_id: 3,
    name_en: "Planting",
    name_de: "Bepflanzung",
    name_fr: "Plantation",
    name_ar: "الزراعة",
    description_en: "New plant installation",
    description_de: "Neue Pflanzeninstallation",
    description_fr: "Installation de nouvelles plantes",
    description_ar: "تركيب نباتات جديدة",
  },
  {
    id: 305,
    parent_id: 3,
    name_en: "Weeding",
    name_de: "Unkrautentfernung",
    name_fr: "Désherbage",
    name_ar: "إزالة الأعشاب",
    description_en: "Garden weed control",
    description_de: "Gartenunkrautbekämpfung",
    description_fr: "Contrôle des mauvaises herbes",
    description_ar: "مكافحة الأعشاب الضارة",
  },
  {
    id: 306,
    parent_id: 3,
    name_en: "Irrigation Setup",
    name_de: "Bewässerungsanlage",
    name_fr: "Installation d'irrigation",
    name_ar: "تركيب الري",
    description_en: "Automatic watering systems",
    description_de: "Automatische Bewässerungssysteme",
    description_fr: "Systèmes d'arrosage automatique",
    description_ar: "أنظمة ري تلقائية",
  },

  // Subcategories for Pet Care (parent_id: 4)
  {
    id: 401,
    parent_id: 4,
    name_en: "Pet Walking",
    name_de: "Gassigehen",
    name_fr: "Promenade d'animaux",
    name_ar: "مشي الحيوانات",
    description_en: "Regular pet exercise",
    description_de: "Regelmäßige Tierbewegung",
    description_fr: "Exercice régulier pour animaux",
    description_ar: "تمرين منتظم للحيوانات",
  },
  {
    id: 402,
    parent_id: 4,
    name_en: "Pet Sitting",
    name_de: "Tierbetreuung",
    name_fr: "Garde d'animaux",
    name_ar: "رعاية الحيوانات",
    description_en: "Pet care while you're away",
    description_de: "Tierbetreuung während Ihrer Abwesenheit",
    description_fr: "Garde d'animaux en votre absence",
    description_ar: "رعاية الحيوانات أثناء غيابك",
  },
  {
    id: 403,
    parent_id: 4,
    name_en: "Pet Grooming",
    name_de: "Tierpflege",
    name_fr: "Toilettage d'animaux",
    name_ar: "تجميل الحيوانات",
    description_en: "Professional pet grooming",
    description_de: "Professionelle Tierpflege",
    description_fr: "Toilettage professionnel d'animaux",
    description_ar: "تجميل مهني للحيوانات",
  },
  {
    id: 404,
    parent_id: 4,
    name_en: "Pet Training",
    name_de: "Tierausbildung",
    name_fr: "Dressage d'animaux",
    name_ar: "تدريب الحيوانات",
    description_en: "Behavioral training",
    description_de: "Verhaltenstraining",
    description_fr: "Dressage comportemental",
    description_ar: "تدريب سلوكي",
  },

  // Subcategories for Tutoring (parent_id: 5)
  {
    id: 501,
    parent_id: 5,
    name_en: "Math Tutoring",
    name_de: "Mathematik-Nachhilfe",
    name_fr: "Cours de mathématiques",
    name_ar: "دروس الرياضيات",
    description_en: "Mathematics support",
    description_de: "Mathematikunterstützung",
    description_fr: "Soutien en mathématiques",
    description_ar: "دعم في الرياضيات",
  },
  {
    id: 502,
    parent_id: 5,
    name_en: "Language Tutoring",
    name_de: "Sprachunterricht",
    name_fr: "Cours de langues",
    name_ar: "دروس اللغات",
    description_en: "Language learning support",
    description_de: "Sprachlernunterstützung",
    description_fr: "Soutien à l'apprentissage des langues",
    description_ar: "دعم تعلم اللغات",
  },
  {
    id: 503,
    parent_id: 5,
    name_en: "Science Tutoring",
    name_de: "Naturwissenschaften-Nachhilfe",
    name_fr: "Cours de sciences",
    name_ar: "دروس العلوم",
    description_en: "Science subject help",
    description_de: "Hilfe in naturwissenschaftlichen Fächern",
    description_fr: "Aide en matières scientifiques",
    description_ar: "مساعدة في المواد العلمية",
  },
  {
    id: 504,
    parent_id: 5,
    name_en: "Computer Skills",
    name_de: "Computerkenntnisse",
    name_fr: "Compétences informatiques",
    name_ar: "مهارات الحاسوب",
    description_en: "Digital literacy training",
    description_de: "Digitale Kompetenzschulung",
    description_fr: "Formation à la culture numérique",
    description_ar: "تدريب على الثقافة الرقمية",
  },
  {
    id: 505,
    parent_id: 5,
    name_en: "Music Lessons",
    name_de: "Musikunterricht",
    name_fr: "Cours de musique",
    name_ar: "دروس الموسيقى",
    description_en: "Musical instrument lessons",
    description_de: "Musikinstrumentenunterricht",
    description_fr: "Cours d'instruments de musique",
    description_ar: "دروس الآلات الموسيقية",
  },

  // Subcategories for Moving & Packing (parent_id: 6)
  {
    id: 601,
    parent_id: 6,
    name_en: "Home Moving",
    name_de: "Wohnungsumzug",
    name_fr: "Déménagement domicile",
    name_ar: "نقل المنزل",
    description_en: "Complete home relocation",
    description_de: "Komplette Wohnungsumsiedlung",
    description_fr: "Relocalisation complète de domicile",
    description_ar: "انتقال منزلي كامل",
  },
  {
    id: 602,
    parent_id: 6,
    name_en: "Office Moving",
    name_de: "Büroumzug",
    name_fr: "Déménagement bureau",
    name_ar: "نقل المكتب",
    description_en: "Business relocation services",
    description_de: "Geschäftsumsiedlungsdienste",
    description_fr: "Services de relocalisation d'entreprise",
    description_ar: "خدمات نقل الأعمال",
  },
  {
    id: 603,
    parent_id: 6,
    name_en: "Packing Services",
    name_de: "Verpackungsdienste",
    name_fr: "Services d'emballage",
    name_ar: "خدمات التعبئة",
    description_en: "Professional packing help",
    description_de: "Professionelle Verpackungshilfe",
    description_fr: "Aide professionnelle à l'emballage",
    description_ar: "مساعدة مهنية في التعبئة",
  },
  {
    id: 604,
    parent_id: 6,
    name_en: "Furniture Moving",
    name_de: "Möbeltransport",
    name_fr: "Transport de meubles",
    name_ar: "نقل الأثاث",
    description_en: "Furniture transport service",
    description_de: "Möbeltransportdienst",
    description_fr: "Service de transport de meubles",
    description_ar: "خدمة نقل الأثاث",
  },
  {
    id: 605,
    parent_id: 6,
    name_en: "Storage Services",
    name_de: "Lagerdienste",
    name_fr: "Services de stockage",
    name_ar: "خدمات التخزين",
    description_en: "Secure storage solutions",
    description_de: "Sichere Lagerlösungen",
    description_fr: "Solutions de stockage sécurisées",
    description_ar: "حلول تخزين آمنة",
  },

  // Subcategories for Car Services (parent_id: 7)
  {
    id: 701,
    parent_id: 7,
    name_en: "Car Washing",
    name_de: "Autowäsche",
    name_fr: "Lavage de voiture",
    name_ar: "غسيل السيارات",
    description_en: "Professional car cleaning",
    description_de: "Professionelle Autoreinigung",
    description_fr: "Nettoyage professionnel de voiture",
    description_ar: "تنظيف سيارات مهني",
  },
  {
    id: 702,
    parent_id: 7,
    name_en: "Oil Change",
    name_de: "Ölwechsel",
    name_fr: "Changement d'huile",
    name_ar: "تغيير الزيت",
    description_en: "Engine oil replacement",
    description_de: "Motorölwechsel",
    description_fr: "Remplacement d'huile moteur",
    description_ar: "استبدال زيت المحرك",
  },
  {
    id: 703,
    parent_id: 7,
    name_en: "Tire Change",
    name_de: "Reifenwechsel",
    name_fr: "Changement de pneus",
    name_ar: "تغيير الإطارات",
    description_en: "Tire replacement service",
    description_de: "Reifenwechseldienst",
    description_fr: "Service de remplacement de pneus",
    description_ar: "خدمة استبدال الإطارات",
  },
  {
    id: 704,
    parent_id: 7,
    name_en: "Battery Replacement",
    name_de: "Batteriewechsel",
    name_fr: "Remplacement de batterie",
    name_ar: "استبدال البطارية",
    description_en: "Car battery service",
    description_de: "Autobatteriedienst",
    description_fr: "Service de batterie automobile",
    description_ar: "خدمة بطارية السيارة",
  },
  {
    id: 705,
    parent_id: 7,
    name_en: "Car Detailing",
    name_de: "Autodetailierung",
    name_fr: "Détailage automobile",
    name_ar: "تفصيل السيارات",
    description_en: "Comprehensive car care",
    description_de: "Umfassende Autopflege",
    description_fr: "Soins complets de voiture",
    description_ar: "رعاية شاملة للسيارات",
  },

  // Subcategories for Event Planning (parent_id: 8)
  {
    id: 801,
    parent_id: 8,
    name_en: "Event Planning",
    name_de: "Eventplanung",
    name_fr: "Planification d'événements",
    name_ar: "تخطيط الفعاليات",
    description_en: "Complete event coordination",
    description_de: "Komplette Veranstaltungskoordination",
    description_fr: "Coordination complète d'événements",
    description_ar: "تنسيق فعاليات كامل",
  },
  {
    id: 802,
    parent_id: 8,
    name_en: "Catering Services",
    name_de: "Catering-Dienste",
    name_fr: "Services de restauration",
    name_ar: "خدمات التموين",
    description_en: "Professional catering",
    description_de: "Professionelles Catering",
    description_fr: "Restauration professionnelle",
    description_ar: "تموين مهني",
  },
  {
    id: 803,
    parent_id: 8,
    name_en: "Photography",
    name_de: "Fotografie",
    name_fr: "Photographie",
    name_ar: "التصوير",
    description_en: "Event photography services",
    description_de: "Veranstaltungsfotografiedienste",
    description_fr: "Services de photographie d'événements",
    description_ar: "خدمات تصوير الفعاليات",
  },
  {
    id: 804,
    parent_id: 8,
    name_en: "DJ Services",
    name_de: "DJ-Dienste",
    name_fr: "Services DJ",
    name_ar: "خدمات الدي جي",
    description_en: "Professional DJ entertainment",
    description_de: "Professionelle DJ-Unterhaltung",
    description_fr: "Divertissement DJ professionnel",
    description_ar: "ترفيه دي جي مهني",
  },
  {
    id: 805,
    parent_id: 8,
    name_en: "Decoration",
    name_de: "Dekoration",
    name_fr: "Décoration",
    name_ar: "الديكور",
    description_en: "Event decoration services",
    description_de: "Veranstaltungsdekoration",
    description_fr: "Services de décoration d'événements",
    description_ar: "خدمات ديكور الفعاليات",
  },
];

// Helper functions for working with categories

/**
 * Get all parent categories (categories with parent_id: null)
 */
export function getParentCategories(): Category[] {
  return categories.filter((category) => category.parent_id === null);
}

/**
 * Get all subcategories for a specific parent category
 */
export function getSubcategories(parentId: number): Category[] {
  return categories.filter((category) => category.parent_id === parentId);
}

/**
 * Get a category by its ID
 */
export function getCategoryById(id: number): Category | undefined {
  return categories.find((category) => category.id === id);
}

/**
 * Get category name by locale
 */
export function getCategoryName(
  category: CategoryName,
  locale: string
): string {
  const localeKey = `name_${locale}` as keyof CategoryName;
  return category[localeKey] || category.name_en;
}

/**
 * Get category description by locale
 */
export function getCategoryDescription(
  category: CategoryDescription,
  locale: string
): string {
  const localeKey = `description_${locale}` as keyof CategoryDescription;
  return category[localeKey] || category.description_en;
}

/**
 * Get all categories (both parent and subcategories) for search/filtering
 * This replaces the old getSearchCategories function
 */
export function getAllCategoriesForSearch(): Pick<
  Category,
  "id" | "name_en" | "name_de" | "name_fr" | "name_ar"
>[] {
  return categories.map((category) => ({
    id: category.id,
    name_en: category.name_en,
    name_de: category.name_de,
    name_fr: category.name_fr,
    name_ar: category.name_ar,
  }));
}

/**
 * Get only parent categories for search/filtering
 */
export function getParentCategoriesForSearch(): Pick<
  Category,
  "id" | "name_en" | "name_de" | "name_fr" | "name_ar"
>[] {
  return getParentCategories().map((category) => ({
    id: category.id,
    name_en: category.name_en,
    name_de: category.name_de,
    name_fr: category.name_fr,
    name_ar: category.name_ar,
  }));
}

/**
 * Get only subcategories for search/filtering
 */
export function getSubcategoriesForSearch(): Pick<
  Category,
  "id" | "name_en" | "name_de" | "name_fr" | "name_ar"
>[] {
  return categories
    .filter((category) => category.parent_id !== null)
    .map((category) => ({
      id: category.id,
      name_en: category.name_en,
      name_de: category.name_de,
      name_fr: category.name_fr,
      name_ar: category.name_ar,
    }));
}

/**
 * Get category hierarchy (parent with its subcategories)
 */
export function getCategoryHierarchy(parentId: number): {
  parent: Category;
  subcategories: Category[];
} | null {
  const parent = getCategoryById(parentId);
  if (!parent || parent.parent_id !== null) {
    return null;
  }

  return {
    parent,
    subcategories: getSubcategories(parentId),
  };
}

/**
 * Get all category hierarchies
 */
export function getAllCategoryHierarchies(): Array<{
  parent: Category;
  subcategories: Category[];
}> {
  return getParentCategories().map((parent) => ({
    parent,
    subcategories: getSubcategories(parent.id),
  }));
}

/**
 * Check if a category is a parent category
 */
export function isParentCategory(categoryId: number): boolean {
  const category = getCategoryById(categoryId);
  return category ? category.parent_id === null : false;
}

/**
 * Check if a category is a subcategory
 */
export function isSubcategory(categoryId: number): boolean {
  const category = getCategoryById(categoryId);
  return category ? category.parent_id !== null : false;
}

/**
 * Get the parent category of a subcategory
 */
export function getParentCategory(subcategoryId: number): Category | null {
  const subcategory = getCategoryById(subcategoryId);
  if (!subcategory || subcategory.parent_id === null) {
    return null;
  }

  return getCategoryById(subcategory.parent_id) || null;
}
