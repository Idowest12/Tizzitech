const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf-8');

// Replace the import with the user's config
code = code.replace(
  `import firebaseConfig from '../firebase-applet-config.json';`,
  `const firebaseConfig = {
  apiKey: "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw",
  authDomain: "tizzitech-ecommerce.firebaseapp.com",
  projectId: "tizzitech-ecommerce",
  storageBucket: "tizzitech-ecommerce.firebasestorage.app",
  messagingSenderId: "8769198058",
  appId: "1:8769198058:web:dc0b2d000ef13441134493",
  measurementId: "G-FKPEDWCBQ6"
};`
);

// Remove the AI studio specific database ID logic
code = code.replace(
  `export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);`,
  `export const db = getFirestore(app);`
);
code = code.replace(
  `export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);`,
  `export const db = getFirestore(app);`
);

fs.writeFileSync('src/firebase.ts', code);
