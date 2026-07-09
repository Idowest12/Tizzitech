const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

const autoLogoutEffect = `
  // Auto-logout after 10 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, 10 * 60 * 1000); // 10 minutes
    };

    resetTimer();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();
    
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated]);

  const handleUpdateStock = async (id: string, newStock: number) => {
`;

code = code.replace("  const handleUpdateStock = async (id: string, newStock: number) => {", autoLogoutEffect);

fs.writeFileSync('src/AdminApp.tsx', code);
