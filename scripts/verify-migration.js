const fs = require('fs');
const path = require('path');

const locales = ['en', 'fr', 'de', 'ar'];
const namespaces = [
  'Metadata', 'common', 'Header', 'homepage', 'dashboard', 'profile', 'Footer',
  'taskerProfile', 'auth', 'search', 'serviceCard', 'notifications', 'postJob',
  'applications', 'myJobs', 'postService', 'taskerOffer', 'customerBookings',
  'bookingDetails', 'finance', 'chat', 'jobApplications', 'taskerBookings',
  'taskerBookingTabs', 'jobOffer', 'contact', 'admin', 'errors', 'toasts',
  'bookings', 'messages', 'reviews', 'jobDetails', 'services', 'settings',
  'findAHelper', 'becomeAHelper', 'help', 'privacyPolicy', 'termsOfService'
];

console.log('Verifying migration...\n');

let allGood = true;

locales.forEach(locale => {
  const localeDir = path.join(__dirname, '..', 'messages', locale);
  
  if (!fs.existsSync(localeDir)) {
    console.error(`❌ ${locale}: Directory does not exist`);
    allGood = false;
    return;
  }
  
  console.log(`Checking ${locale}...`);
  let localeGood = true;
  
  namespaces.forEach(namespace => {
    const filePath = path.join(localeDir, `${namespace}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`  ❌ ${namespace}.json - MISSING`);
      localeGood = false;
      allGood = false;
    } else {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        
        // Check if the file has the correct structure
        if (!data[namespace]) {
          console.error(`  ⚠ ${namespace}.json - Missing root key "${namespace}"`);
          localeGood = false;
        } else {
          // Check if it's not empty
          const keys = Object.keys(data[namespace]);
          if (keys.length === 0) {
            console.warn(`  ⚠ ${namespace}.json - Empty namespace`);
          }
        }
      } catch (e) {
        console.error(`  ❌ ${namespace}.json - Invalid JSON: ${e.message}`);
        localeGood = false;
        allGood = false;
      }
    }
  });
  
  if (localeGood) {
    console.log(`  ✓ ${locale}: All files present and valid\n`);
  } else {
    console.log(`  ❌ ${locale}: Some files missing or invalid\n`);
  }
});

if (allGood) {
  console.log('✅ Migration verification complete! All files are in place.');
} else {
  console.log('❌ Migration verification failed. Please fix the issues above.');
  process.exit(1);
}
