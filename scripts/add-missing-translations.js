const fs = require('fs');
const path = require('path');

// All missing translations organized by namespace
const translations = {
  en: {
    search: {
      findYourPerfectJob: "Find Your Perfect Job",
      connectWithCustomers: "Connect with customers looking for your expertise",
      searchPlaceholder: "Search for jobs, tasks or opportunities...",
      search: "Search",
      filters: "Filters",
      categories: "Categories",
      allJobs: "All Jobs",
      resultsFound: "{count} results found",
      sortBy: "Sort by:",
      newestFirst: "Newest First"
    },
    bookings: {
      manageBookings: "Manage your bookings, applications, and hired services",
      noBookingsFound: "No bookings found",
      noBookingsYet: "You have no bookings yet."
    },
    finance: {
      financeDashboard: "Finance Dashboard",
      trackEarnings: "Track your earnings, performance, and transaction history",
      chartPeriod: "Chart Period",
      day: "Day",
      week: "Week",
      month: "Month"
    },
    messages: {
      messages: "Messages",
      manageCommunications: "Manage your communications with clients",
      inbox: "Inbox",
      unreadMessages: "{count} unread messages",
      all: "all",
      unread: "unread",
      read: "read"
    },
    reviews: {
      reviewsAndFeedback: "Reviews & Feedback",
      monitorPerformance: "Monitor your performance and build trust with clients through meaningful interactions",
      averageRating: "Average Rating",
      basedOnReviews: "Based on {count} reviews",
      fiveStarReviews: "5-Star Reviews",
      excellenceRate: "Excellence rate",
      responseRate: "Response rate",
      responseRateLabel: "Response Rate",
      clientEngagement: "Client engagement",
      totalReviews: "Total Reviews",
      totalReviewsCount: "{count} Total reviews",
      allTimeFeedback: "All time feedback",
      clientReviews: "Client Reviews",
      reviewCount: "{count} review",
      all: "All",
      fourStarPlus: "4★+",
      threeStarMinus: "3★-",
      needsReply: "Needs Reply",
      yourResponse: "Your Response",
      repliedOn: "Replied on {date}",
      quality: "Quality",
      communication: "Communication",
      timeliness: "Timeliness"
    },
    jobDetails: {
      jobDetails: "Job Details",
      manageJobPost: "Manage your job post",
      jobStatus: "Job Status",
      completed: "Completed",
      postedOn: "Posted on {date}",
      description: "Description",
      preferredDate: "Preferred Date",
      preferredTime: "Preferred Time",
      location: "Location",
      customerInformation: "Customer Information",
      jobPostedByCustomer: "Job posted by this customer",
      jobProgress: "Job Progress",
      currentStatus: "Current Status",
      startedAt: "Started At",
      completedAt: "Completed At"
    },
    services: {
      serviceManagementHub: "Service Management Hub",
      buildAndManage: "Build and manage your professional service portfolio. Create compelling offers, track performance, and grow your business with our powerful tools.",
      performanceTracking: "Performance Tracking",
      customerInsights: "Customer Insights",
      qualityControl: "Quality Control",
      totalServices: "Total Services",
      active: "Active",
      bookings: "Bookings",
      verified: "Verified",
      yourServicePortfolio: "Your Service Portfolio",
      manageAndShowcase: "Manage and showcase your professional services",
      addNewService: "Add New Service",
      areaNotSpecified: "Area not specified",
      edit: "Edit",
      available: "Available",
      unverified: "unverified",
      deleteService: "Delete Service",
      serviceDetails: "Service Details",
      manageServiceOffer: "Manage your service offer"
    },
    settings: {
      settings: "Settings",
      manageAccountPreferences: "Manage your account preferences and security",
      securityAndPrivacy: "Security & Privacy",
      manageAccountSecurity: "Manage your account security and privacy settings",
      notifications: "Notifications",
      chooseNotifications: "Choose how you'd like to be notified",
      signInMethods: "Sign-in Methods",
      email: "Email",
      change: "Change",
      password: "Password",
      useStrongPassword: "Use a strong password to protect your account",
      changePassword: "Change Password",
      dangerZone: "Danger Zone",
      deactivateAccount: "Deactivate Account",
      deactivateDescription: "This will permanently disable your account",
      emailNotifications: "Email Notifications",
      receiveUpdatesViaEmail: "Receive updates and alerts via email",
      pushNotifications: "Push Notifications",
      getInstantNotifications: "Get instant notifications on your device",
      smsNotifications: "SMS Notifications",
      receiveUrgentAlerts: "Receive urgent alerts via text message",
      marketingEmails: "Marketing Emails",
      receivePromotionalOffers: "Receive promotional offers and updates",
      activityAlerts: "Activity Alerts",
      getNotifiedAboutActivities: "Get notified about important activities"
    }
  },
  fr: {
    search: {
      findYourPerfectJob: "Trouvez Votre Emploi Idéal",
      connectWithCustomers: "Connectez-vous avec des clients à la recherche de votre expertise",
      searchPlaceholder: "Rechercher des emplois, tâches ou opportunités...",
      search: "Rechercher",
      filters: "Filtres",
      categories: "Catégories",
      allJobs: "Tous les emplois",
      resultsFound: "{count} résultats trouvés",
      sortBy: "Trier par:",
      newestFirst: "Plus récent d'abord"
    },
    bookings: {
      manageBookings: "Gérez vos réservations, candidatures et services embauchés",
      noBookingsFound: "Aucune réservation trouvée",
      noBookingsYet: "Vous n'avez pas encore de réservations."
    },
    finance: {
      financeDashboard: "Tableau de Bord Financier",
      trackEarnings: "Suivez vos revenus, performances et historique des transactions",
      chartPeriod: "Période du Graphique",
      day: "Jour",
      week: "Semaine",
      month: "Mois"
    },
    messages: {
      messages: "Messages",
      manageCommunications: "Gérez vos communications avec les clients",
      inbox: "Boîte de réception",
      unreadMessages: "{count} messages non lus",
      all: "tous",
      unread: "non lu",
      read: "lu"
    },
    reviews: {
      reviewsAndFeedback: "Avis et Commentaires",
      monitorPerformance: "Surveillez vos performances et établissez la confiance avec les clients grâce à des interactions significatives",
      averageRating: "Note Moyenne",
      basedOnReviews: "Basé sur {count} avis",
      fiveStarReviews: "Avis 5 Étoiles",
      excellenceRate: "Taux d'excellence",
      responseRate: "Taux de réponse",
      responseRateLabel: "Taux de Réponse",
      clientEngagement: "Engagement client",
      totalReviews: "Total des Avis",
      totalReviewsCount: "{count} Total des avis",
      allTimeFeedback: "Retours de tous les temps",
      clientReviews: "Avis Clients",
      reviewCount: "{count} avis",
      all: "Tous",
      fourStarPlus: "4★+",
      threeStarMinus: "3★-",
      needsReply: "Nécessite une Réponse",
      yourResponse: "Votre Réponse",
      repliedOn: "Répondu le {date}",
      quality: "Qualité",
      communication: "Communication",
      timeliness: "Ponctualité"
    },
    jobDetails: {
      jobDetails: "Détails de l'Emploi",
      manageJobPost: "Gérez votre offre d'emploi",
      jobStatus: "Statut de l'Emploi",
      completed: "Terminé",
      postedOn: "Publié le {date}",
      description: "Description",
      preferredDate: "Date Prévue",
      preferredTime: "Heure Prévue",
      location: "Localisation",
      customerInformation: "Informations Client",
      jobPostedByCustomer: "Emploi publié par ce client",
      jobProgress: "Progression de l'Emploi",
      currentStatus: "Statut Actuel",
      startedAt: "Démarré Le",
      completedAt: "Terminé Le"
    },
    services: {
      serviceManagementHub: "Centre de Gestion des Services",
      buildAndManage: "Créez et gérez votre portefeuille de services professionnels. Créez des offres convaincantes, suivez les performances et développez votre entreprise avec nos outils puissants.",
      performanceTracking: "Suivi des Performances",
      customerInsights: "Insights Clients",
      qualityControl: "Contrôle Qualité",
      totalServices: "Total des Services",
      active: "Actif",
      bookings: "Réservations",
      verified: "Vérifié",
      yourServicePortfolio: "Votre Portefeuille de Services",
      manageAndShowcase: "Gérez et présentez vos services professionnels",
      addNewService: "Ajouter un Nouveau Service",
      areaNotSpecified: "Zone non spécifiée",
      edit: "Modifier",
      available: "Disponible",
      unverified: "non vérifié",
      deleteService: "Supprimer le Service",
      serviceDetails: "Détails du Service",
      manageServiceOffer: "Gérez votre offre de service"
    },
    settings: {
      settings: "Paramètres",
      manageAccountPreferences: "Gérez les préférences et la sécurité de votre compte",
      securityAndPrivacy: "Sécurité et Confidentialité",
      manageAccountSecurity: "Gérez la sécurité et les paramètres de confidentialité de votre compte",
      notifications: "Notifications",
      chooseNotifications: "Choisissez comment vous souhaitez être notifié",
      signInMethods: "Méthodes de Connexion",
      email: "Email",
      change: "Modifier",
      password: "Mot de passe",
      useStrongPassword: "Utilisez un mot de passe fort pour protéger votre compte",
      changePassword: "Modifier le Mot de passe",
      dangerZone: "Zone de Danger",
      deactivateAccount: "Désactiver le Compte",
      deactivateDescription: "Cela désactivera définitivement votre compte",
      emailNotifications: "Notifications par Email",
      receiveUpdatesViaEmail: "Recevez des mises à jour et des alertes par email",
      pushNotifications: "Notifications Push",
      getInstantNotifications: "Recevez des notifications instantanées sur votre appareil",
      smsNotifications: "Notifications SMS",
      receiveUrgentAlerts: "Recevez des alertes urgentes par SMS",
      marketingEmails: "Emails Marketing",
      receivePromotionalOffers: "Recevez des offres promotionnelles et des mises à jour",
      activityAlerts: "Alertes d'Activité",
      getNotifiedAboutActivities: "Soyez notifié des activités importantes"
    }
  },
  ar: {
    search: {
      findYourPerfectJob: "ابحث عن وظيفتك المثالية",
      connectWithCustomers: "تواصل مع العملاء الباحثين عن خبرتك",
      searchPlaceholder: "ابحث عن الوظائف أو المهام أو الفرص...",
      search: "بحث",
      filters: "الفلاتر",
      categories: "الفئات",
      allJobs: "جميع الوظائف",
      resultsFound: "تم العثور على {count} نتيجة",
      sortBy: "ترتيب حسب:",
      newestFirst: "الأحدث أولاً"
    },
    bookings: {
      manageBookings: "إدارة حجوزاتك وطلباتك والخدمات المستأجرة",
      noBookingsFound: "لم يتم العثور على حجوزات",
      noBookingsYet: "ليس لديك حجوزات بعد."
    },
    finance: {
      financeDashboard: "لوحة التحكم المالية",
      trackEarnings: "تتبع أرباحك وأدائك وسجل المعاملات",
      chartPeriod: "فترة الرسم البياني",
      day: "يوم",
      week: "أسبوع",
      month: "شهر"
    },
    messages: {
      messages: "الرسائل",
      manageCommunications: "إدارة اتصالاتك مع العملاء",
      inbox: "صندوق الوارد",
      unreadMessages: "{count} رسائل غير مقروءة",
      all: "الكل",
      unread: "غير مقروء",
      read: "مقروء"
    },
    reviews: {
      reviewsAndFeedback: "المراجعات والتعليقات",
      monitorPerformance: "راقب أداءك وابنِ الثقة مع العملاء من خلال التفاعلات الهادفة",
      averageRating: "التقييم المتوسط",
      basedOnReviews: "بناءً على {count} مراجعة",
      fiveStarReviews: "مراجعات 5 نجوم",
      excellenceRate: "معدل التميز",
      responseRate: "معدل الاستجابة",
      responseRateLabel: "معدل الاستجابة",
      clientEngagement: "مشاركة العملاء",
      totalReviews: "إجمالي المراجعات",
      totalReviewsCount: "{count} إجمالي المراجعات",
      allTimeFeedback: "التعليقات على الإطلاق",
      clientReviews: "مراجعات العملاء",
      reviewCount: "{count} مراجعة",
      all: "الكل",
      fourStarPlus: "4★+",
      threeStarMinus: "3★-",
      needsReply: "يحتاج إلى رد",
      yourResponse: "ردك",
      repliedOn: "تم الرد في {date}",
      quality: "الجودة",
      communication: "التواصل",
      timeliness: "الالتزام بالمواعيد"
    },
    jobDetails: {
      jobDetails: "تفاصيل الوظيفة",
      manageJobPost: "إدارة إعلان الوظيفة",
      jobStatus: "حالة الوظيفة",
      completed: "مكتمل",
      postedOn: "تم النشر في {date}",
      description: "الوصف",
      preferredDate: "التاريخ المفضل",
      preferredTime: "الوقت المفضل",
      location: "الموقع",
      customerInformation: "معلومات العميل",
      jobPostedByCustomer: "الوظيفة المنشورة من قبل هذا العميل",
      jobProgress: "تقدم الوظيفة",
      currentStatus: "الحالة الحالية",
      startedAt: "بدء في",
      completedAt: "اكتمل في"
    },
    services: {
      serviceManagementHub: "مركز إدارة الخدمات",
      buildAndManage: "أنشئ وأدر محفظة خدماتك المهنية. أنشئ عروضًا مقنعة، وتتبع الأداء، ونمِّ عملك باستخدام أدواتنا القوية.",
      performanceTracking: "تتبع الأداء",
      customerInsights: "رؤى العملاء",
      qualityControl: "مراقبة الجودة",
      totalServices: "إجمالي الخدمات",
      active: "نشط",
      bookings: "الحجوزات",
      verified: "متحقق",
      yourServicePortfolio: "محفظة خدماتك",
      manageAndShowcase: "إدارة وعرض خدماتك المهنية",
      addNewService: "إضافة خدمة جديدة",
      areaNotSpecified: "المنطقة غير محددة",
      edit: "تعديل",
      available: "متاح",
      unverified: "غير متحقق",
      deleteService: "حذف الخدمة",
      serviceDetails: "تفاصيل الخدمة",
      manageServiceOffer: "إدارة عرض الخدمة"
    },
    settings: {
      settings: "الإعدادات",
      manageAccountPreferences: "إدارة تفضيلات حسابك وأمانه",
      securityAndPrivacy: "الأمان والخصوصية",
      manageAccountSecurity: "إدارة أمان حسابك وإعدادات الخصوصية",
      notifications: "الإشعارات",
      chooseNotifications: "اختر كيف تريد أن يتم إشعارك",
      signInMethods: "طرق تسجيل الدخول",
      email: "البريد الإلكتروني",
      change: "تغيير",
      password: "كلمة المرور",
      useStrongPassword: "استخدم كلمة مرور قوية لحماية حسابك",
      changePassword: "تغيير كلمة المرور",
      dangerZone: "منطقة الخطر",
      deactivateAccount: "إلغاء تفعيل الحساب",
      deactivateDescription: "سيؤدي هذا إلى تعطيل حسابك بشكل دائم",
      emailNotifications: "الإشعارات عبر البريد الإلكتروني",
      receiveUpdatesViaEmail: "تلقي التحديثات والتنبيهات عبر البريد الإلكتروني",
      pushNotifications: "الإشعارات الفورية",
      getInstantNotifications: "الحصول على إشعارات فورية على جهازك",
      smsNotifications: "الإشعارات النصية",
      receiveUrgentAlerts: "تلقي تنبيهات عاجلة عبر الرسائل النصية",
      marketingEmails: "رسائل البريد الإلكتروني التسويقية",
      receivePromotionalOffers: "تلقي العروض الترويجية والتحديثات",
      activityAlerts: "تنبيهات النشاط",
      getNotifiedAboutActivities: "تلقي إشعارات حول الأنشطة المهمة"
    }
  }
};

function addTranslationsToFile(locale) {
  const filePath = path.join(__dirname, '..', 'messages', `${locale}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist`);
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(fileContent);

  // Add translations to the JSON structure
  const localeTranslations = translations[locale];
  
  for (const [namespace, keys] of Object.entries(localeTranslations)) {
    if (!json[namespace]) {
      json[namespace] = {};
    }
    
    for (const [key, value] of Object.entries(keys)) {
      if (!json[namespace][key]) {
        json[namespace][key] = value;
      }
    }
  }

  // Write back to file with proper formatting
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`✓ Added translations to ${locale}.json`);
}

// Run for all locales
['en', 'fr', 'ar'].forEach(addTranslationsToFile);

console.log('\n✅ All translations added successfully!');
