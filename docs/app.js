/* Static demo of the Laravel PG Manager app.
   Same tables, fields, sorting, search, confirm-delete, XML rules and XML export,
   with localStorage standing in for SQLite. */

const KEY = 'pgm_demo_v1';

const SEED = {
  rooms: [
    { id: 1, room_no: '101', type: 'Single', rent: 8500, capacity: 1 },
    { id: 2, room_no: '102', type: 'Double', rent: 7000, capacity: 2 },
    { id: 3, room_no: '103', type: 'Triple', rent: 6000, capacity: 3 },
  ],
  tenants: [
    { id: 1, name: 'Aarav Shah', phone: '98250 11223', room_id: 1, joined_on: '2026-04-01' },
    { id: 2, name: 'Meera Patel', phone: '98980 44556', room_id: 2, joined_on: '2026-06-15' },
    { id: 3, name: 'Rohan Desai', phone: '97250 77889', room_id: 2, joined_on: '2026-08-02' },
  ],
  payments: [
    { id: 1, tenant_id: 1, amount: 8500, month: '2026-09', status: 'Paid' },
    { id: 2, tenant_id: 2, amount: 7000, month: '2026-09', status: 'Paid' },
    { id: 3, tenant_id: 3, amount: 7000, month: '2026-09', status: 'Pending' },
    { id: 4, tenant_id: 1, amount: 8500, month: '2026-10', status: 'Paid' },
    { id: 5, tenant_id: 2, amount: 7000, month: '2026-10', status: 'Pending' },
  ],
};

// House rules normally live in public/xml/rules.xml; kept inline as a fallback.
const RULES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<pg name="Sunrise PG">
    <rule>Rent is due on or before the 5th of every month.</rule>
    <rule>Gate closes at 10:30 PM. Inform the warden for late entry.</rule>
    <rule>Visitors are allowed in the common area from 9 AM to 8 PM only.</rule>
    <rule>One month notice is required before vacating. Deposit is refunded after room check.</rule>
    <rule>Keep rooms and shared kitchens clean. No smoking or alcohol inside.</rule>
