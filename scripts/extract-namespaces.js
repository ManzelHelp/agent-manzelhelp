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

console.log('Extracting namespaces...\n');

locales.forEach(locale => {
  try {
    const inputFile = path.join(__dirname, '..', 'messages', `${locale}.json`);
    const outputDir = path.join(__dirname, '..', 'messages', locale);
    
    // Read the full JSON file
    const fullData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    console.log(`Processing ${locale}...`);
    
    // Extract each namespace
    namespaces.forEach(namespace => {
      if (fullData[namespace]) {
        // Create the namespace object with the namespace as root key
        const namespaceData = { [namespace]: fullData[namespace] };
        const outputFile = path.join(outputDir, `${namespace}.json`);
        
        // Write with proper formatting
        fs.writeFileSync(
          outputFile,
          JSON.stringify(namespaceData, null, 2) + '\n',
          'utf8'
        );
        console.log(`  ✓ ${namespace}.json`);
      } else {
        console.log(`  ⚠ ${namespace}.json - NOT FOUND (will create empty)`);
        // Create empty namespace file
        const namespaceData = { [namespace]: {} };
        const outputFile = path.join(outputDir, `${namespace}.json`);
        fs.writeFileSync(
          outputFile,
          JSON.stringify(namespaceData, null, 2) + '\n',
          'utf8'
        );
      }
    });
    
    console.log(`✓ Completed ${locale}\n`);
  } catch (e) {
    console.error(`ERROR processing ${locale}: ${e.message}`);
  }
});

console.log('Extraction complete!');
