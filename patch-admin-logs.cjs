const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

code = code.replace(
  "const [visits, setVisits] = useState<any[]>([]);",
  "const [visits, setVisits] = useState<any[]>([]);\n  const [auditLogs, setAuditLogs] = useState<any[]>([]);"
);

const fetchReplacement = `
  const fetchData = async () => {
    setLoading(true);
    try {
      const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
        setProducts(snap.docs.map(d => d.data() as any));
      }, (err) => console.warn('Products read permission denied:', err.message));

      const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
        setOrders(snap.docs.map(d => d.data() as any));
      }, (err) => console.warn('Orders read permission denied:', err.message));
      
      const unsubAuditLogs = onSnapshot(collection(db, 'audit_logs'), (snap) => {
        const logs = snap.docs.map(d => d.data());
        logs.sort((a, b) => b.timestamp - a.timestamp);
        setAuditLogs(logs);
      }, (err) => console.warn('Audit logs read permission denied:', err.message));

      // Keep token fresh if needed
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        sessionStorage.setItem('tizzitech_admin_token', token);
      }
      
      return () => {
        unsubProducts();
        unsubOrders();
        unsubAuditLogs();
      };
    } catch (e: any) {
      console.error("Error loading admin data:", e.message || e);
    } finally {
      setLoading(false);
    }
  };
`;

code = code.replace(
  /  const fetchData = async \(\) => \{[\s\S]*?finally \{\n      setLoading\(false\);\n    \}\n  \};/,
  fetchReplacement.trim()
);

code = code.replace(
  /<AdminDashboard visits=\{visits\}/,
  "<AdminDashboard visits={visits} auditLogs={auditLogs}"
);

fs.writeFileSync('src/AdminApp.tsx', code);
