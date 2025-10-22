const DB_URL = 'https://upadhayay.github.io/db.json';

const paperIcon = `
  <div class="card-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <path d="M14 2v6h6"/>
      <path d="M8 13h8M8 17h8M8 9h2"/>
    </svg>
  </div>`;

const grid = document.getElementById('paperGrid');
const countEl = document.getElementById('paperCount');

function formatAuthors(auth){
  if (!auth) return '';
  if (Array.isArray(auth)) return auth.join(', ');
  return String(auth);
}

function makeCard(p){
  const title = p.title || p.name || 'Untitled Paper';
  const year = p.year || p.published || p.date || '';
  const venue = p.venue || p.journal || p.conference || '';
  const authors = formatAuthors(p.authors || p.author);
  const link = p.url || p.link || p.pdf || '#';
  const abstract = p.abstract || p.summary || '';
  const safeYear = year ? `<span class="chip">${year}</span>` : '';
  const safeVenue = venue ? `<span class="chip">${venue}</span>` : '';
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    ${paperIcon}
    <div>
      <h4>${title}</h4>
      <div class="meta">${authors ? authors + (venue? ' · ' : '') : ''}${venue}</div>
      ${abstract ? `<p>${abstract}</p>` : ''}
      <div class="chiprow">${safeYear}${safeVenue}</div>
    </div>
    <div>
      ${link && link !== '#' ? `<a href="${link}" target="_blank" rel="noopener">Open paper →</a>` : `<span class="meta">No link available</span>`}
    </div>`;
  return card;
}

function renderBooks(list){
  const ul = document.querySelector('.pubs');
  if (!ul) return;
  ul.innerHTML = '';
  const items = Array.isArray(list) ? list.slice() : [];
  items.sort((a,b)=>(b.year||0)-(a.year||0));
  items.forEach(b=>{
    const li = document.createElement('li');
    const y = b.year ? b.year + ' — ' : '';
    const t = b.title || 'Untitled';
    li.textContent = y + t;
    ul.appendChild(li);
  });
}

async function loadData(){
  try{
    const res = await fetch(DB_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error(`Network error ${res.status}`);
    const data = await res.json();
    const books = Array.isArray(data) ? [] : (Array.isArray(data.books) ? data.books : []);
    if (books.length){
      renderBooks(books);
      if (countEl) countEl.textContent = '';
      if (grid) grid.innerHTML = '';
      return;
    }
    const list = Array.isArray(data) ? data
               : Array.isArray(data.papers) ? data.papers
               : Array.isArray(data.publications) ? data.publications
               : [];
    if (grid) grid.setAttribute('aria-busy','false');
    if(!list.length){
      if (grid) grid.innerHTML = `<div class="card"><div>${paperIcon}</div><p class="meta">No papers found in the data source.</p></div>`;
      if (countEl) countEl.textContent = '';
      return;
    }
    list.sort((a,b)=> (parseInt(b.year||b.published||0)||0) - (parseInt(a.year||a.published||0)||0));
    const frag = document.createDocumentFragment();
    list.forEach(p => frag.appendChild(makeCard(p)));
    if (grid){
      grid.innerHTML = '';
      grid.appendChild(frag);
    }
    if (countEl) countEl.textContent = `${list.length} papers`;
  }catch(err){
    if (grid){
      grid.setAttribute('aria-busy','false');
      grid.innerHTML = `<div class="card"><div>${paperIcon}</div><p class="meta">Could not load data. Please check the link or try again later.</p></div>`;
    }
    if (countEl) countEl.textContent = '';
    console.error(err);
  }
}

const yEl = document.getElementById('year');
if (yEl) yEl.textContent = new Date().getFullYear();
loadData();
