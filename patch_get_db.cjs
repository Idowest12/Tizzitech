const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newDbLogic = `
function getFirebaseDb() {
  if (firebaseDb) return firebaseDb;
  try {
    let configRaw = '{}';
    // Try to require it directly so bundlers might pick it up, or fall back to fs
    try {
      configRaw = JSON.stringify(require('./firebase-applet-config.json'));
    } catch(e) {
      const possiblePaths = [
        path.join(process.cwd(), 'firebase-applet-config.json'),
        path.join(__dirname, 'firebase-applet-config.json'),
        path.join(__dirname, '..', 'firebase-applet-config.json'),
        path.join(process.cwd(), 'api', 'firebase-applet-config.json'),
        path.join(process.cwd(), '..', 'firebase-applet-config.json')
      ];
      let configPath = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          configPath = p;
          break;
        }
      }
      if (!configPath) {
        console.log('Firebase config tracking missing.');
        return null;
      }
      configRaw = fs.readFileSync(configPath, 'utf-8');
    }
    
    const config = JSON.parse(configRaw);
    const app = initializeApp(config);
    firebaseDb = getFirestore(app, config.firestoreDatabaseId || 'default');
    console.log('Successfully initialized connection to Firebase.');
    return firebaseDb;
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
    return null;
  }
}
`;

code = code.replace(/function getFirebaseDb\(\) \{[\s\S]*?return firebaseDb;\n  \} catch \(err\) \{\n    console\.error\('Failed to initialize Firebase:', err\);\n    return null;\n  \}\n\}/, newDbLogic.trim());

fs.writeFileSync('server.ts', code);
