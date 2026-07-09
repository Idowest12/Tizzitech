const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  /<label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Brand<\/label>\s*<select/g,
  `<div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Brand</label>
                            <button type="button" onClick={(e) => {
                              e.preventDefault();
                              const newB = window.prompt('Enter new brand name:');
                              if (newB && newB.trim()) {
                                const b = newB.trim();
                                if (!brands.includes(b)) {
                                  const updatedBrands = [...brands, b];
                                  setBrands(updatedBrands);
                                  saveSettings(updatedBrands, null, null);
                                }
                                setNewProductForm({...newProductForm, brand: b});
                              }
                            }} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
                          </div>
                          <select`
);

code = code.replace(
  /<label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Condition<\/label>\s*<select/g,
  `<div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest">Condition</label>
                            <button type="button" onClick={(e) => {
                              e.preventDefault();
                              const newC = window.prompt('Enter new condition:');
                              if (newC && newC.trim()) {
                                const c = newC.trim();
                                if (!conditions.includes(c)) {
                                  const updatedConds = [...conditions, c];
                                  setConditions(updatedConds);
                                  saveSettings(null, updatedConds, null);
                                }
                                setNewProductForm({...newProductForm, condition: c});
                              }
                            }} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
                          </div>
                          <select`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