</pg>`;

const CFG = {
  rooms: {
    title: 'Rooms',
    fields: {
      room_no: 'text',
      type: ['Single', 'Double', 'Triple'],
      rent: 'number',
      capacity: 'number',
    },
  },
  tenants: {
    title: 'Tenants',
    fields: {
      name: 'text',
      phone: 'text',
      room_id: () => selectOptions(app.rooms, 'room_no'),
      joined_on: 'date',
    },
  },
  payments: {
    title: 'Rent payments',
    fields: {
      tenant_id: () => selectOptions(app.tenants, 'name'),
      amount: 'number',
      month: 'month',
      status: ['Paid', 'Pending'],
    },
  },
};

let app = load();
let flash = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to seed */ }
  const seeded = structuredClone(SEED);
  localStorage.setItem(KEY, JSON.stringify(seeded));
  return seeded;
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(app));
}

function selectOptions(rows, label) {
  return Object.fromEntries(rows.map(r => [r.id, r[label]]));
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

const label = name => {
  const text = name.replace('_id', '').replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const latest = rows => [...rows].sort((a, b) => b.id - a.id);

const nextId = rows => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;

function tenantName(id) {
  const t = app.tenants.find(t => t.id === Number(id));
  return t ? t.name : '-';
}

function roomNo(id) {
  const r = app.rooms.find(r => r.id === Number(id));
  return r ? r.room_no : '-';
}

function cell(row, name) {
  if (name === 'room_id') return esc(roomNo(row.room_id));
  if (name === 'tenant_id') return esc(tenantName(row.tenant_id));
  if (name === 'rent' || name === 'amount') return money(row[name]);
  if (name === 'status') return `<span class="tag ${esc(row.status)}">${esc(row.status)}</span>`;
  return esc(row[name]);
}

function showFlash(msg, isError) {
  flash = { msg, isError: !!isError };
}

/* ---------- views ---------- */

function dashboard() {
  const beds = app.rooms.reduce((s, r) => s + Number(r.capacity || 0), 0);
  const collected = app.payments.filter(p => p.status === 'Paid').reduce((s, p) => s + Number(p.amount || 0), 0);
  const pending = app.payments.filter(p => p.status === 'Pending').reduce((s, p) => s + Number(p.amount || 0), 0);
  const free = Math.max(0, beds - app.tenants.length);
  const recent = latest(app.payments).slice(0, 5);

  const rows = recent.length
    ? recent.map(p => `<tr><td>${esc(tenantName(p.tenant_id))}</td><td>${esc(p.month)}</td>
        <td>${money(p.amount)}</td><td><span class="tag ${esc(p.status)}">${esc(p.status)}</span></td></tr>`).join('')
    : `<tr><td colspan="4" class="empty">No payments yet. Add a room and a tenant, then record the first rent.</td></tr>`;

  return `<h2>Today at your PG</h2>
  <div class="stats">
    <div class="stat big"><b>${free}</b><span>beds free out of ${beds}</span></div>
    <div class="stat"><b>${app.rooms.length}</b><span>rooms</span></div>
    <div class="stat"><b>${app.tenants.length}</b><span>tenants</span></div>
    <div class="stat"><b>${money(collected)}</b><span>rent collected</span></div>
    <div class="stat warn"><b>${money(pending)}</b><span>rent pending</span></div>
  </div>
  <h3>Latest payments</h3>
  <table><tr><th>Tenant</th><th>Month</th><th>Amount</th><th>Status</th></tr>${rows}</table>`;
}

function listView(type) {
  const cfg = CFG[type];
  const names = Object.keys(cfg.fields);

  const inputs = names.map(name => {
    const kind = cfg.fields[name];
    const options = typeof kind === 'function' ? kind() : Array.isArray(kind) ? kind : null;
    const control = options
      ? `<select name="${name}" required><option value="">Select</option>${Object.entries(options)
          .map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('')}</select>`
      : `<input type="${kind}" name="${name}" required>`;
    return `<label>${esc(label(name))}${control}</label>`;
  }).join('');

  const rows = latest(app[type]);
  const body = rows.length
    ? rows.map(row => `<tr>${names.map(n => `<td>${cell(row, n)}</td>`).join('')}
        <td><button class="link" data-del="${type}:${row.id}">Delete</button></td></tr>`).join('')
    : `<tr><td colspan="${names.length + 1}" class="empty">Nothing here yet. Use the form above to add the first entry.</td></tr>`;

  return `<h2>${cfg.title}</h2>
  <form class="card" data-add="${type}">${inputs}<button>Add ${cfg.title.toLowerCase().replace(/s$/, '')}</button></form>
  <input id="search" placeholder="Search ${cfg.title.toLowerCase()}">
  <table id="data">
    <tr>${names.map(n => `<th>${esc(label(n))}</th>`).join('')}<th></th></tr>
    ${body}
  </table>`;
}

function rulesView() {
  const doc = new DOMParser().parseFromString(RULES_XML, 'application/xml');
  const name = doc.documentElement.getAttribute('name');
  const rules = [...doc.querySelectorAll('rule')].map(r => `<li>${esc(r.textContent)}</li>`).join('');
  return `<h2>House rules at ${esc(name)}</h2>
  <ol class="rules">${rules}</ol>
  <p class="muted">Served from <code>public/xml/rules.xml</code> in the Laravel app.</p>`;
}

function exportView() {
  const rows = app.tenants.map(t => `  <tenant>
    <name>${esc(t.name)}</name>
    <phone>${esc(t.phone)}</phone>
    <room>${esc(roomNo(t.room_id))}</room>
    <joined_on>${esc(t.joined_on)}</joined_on>
  </tenant>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<tenants>\n${rows}\n</tenants>\n`;
  return { xml, html: `<h2>Export tenants (XML)</h2>
  <p class="muted">The Laravel route <code>/export/tenants.xml</code> streams this document as a download.</p>
  <p><button data-download>Download tenants.xml</button></p>
  <pre class="card" style="display:block;white-space:pre-wrap;font-size:13px">${esc(xml)}</pre>` };
}

/* ---------- render ---------- */

function route() {
  const path = (location.hash.replace(/^#/, '') || '/').replace(/\/$/, '') || '/';
  const items = document.querySelectorAll('#nav a');
  items.forEach(a => a.classList.toggle('on', a.dataset.route === path));

  const view = document.getElementById('view');
  const flashBox = document.getElementById('flash');

  flashBox.innerHTML = flash
    ? `<div class="flash${flash.isError ? ' err' : ''}">${esc(flash.msg)}</div>`
    : '';
  flash = null;

  if (path === '/') { view.innerHTML = dashboard(); return; }
  if (path === '/rules') { view.innerHTML = rulesView(); return; }
  if (path === '/export') {
    const out = exportView();
    view.innerHTML = out.html;
    view.querySelector('[data-download]').onclick = () => {
      const url = URL.createObjectURL(new Blob([out.xml], { type: 'application/xml' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'tenants.xml'; a.click();
      URL.revokeObjectURL(url);
    };
    return;
  }

  const type = path.slice(1);
  if (!CFG[type]) { view.innerHTML = '<h2>Not found</h2>'; return; }
  view.innerHTML = listView(type);

  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase();
    view.querySelectorAll('#data tr:not(:first-child)').forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

document.getElementById('view').addEventListener('submit', e => {
  const form = e.target.closest('[data-add]');
  if (!form) return;
  e.preventDefault();
  const type = form.dataset.add;
  const names = Object.keys(CFG[type].fields);
  const values = Object.fromEntries(names.map(n => [n, form.elements[n].value.trim()]));

  if (names.some(n => !values[n])) { showFlash('Please fill in every field.', true); route(); return; }

  const row = { id: nextId(app[type]) };
  names.forEach(n => {
    row[n] = ['room_id', 'tenant_id'].includes(n) ? Number(values[n])
      : ['rent', 'capacity', 'amount'].includes(n) ? Number(values[n])
      : values[n];
  });

  if (type === 'rooms' && app.rooms.some(r => r.room_no === row.room_no)) {
    showFlash('That room number already exists.', true); route(); return;
  }

  app[type].push(row);
  save();
  showFlash('Saved.');
  route();
});

document.getElementById('view').addEventListener('click', e => {
  const btn = e.target.closest('[data-del]');
  if (!btn) return;
  const [type, id] = btn.dataset.del.split(':');
  if (!confirm('Delete this entry?')) return;

  app[type] = app[type].filter(r => r.id !== Number(id));
  if (type === 'rooms') app.tenants = app.tenants.filter(t => t.room_id !== Number(id));
  if (type === 'tenants') app.payments = app.payments.filter(p => p.tenant_id !== Number(id));
  save();
  showFlash('Deleted.');
  route();
});

window.addEventListener('hashchange', route);
route();
