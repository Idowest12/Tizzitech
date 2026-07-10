const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const newRoute = `
// ADMIN: GET USERS
app.get('/api/admin/users', verifyAdminToken, async (req, res) => {
  const db = getFirebaseDb();
  if (!db) {
    return res.json({ success: true, users: [] }); // Fallback
  }
  
  try {
    const q = collection(db, 'users');
    const querySnapshot = await getDocs(q);
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      // Omit password hash before sending to client
      const data = doc.data();
      delete data.password;
      users.push({ id: doc.id, ...data });
    });
    return res.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});
`;

code = code.replace(/\/\/ 15\. ADMIN NEWSLETTER ROUTES/g, newRoute + '\n// 15. ADMIN NEWSLETTER ROUTES');

fs.writeFileSync('server.ts', code);
