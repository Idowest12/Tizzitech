const fs = require('fs');

function updateFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf-8');
  for (const { oldStr, newStr } of replacements) {
    // Escape string for regex if needed, or just replace all instances
    content = content.split(oldStr).join(newStr);
  }
  fs.writeFileSync(filePath, content);
}

// 1. Update App.tsx footer logo
updateFile('src/App.tsx', [
  {
    oldStr: 'src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=2662&auto=format&fit=crop"',
    newStr: 'src="/logo.svg"'
  },
  {
    oldStr: 'className="h-6 w-6 object-cover rounded-full"',
    newStr: 'className="h-8 w-auto object-contain"'
  }
]);

// 2. Update Header.tsx
updateFile('src/components/Header.tsx', [
  {
    oldStr: 'src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=2662&auto=format&fit=crop"',
    newStr: 'src="/logo.svg"'
  },
  {
    oldStr: 'className="h-8 w-8 object-cover rounded-full"',
    newStr: 'className="h-10 w-auto object-contain"'
  }
]);

// 3. Update AdminDashboard.tsx
updateFile('src/components/AdminDashboard.tsx', [
  {
    oldStr: 'src="https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=2662&auto=format&fit=crop"',
    newStr: 'src="/logo.svg"'
  },
  {
    oldStr: 'className="h-8 w-8 object-cover rounded-full"',
    newStr: 'className="h-10 w-auto object-contain"'
  }
]);

