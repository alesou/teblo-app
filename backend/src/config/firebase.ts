import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if we have the service account credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccount) {
      // Parse the service account JSON
      const serviceAccountJson = JSON.parse(serviceAccount);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      
      console.log('Firebase Admin initialized with service account');
    } else {
      console.error('FIREBASE_SERVICE_ACCOUNT environment variable not found');
      // Initialize without credentials (for development)
      admin.initializeApp();
      console.log('Firebase Admin initialized without credentials (development mode)');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Initialize without credentials as fallback
    admin.initializeApp();
    console.log('Firebase Admin initialized with fallback configuration');
  }
}

export default admin; 