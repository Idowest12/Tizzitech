const { execSync } = require('child_process');
const fs = require('fs');

fs.writeFileSync('.firebaserc', JSON.stringify({ projects: { default: "tizzitech-ecommerce" } }));

try {
  console.log(execSync('npx firebase deploy --only firestore:rules --project tizzitech-ecommerce --token $FIREBASE_TOKEN').toString());
} catch (e) {
  console.log("Error:", e.stdout ? e.stdout.toString() : e.message);
  console.log("Error stderr:", e.stderr ? e.stderr.toString() : "");
}
