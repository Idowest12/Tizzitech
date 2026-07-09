const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "{selectedOrderDetails.items.map((item, idx) => (",
  "{selectedOrderDetails.items.map((item, idx) => { const productRef = products.find(p => p.id === item.id) || item; return ("
);

code = code.replace(
  "alt={item.name}",
  "alt={productRef.name || 'Product'}"
);
code = code.replace(
  "src={item.imageUrl}",
  "src={productRef.imageUrl}"
);
code = code.replace(
  "{item.imageUrl ?",
  "{productRef.imageUrl ?"
);
code = code.replace(
  ">{item.name}</p>",
  ">{productRef.name || 'Unknown Product'}</p>"
);

code = code.replace(
  /₦\{\(item\.price \* item\.quantity\)\.toLocaleString\(\)\}<\/p>\n                        <\/div>\n                      \)\)}/g,
  "₦{(item.price * item.quantity).toLocaleString()}</p>\n                        </div>\n                      );})}"
);


fs.writeFileSync('src/components/AdminDashboard.tsx', code);
