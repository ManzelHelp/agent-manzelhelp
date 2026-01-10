const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    profile: {
      personalInformation: "Personal Information",
      yourBasicProfileInformation: "Your basic profile information",
      edit: "Edit",
      profile: "Profile",
      verificationStatus: "Verification Status",
      email: "Email",
      verified: "Verified",
      verify: "Verify",
      identityVerification: "Identity Verification",
      uploadClearPhotos: "Upload clear photos of your ID (front and back) for verification",
      documentRequirements: "Document Requirements:",
      documentRequirementsList: {
        clearPhotos: "Clear, high-quality photos or PDFs",
        maxSize: "Max size: 5MB per document",
        formats: "Formats: JPEG, PNG, WebP, or PDF",
        readable: "All text must be clearly readable",
        reviewTime: "Documents will be reviewed within 24-48 hours"
      },
      documentsUploaded: "Documents Uploaded",
      bioExperience: "Bio & Experience",
      tellCustomersAbout: "Tell customers about your experience and skills",
      missing: "{count} missing",
      bio: "Bio",
      noBioAddedYet: "No bio added yet",
      experienceLevel: "Experience Level",
      notSpecified: "Not specified",
      serviceArea: "Service Area",
      serviceRadius: "50 km radius",
      availability: "Availability",
      setWorkingHours: "Set your working hours and availability",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
      notAvailable: "Not available",
      unavailable: "Unavailable",
      available: "Available",
      serviceLocations: "Service Locations",
      manageYourLocations: "Manage your locations",
      addLocation: "Add Location",
      default: "Default",
      home: "Home",
      paymentMethods: "Payment Methods",
      managePaymentMethods: "Manage your payment methods and billing information",
      addMethod: "Add Method",
      noPaymentMethods: "No payment methods",
      addPaymentMethodsDescription: "Add payment methods to receive payments for your services",
      addFirstPaymentMethod: "Add First Payment Method"
    }
  },
  fr: {
    profile: {
      personalInformation: "Informations Personnelles",
      yourBasicProfileInformation: "Vos informations de profil de base",
      edit: "Modifier",
      profile: "Profil",
      verificationStatus: "Statut de Vérification",
      email: "Email",
      verified: "Vérifié",
      verify: "Vérifier",
      identityVerification: "Vérification d'Identité",
      uploadClearPhotos: "Téléchargez des photos claires de votre pièce d'identité (recto et verso) pour vérification",
      documentRequirements: "Exigences des Documents :",
      documentRequirementsList: {
        clearPhotos: "Photos claires et de haute qualité ou PDF",
        maxSize: "Taille maximale : 5 Mo par document",
        formats: "Formats : JPEG, PNG, WebP ou PDF",
        readable: "Tout le texte doit être clairement lisible",
        reviewTime: "Les documents seront examinés dans les 24 à 48 heures"
      },
      documentsUploaded: "Documents Téléchargés",
      bioExperience: "Bio et Expérience",
      tellCustomersAbout: "Parlez aux clients de votre expérience et compétences",
      missing: "{count} manquant",
      bio: "Bio",
      noBioAddedYet: "Aucune bio ajoutée pour le moment",
      experienceLevel: "Niveau d'Expérience",
      notSpecified: "Non spécifié",
      serviceArea: "Zone de Service",
      serviceRadius: "Rayon de 50 km",
      availability: "Disponibilité",
      setWorkingHours: "Définissez vos heures de travail et disponibilité",
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
      notAvailable: "Non disponible",
      unavailable: "Indisponible",
      available: "Disponible",
      serviceLocations: "Emplacements de Service",
      manageYourLocations: "Gérez vos emplacements",
      addLocation: "Ajouter un Emplacement",
      default: "Par défaut",
      home: "Domicile",
      paymentMethods: "Méthodes de Paiement",
      managePaymentMethods: "Gérez vos méthodes de paiement et informations de facturation",
      addMethod: "Ajouter une Méthode",
      noPaymentMethods: "Aucune méthode de paiement",
      addPaymentMethodsDescription: "Ajoutez des méthodes de paiement pour recevoir les paiements de vos services",
      addFirstPaymentMethod: "Ajouter la Première Méthode de Paiement"
    }
  },
  ar: {
    profile: {
      personalInformation: "المعلومات الشخصية",
      yourBasicProfileInformation: "معلومات ملفك الشخصي الأساسية",
      edit: "تعديل",
      profile: "الملف الشخصي",
      verificationStatus: "حالة التحقق",
      email: "البريد الإلكتروني",
      verified: "تم التحقق",
      verify: "التحقق",
      identityVerification: "التحقق من الهوية",
      uploadClearPhotos: "قم بتحميل صور واضحة لهويتك (الوجه والظهر) للتحقق",
      documentRequirements: "متطلبات الوثائق:",
      documentRequirementsList: {
        clearPhotos: "صور أو ملفات PDF عالية الجودة وواضحة",
        maxSize: "الحد الأقصى للحجم: 5 ميجابايت لكل وثيقة",
        formats: "الصيغ: JPEG أو PNG أو WebP أو PDF",
        readable: "يجب أن يكون كل النص واضحًا وقابلًا للقراءة",
        reviewTime: "سيتم مراجعة الوثائق خلال 24-48 ساعة"
      },
      documentsUploaded: "تم تحميل الوثائق",
      bioExperience: "السيرة والخبرة",
      tellCustomersAbout: "أخبر العملاء عن خبرتك ومهاراتك",
      missing: "{count} مفقود",
      bio: "السيرة",
      noBioAddedYet: "لم تتم إضافة سيرة بعد",
      experienceLevel: "مستوى الخبرة",
      notSpecified: "غير محدد",
      serviceArea: "منطقة الخدمة",
      serviceRadius: "نطاق 50 كم",
      availability: "التوفر",
      setWorkingHours: "حدد ساعات عملك وتوفرك",
      monday: "الاثنين",
      tuesday: "الثلاثاء",
      wednesday: "الأربعاء",
      thursday: "الخميس",
      friday: "الجمعة",
      saturday: "السبت",
      sunday: "الأحد",
      notAvailable: "غير متاح",
      unavailable: "غير متاح",
      available: "متاح",
      serviceLocations: "مواقع الخدمة",
      manageYourLocations: "إدارة مواقعك",
      addLocation: "إضافة موقع",
      default: "افتراضي",
      home: "المنزل",
      paymentMethods: "طرق الدفع",
      managePaymentMethods: "إدارة طرق الدفع ومعلومات الفوترة",
      addMethod: "إضافة طريقة",
      noPaymentMethods: "لا توجد طرق دفع",
      addPaymentMethodsDescription: "أضف طرق الدفع لتلقي المدفوعات لخدماتك",
      addFirstPaymentMethod: "إضافة طريقة الدفع الأولى"
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
  
  if (!json.profile) {
    json.profile = {};
  }
  
  // Helper function to merge nested objects
  function mergeObjects(target, source) {
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (!target[key]) {
          target[key] = {};
        }
        mergeObjects(target[key], value);
      } else {
        if (!target[key]) {
          target[key] = value;
        }
      }
    }
  }
  
  mergeObjects(json.profile, localeTranslations.profile);

  // Write back to file with proper formatting
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`✓ Added profile translations to ${locale}.json`);
}

// Run for all locales
['en', 'fr', 'ar'].forEach(addTranslationsToFile);

console.log('\n✅ All profile translations added successfully!');
