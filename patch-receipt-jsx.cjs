const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const modalCode = `

      {/* Printable Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 no-print">
          <div className="bg-white border border-neutral-200 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50 sticky top-0 z-10 no-print">
              <h3 className="text-neutral-800 font-bold text-lg">Generate Receipt</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Print Receipt
                </button>
                <button 
                  onClick={() => setReceiptOrder(null)} 
                  className="text-neutral-500 hover:text-neutral-800 transition-colors bg-neutral-200 hover:bg-neutral-300 rounded p-2"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-10 overflow-y-auto flex-1 bg-white" id="printable-receipt">
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <img src="/logo.svg" alt="Tizzitech Logo" className="h-12 w-auto" />
                  </div>
                  <div className="text-neutral-600 font-medium text-sm">Premium Tech & Accessories</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-neutral-800 tracking-tight">RECEIPT / INVOICE</div>
                  <div className="text-sm text-neutral-500 mt-1 uppercase font-bold tracking-widest">Original Copy</div>
                </div>
              </div>

              <div className="flex justify-between mb-10">
                <div className="text-neutral-800 text-sm">
                  <div className="font-bold text-neutral-500 uppercase tracking-widest text-xs mb-1">Billed To</div>
                  <div className="font-bold text-lg">{receiptOrder.shipping.firstName} {receiptOrder.shipping.surname}</div>
                  <div className="text-neutral-600 mt-1">{receiptOrder.shipping.address}</div>
                  <div className="text-neutral-600">{receiptOrder.shipping.city}, {receiptOrder.shipping.stateLocation}</div>
                </div>
                <div className="text-right text-sm text-neutral-800">
                  <div className="mb-1"><span className="font-bold text-neutral-500 uppercase tracking-widest text-xs mr-2">Invoice No:</span> <span className="font-mono font-bold">INV-{receiptOrder.id.slice(2, 10).toUpperCase()}</span></div>
                  <div className="mb-1"><span className="font-bold text-neutral-500 uppercase tracking-widest text-xs mr-2">Date:</span> {new Date(receiptOrder.orderDate).toLocaleDateString()}</div>
                  <div><span className="font-bold text-neutral-500 uppercase tracking-widest text-xs mr-2">Status:</span> <span className="uppercase font-bold text-blue-600">{receiptOrder.status}</span></div>
                </div>
              </div>

              <table className="w-full text-left border-collapse mb-8 text-neutral-800">
                <thead>
                  <tr>
                    <th className="bg-neutral-100 p-3 font-bold uppercase tracking-widest text-xs border-b border-neutral-300 rounded-tl-lg">Item Description</th>
                    <th className="bg-neutral-100 p-3 font-bold uppercase tracking-widest text-xs border-b border-neutral-300 text-center">Qty</th>
                    <th className="bg-neutral-100 p-3 font-bold uppercase tracking-widest text-xs border-b border-neutral-300 text-right">Unit Price</th>
                    <th className="bg-neutral-100 p-3 font-bold uppercase tracking-widest text-xs border-b border-neutral-300 text-right rounded-tr-lg">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 border-b border-neutral-200 text-sm font-medium">{item.name}</td>
                      <td className="p-3 border-b border-neutral-200 text-sm text-center">{item.quantity}</td>
                      <td className="p-3 border-b border-neutral-200 text-sm font-mono text-right">₦{item.price.toLocaleString()}</td>
                      <td className="p-3 border-b border-neutral-200 text-sm font-mono font-bold text-right">₦{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-12">
                <div className="w-64 text-right">
                  <div className="flex justify-between items-center text-xl text-neutral-800 font-bold border-t-2 border-neutral-800 pt-4 mt-2">
                    <span className="uppercase tracking-widest text-sm text-neutral-500">Total Amount</span>
                    <span className="font-mono text-2xl">₦{receiptOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-neutral-500 text-xs border-t border-neutral-200 pt-8 mt-auto">
                <p className="font-bold text-neutral-700 text-sm mb-1">Thank you for shopping with Tizzitech!</p>
                <p>This is a computer-generated document. No signature is required.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(/    <\/div>\n  \);\n\}/, modalCode);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
