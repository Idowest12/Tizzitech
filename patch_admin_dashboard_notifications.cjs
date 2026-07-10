const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Add imports
code = code.replace(
  /import { Package, Plus, Search, ShieldAlert, KeyRound , Edit2, Trash2, LayoutDashboard, ShoppingCart, Tags, Mail, TrendingUp, Users, CheckCircle, AlertCircle, XCircle, BarChart3, FileText, Map, Star, Sliders, MapPin, DollarSign, Eye } from 'lucide-react';/,
  "import { Bell, Package, Plus, Search, ShieldAlert, KeyRound , Edit2, Trash2, LayoutDashboard, ShoppingCart, Tags, Mail, TrendingUp, Users, CheckCircle, AlertCircle, XCircle, BarChart3, FileText, Map, Star, Sliders, MapPin, DollarSign, Eye } from 'lucide-react';"
);

// Add hooks
const hookTarget = `  const [activeTab, setActiveTab] = useState<TabType>('dashboard');`;
const hookReplacement = `  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [previousOrderCount, setPreviousOrderCount] = useState<number | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<string | null>(null);

  React.useEffect(() => {
    if (previousOrderCount !== null && orders.length > previousOrderCount) {
      setNewOrderNotification(\`New order received! Total orders: \$\{orders.length\}\`);
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
          
          setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
            gain2.gain.setValueAtTime(0.1, ctx.currentTime);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.3);
          }, 150);
        }
      } catch(e) {}
      
      const timer = setTimeout(() => setNewOrderNotification(null), 10000);
      return () => clearTimeout(timer);
    }
    setPreviousOrderCount(orders.length);
  }, [orders.length]);`;

code = code.replace(hookTarget, hookReplacement);

// Render the notification toast
const renderTarget = `  return (
    <div className="flex h-screen bg-black text-neutral-300 font-sans absolute inset-0 z-50 overflow-hidden">`;

const renderReplacement = `  return (
    <>
      {newOrderNotification && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-3 bg-blue-500 text-white px-5 py-3 rounded-lg shadow-xl shadow-blue-500/20 border border-blue-400">
          <Bell className="w-5 h-5 animate-pulse" />
          <div className="font-bold text-sm">
            {newOrderNotification}
          </div>
          <button onClick={() => setNewOrderNotification(null)} className="ml-2 hover:bg-blue-600 p-1 rounded-md transition-colors">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex h-screen bg-black text-neutral-300 font-sans absolute inset-0 z-50 overflow-hidden">`;

code = code.replace(renderTarget, renderReplacement);

// Fix the trailing wrapper since we added a fragment
const endTarget = `    </div>
  );
}`;
const endReplacement = `      </div>
    </>
  );
}`;
code = code.replace(endTarget, endReplacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
