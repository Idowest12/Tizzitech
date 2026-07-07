const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  `<input
                          type="text"
                          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          placeholder="New brand..."
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            const valBrand = newBrand.trim(); if (valBrand && !brands.includes(valBrand)) {
      const newB = [...brands, valBrand];
      setBrands(newB);
      setNewBrand('');
      saveSettings(newB, null, null);
    }
                          }}
                          className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300"
                        >`,
  `<input
                          type="text"
                          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          placeholder="New brand..."
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const valBrand = newBrand.trim(); 
                              if (valBrand && !brands.includes(valBrand)) {
                                const newB = [...brands, valBrand];
                                setBrands(newB);
                                setNewBrand('');
                                saveSettings(newB, null, null);
                              } else if (brands.includes(valBrand)) {
                                setNewBrand('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const valBrand = newBrand.trim(); 
                            if (valBrand && !brands.includes(valBrand)) {
                              const newB = [...brands, valBrand];
                              setBrands(newB);
                              setNewBrand('');
                              saveSettings(newB, null, null);
                            } else if (brands.includes(valBrand)) {
                              setNewBrand('');
                            }
                          }}
                          className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300 cursor-pointer"
                        >`
);

code = code.replace(
  `<input
                          type="text"
                          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          placeholder="New condition..."
                          value={newCondition}
                          onChange={(e) => setNewCondition(e.target.value)}
                        />
                        <button 
                          onClick={() => {
                            const valCond = newCondition.trim(); if (valCond && !conditions.includes(valCond)) {
                              setConditions([...conditions, valCond]);
                              setNewCondition(''); saveSettings(null, [...conditions, valCond], null);
                            }
                          }}
                          className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300"
                        >`,
  `<input
                          type="text"
                          className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                          placeholder="New condition..."
                          value={newCondition}
                          onChange={(e) => setNewCondition(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const valCond = newCondition.trim(); 
                              if (valCond && !conditions.includes(valCond)) {
                                const newC = [...conditions, valCond];
                                setConditions(newC);
                                setNewCondition(''); 
                                saveSettings(null, newC, null);
                              } else if (conditions.includes(valCond)) {
                                setNewCondition('');
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const valCond = newCondition.trim(); 
                            if (valCond && !conditions.includes(valCond)) {
                              const newC = [...conditions, valCond];
                              setConditions(newC);
                              setNewCondition(''); 
                              saveSettings(null, newC, null);
                            } else if (conditions.includes(valCond)) {
                              setNewCondition('');
                            }
                          }}
                          className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300 cursor-pointer"
                        >`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
