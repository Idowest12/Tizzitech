const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

code = code.replace(
  `import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';`,
  `import { collection, getDocs, doc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';`
);

code = code.replace(
  /const fetchData = async \(\) => \{[\s\S]*?const handleLogin = async/g,
  `const fetchData = async () => {
    setLoading(true);
    try {
      const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
        setProducts(snap.docs.map(d => d.data() as any));
      }, (err) => handleFirestoreError(err, OperationType.GET, 'products'));

      const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        setOrders(snap.docs.map(d => d.data() as any));
      }, (err) => handleFirestoreError(err, OperationType.GET, 'orders'));

      // Keep token fresh if needed
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        sessionStorage.setItem('tizzitech_admin_token', token);
      }
      
      return () => {
        unsubProducts();
        unsubOrders();
      };
    } catch (e: any) {
      console.error("Error loading admin data:", e.message || e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async`
);

code = code.replace(
  `useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);`,
  `useEffect(() => {
    let cleanup: any;
    if (isAuthenticated) {
      fetchData().then(c => cleanup = c);
    }
    return () => {
      if (cleanup && typeof cleanup === 'function') cleanup();
    };
  }, [isAuthenticated]);`
);

fs.writeFileSync('src/AdminApp.tsx', code);
console.log('Realtime Admin patched');
