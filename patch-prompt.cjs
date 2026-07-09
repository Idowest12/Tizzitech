const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "const [showAddProduct, setShowAddProduct] = useState(false);",
  "const [showAddProduct, setShowAddProduct] = useState(false);\n  const [promptConfig, setPromptConfig] = useState<{title: string, onConfirm: (val: string) => void} | null>(null);\n  const [promptValue, setPromptValue] = useState('');"
);

code = code.replace(
  /const newB = window\.prompt\('Enter new brand name:'\);\s*if \(newB && newB\.trim\(\)\) {([\s\S]*?)}\s*}}/g,
  `setPromptValue('');
                              setPromptConfig({
                                title: 'Enter new brand name:',
                                onConfirm: (newB) => {
                                  if (newB && newB.trim()) {$1}
                                }
                              });
                            }}`
);

code = code.replace(
  /const newC = window\.prompt\('Enter new condition:'\);\s*if \(newC && newC\.trim\(\)\) {([\s\S]*?)}\s*}}/g,
  `setPromptValue('');
                              setPromptConfig({
                                title: 'Enter new condition:',
                                onConfirm: (newC) => {
                                  if (newC && newC.trim()) {$1}
                                }
                              });
                            }}`
);

const modalCode = `
      {/* Custom Prompt Modal */}
      {promptConfig && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">{promptConfig.title}</h3>
            <input
              type="text"
              autoFocus
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  promptConfig.onConfirm(promptValue);
                  setPromptConfig(null);
                }
              }}
              className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white mb-6 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setPromptConfig(null)} className="px-4 py-2 rounded text-sm font-bold text-neutral-400 hover:text-white">Cancel</button>
              <button onClick={() => { promptConfig.onConfirm(promptValue); setPromptConfig(null); }} className="px-4 py-2 rounded text-sm font-bold bg-blue-600 text-white hover:bg-blue-500">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(/    <\/div>\n  \);\n}/, modalCode);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
