const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
db.collection('products').get().then(snapshot => {
  snapshot.forEach(doc => {
    if (doc.data().name.includes('HP')) {
      doc.ref.update({ stock: 100 }).then(() => console.log('Updated ' + doc.id));
    }
  });
}).catch(console.error);
