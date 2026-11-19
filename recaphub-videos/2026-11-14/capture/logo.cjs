const { chromium } = require('C:/Users/nitis/Desktop/recaphub_3.0/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 800, height: 260 } });
  const v = fs.readFileSync(String.raw`C:\Users\nitis\Desktop\MoneyPrinterTurbo\recaphub-videos\2026-11-14\motion\public\brand\recaphub-logo.svg`, 'utf8'); const w = fs.readFileSync(String.raw`C:\Users\nitis\Desktop\MoneyPrinterTurbo\recaphub-videos\2026-11-14\motion\public\brand\recaphub-logo-white.svg`, 'utf8');
  await p.setContent('<body style="margin:0;display:flex"><div style="background:#fff;padding:20px">' + v + '</div><div style="background:#5B3DF5;padding:20px">' + w + '</div></body>');
  await p.screenshot({ path: String.raw`C:\Users\nitis\AppData\Local\Temp\claude\1455adcb6a4993cf\f9cd08e4-d6c0-4cc8-a312-7e40fc14376c\scratchpad\logo.png` }); await b.close();
})();
