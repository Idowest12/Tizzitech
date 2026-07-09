const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const oldHeader = `<div class="header">
              <div class="logo">Tizzitech</div>
              <div class="invoice-title">RECEIPT / INVOICE</div>
            </div>`;

const newHeader = `<div class="header" style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <!-- To use your custom logo, replace the SVG below with an <img src="URL_TO_YOUR_LOGO.png" alt="Tizzitech Logo" style="height: 40px;" /> -->
                <div class="logo" style="display: flex; align-items: center; gap: 10px;">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  <span style="color: #2563eb; font-size: 28px;">Tizzitech</span>
                </div>
                <div style="color: #666; font-size: 14px; margin-top: 5px;">Premium Tech & Accessories</div>
              </div>
              <div class="invoice-title" style="text-align: right;">
                <div style="font-size: 24px; color: #333;">RECEIPT / INVOICE</div>
                <div style="font-size: 12px; color: #888; margin-top: 4px;">Original Copy</div>
              </div>
            </div>`;

code = code.replace(oldHeader, newHeader);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
