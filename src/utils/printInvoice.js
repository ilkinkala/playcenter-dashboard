import { formatPrice } from './pricing';

function formatMinutes(min) {
  if (min < 1) return `${Math.round(min * 60)} saniye`;
  const h = Math.floor(min / 60);
  const m = Math.ceil(min % 60);
  if (h > 0) return `${h} saat ${m} dakika`;
  return `${m} dakika`;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const FOX_SVG = `<svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 4L18 26C14 28 12 30 14 34L8 4Z" fill="#FF6B35"/>
  <path d="M56 4L46 26C50 28 52 30 50 34L56 4Z" fill="#FF6B35"/>
  <path d="M12 10L19 26L15 28L12 10Z" fill="#FFB088"/>
  <path d="M52 10L45 26L49 28L52 10Z" fill="#FFB088"/>
  <ellipse cx="32" cy="36" rx="20" ry="18" fill="#FF6B35"/>
  <path d="M12 34C12 34 10 38 12 42C14 46 18 48 22 48" fill="#E8551E"/>
  <path d="M52 34C52 34 54 38 52 42C50 46 46 48 42 48" fill="#E8551E"/>
  <path d="M22 34C22 34 24 26 32 26C40 26 42 34 42 34C42 34 42 46 38 50C36 52 28 52 26 50C22 46 22 34 22 34Z" fill="#FFF5EE"/>
  <path d="M20 30C20 30 24 22 32 22C40 22 44 30 44 30C44 32 40 28 32 28C24 28 20 32 20 30Z" fill="#E8551E"/>
  <ellipse cx="26" cy="35" rx="2.8" ry="3" fill="#2D3047"/>
  <circle cx="27.2" cy="33.5" r="0.9" fill="white"/>
  <ellipse cx="38" cy="35" rx="2.8" ry="3" fill="#2D3047"/>
  <circle cx="39.2" cy="33.5" r="0.9" fill="white"/>
  <ellipse cx="32" cy="41" rx="2.5" ry="1.8" fill="#2D3047"/>
  <path d="M32 42.8L29.5 44.5" stroke="#2D3047" stroke-width="0.8" stroke-linecap="round"/>
  <path d="M32 42.8L34.5 44.5" stroke="#2D3047" stroke-width="0.8" stroke-linecap="round"/>
</svg>`;

export function printInvoice(record) {
  const isEarly = record.type === 'early';
  const isOvertime = record.type === 'overtime' && record.overtimeMinutes > 0;

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Fatura - ${record.childName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #333; }
    .invoice { max-width: 400px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FF6B35; padding-bottom: 20px; }
    .header svg { margin-bottom: 8px; }
    .header h1 { font-size: 24px; color: #2D3047; margin-bottom: 4px; }
    .header p { font-size: 13px; color: #888; }
    .date { text-align: right; font-size: 12px; color: #888; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; }
    .row .label { color: #666; }
    .row .value { font-weight: 600; color: #333; }
    .divider { border-top: 2px dashed #ddd; margin: 16px 0; }
    .total { display: flex; justify-content: space-between; padding: 14px 0; font-size: 18px; font-weight: 700; }
    .total .value { color: #FF6B35; }
    .overtime-row .value { color: #E63946; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 8px; }
    .badge-early { background: rgba(244,162,97,0.15); color: #F4A261; }
    .badge-overtime { background: rgba(230,57,70,0.12); color: #E63946; }
    .note { margin-top: 16px; padding: 10px; background: #fff8f0; border: 1px solid #ffe0c0; border-radius: 6px; font-size: 12px; color: #888; }
    .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      ${FOX_SVG}
      <h1>Küçük Tilki</h1>
      <p>Çocuk Eğlence Merkezi</p>
    </div>
    <div class="date">${formatDate(record.completedAt)}</div>

    <div class="row">
      <span class="label">Çocuk</span>
      <span class="value">${record.childName}</span>
    </div>
    <div class="row">
      <span class="label">Veli</span>
      <span class="value">${record.parentName}</span>
    </div>
    ${record.parentPhone ? `
    <div class="row">
      <span class="label">Telefon</span>
      <span class="value">${record.parentPhone}</span>
    </div>` : ''}
    <div class="row">
      <span class="label">Paket</span>
      <span class="value">
        ${record.packageLabel}
        ${isEarly ? '<span class="badge badge-early">Erken Alış</span>' : ''}
        ${isOvertime ? '<span class="badge badge-overtime">Ekstra Süreli</span>' : ''}
      </span>
    </div>
    <div class="row">
      <span class="label">Kullanılan Süre</span>
      <span class="value">${formatMinutes(record.usedMinutes)}</span>
    </div>

    <div class="divider"></div>

    <div class="row">
      <span class="label">Paket Ücreti</span>
      <span class="value">${formatPrice(record.packagePrice)}</span>
    </div>

    ${isOvertime ? `
    <div class="row overtime-row">
      <span class="label">Ekstra Süre</span>
      <span class="value">+${formatMinutes(record.overtimeMinutes)}</span>
    </div>
    <div class="row overtime-row">
      <span class="label">Ekstra Ücret</span>
      <span class="value">+${formatPrice(record.overtimePrice)}</span>
    </div>
    ` : ''}

    ${isEarly ? `
    <div class="row">
      <span class="label">Erken Alış Ücreti</span>
      <span class="value">${formatPrice(record.finalPrice)}</span>
    </div>
    ` : ''}

    <div class="divider"></div>

    <div class="total">
      <span>TOPLAM</span>
      <span class="value">${formatPrice(record.finalPrice)}</span>
    </div>

    ${isOvertime ? '<div class="note">Ekstra ücret işletme sahibinin inisiyatifindedir.</div>' : ''}

    <div class="footer">
      Küçük Tilki Çocuk Eğlence Merkezi<br>
      Bizi tercih ettiğiniz için teşekkürler!
    </div>
  </div>

  <div class="no-print" style="text-align:center;margin-top:20px;">
    <button onclick="window.print()" style="padding:10px 30px;background:#FF6B35;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;">
      Yazdır / PDF
    </button>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
}
