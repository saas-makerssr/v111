
(() => {
'use strict';
const STORAGE_KEY = 'hapPrototypeV4';
const app = document.getElementById('app');
const toastLayer = document.getElementById('toast-layer');

/* ---------- pathname routing ---------- */
const QS = new URLSearchParams(location.search);
const PUBLIC_CTX = QS.get('ctx') === 'public';
const PUBLIC_SLUG = QS.get('slug') || '';
let lastPath = '';
const ADMIN_TAB_PATHS = {home:'/admin',menu:'/admin/menu',promote:'/admin/promotions',design:'/admin/design',qr:'/admin/qr',insights:'/admin/analytics',more:'/admin/more'};
const ADMIN_SUBPAGE_PATHS = {appearance:'/admin/appearance',analytics:'/admin/analytics',staff:'/admin/staff',settings:'/admin/settings',billing:'/admin/billing'};
const SUPER_TAB_PATHS = {overview:'/super',restaurants:'/super/restaurants',users:'/super/users',plans:'/super/plans',settings:'/super/settings'};
function currentPath(){
 if(state.mode==='preview') return '/preview';
 if(state.role==='super') return SUPER_TAB_PATHS[state.adminTab] || '/super';
 if(state.adminSubpage) return ADMIN_SUBPAGE_PATHS[state.adminSubpage] || '/admin';
 return ADMIN_TAB_PATHS[state.adminTab] || '/admin';
}
function applyPath(path){
 const p = String(path||'/').split('?')[0].replace(/\/+$/,'') || '/';
 if(p==='/preview'){ state.mode='preview'; state.preview.languageConfirmed=true; return; }
 if(p==='/super' || p.startsWith('/super/')){
  const seg = p==='/super' ? 'overview' : p.slice(7);
  const tab = Object.keys(SUPER_TAB_PATHS).find(k=>k===seg) || 'overview';
  state.mode='admin'; state.role='super'; state.adminTab=tab; state.adminSubpage=null; return;
 }
 const sub = Object.keys(ADMIN_SUBPAGE_PATHS).find(k=>ADMIN_SUBPAGE_PATHS[k]===p);
 if(sub && sub!=='analytics'){ state.mode='admin'; state.role='restaurant'; state.adminTab='more'; state.adminSubpage=sub; return; }
 const tab = Object.keys(ADMIN_TAB_PATHS).find(k=>ADMIN_TAB_PATHS[k]===p);
 state.mode='admin'; state.role='restaurant'; state.adminSubpage=null; state.adminTab=tab||'home';
}
function syncPath(){
 if(PUBLIC_CTX) return;
 const p=currentPath();
 if(p===lastPath) return;
 lastPath=p;
 if(window.parent && window.parent!==window){
  try{ window.parent.postMessage({type:'hap:navigate',path:p}, location.origin); }catch(e){}
 }
}
window.addEventListener('message',e=>{
 if(e.origin!==location.origin) return;
 const d=e.data;
 if(!d || d.type!=='hap:route' || typeof d.path!=='string') return;
 if(d.path===currentPath()){ lastPath=d.path; return; }
 applyPath(d.path); lastPath=d.path; save(); render();
});

const ICONS = {
 home:'<path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3z"/>',
 menu:'<path d="M4 5h16M4 12h16M4 19h16"/>',
 spark:'<path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Zm6 11 .9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z"/>',
 qr:'<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 14h3v7h-3M14 18h3v3h-3"/>',
 more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
 moon:'<path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.4 3 14.6 0 18M12 3c-3 3.4-3 14.6 0 18"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 eye:'<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
 palette:'<path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0-2-11Z"/><circle cx="7" cy="10" r="1"/><circle cx="9" cy="6.5" r="1"/><circle cx="14" cy="6.5" r="1"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20V8"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21h-4v-.09a1.7 1.7 0 0 0-1.1-1.51 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.5a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3h4v.09A1.7 1.7 0 0 0 15.5 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.12.36.33.7.6 1 .27.27.62.48 1 .6h.09v4H21a1.7 1.7 0 0 0-1.6.4Z"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',
 back:'<path d="m15 18-6-6 6-6"/>',
 edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/>',
 eyeOff:'<path d="m3 3 18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 4.2A10.6 10.6 0 0 1 12 4c6 0 9.5 8 9.5 8a15 15 0 0 1-2.1 3.2M6.6 6.6C4 8.3 2.5 12 2.5 12s3.5 8 9.5 8a9.7 9.7 0 0 0 4.1-.9"/>',
 download:'<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
 share:'<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/>',
 refresh:'<path d="M20 7v5h-5M4 17v-5h5M6 8a7 7 0 0 1 12-2l2 2M18 16a7 7 0 0 1-12 2l-2-2"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 activity:'<path d="M3 12h4l2-7 4 14 2-7h6"/>',
 server:'<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
 building:'<path d="M4 21V5l8-3 8 3v16M9 9h2M9 13h2M9 17h2M15 9h2M15 13h2M15 17h2"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/>',
 up:'<path d="m6 15 6-6 6 6"/>',
 down:'<path d="m6 9 6 6 6-6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 location:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
 phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
 flame:'<path d="M12 3c.6 2.6 2.3 3.6 3.4 5.2A6 6 0 0 1 12 21a6 6 0 0 1-3.4-10.9C9.9 8.6 11.4 6.6 12 3Z"/><path d="M12 21a2.6 2.6 0 0 1-1.4-4.8c.7-.5 1.2-1.2 1.4-2 .3.9.9 1.5 1.5 2A2.6 2.6 0 0 1 12 21Z"/>',
 chili:'<path d="M14.5 4.5c0-1 .8-1.8 1.8-1.8M14.5 4.5c3 1.5 3.8 5 2 8.1C14.5 16.2 10.7 18.5 7 18.5H4.8c0-3.2 1.7-6.1 4.4-7.7 1.9-1.2 4-3.1 5.3-6.3Z"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17.5 4.6-4.2a2 2 0 0 1 2.7 0L20 20"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/>'
};

function icon(name,size=20){ return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS.more}</svg>`; }

const languages = [
 ['EN','English','English'],['SQ','Shqip','Albanian'],['IT','Italiano','Italian'],['DE','Deutsch','German'],['FR','Français','French'],['ES','Español','Spanish'],['EL','Ελληνικά','Greek'],['PT','Português','Portuguese'],['NL','Nederlands','Dutch'],['PL','Polski','Polish'],['TR','Türkçe','Turkish'],['RO','Română','Romanian'],['SR','Srpski','Serbian'],['HR','Hrvatski','Croatian'],['UK','Українська','Ukrainian'],['SV','Svenska','Swedish'],['NO','Norsk','Norwegian'],['DA','Dansk','Danish'],['CS','Čeština','Czech'],['JA','日本語','Japanese'],['ZH','中文','Chinese'],['KO','한국어','Korean'],['AR','العربية','Arabic']
];

const promotionStyles = [
 ['minimal','Minimal Outline'],['chef','Chef Pick'],['tonight','Tonight'],['new','New'],['limited','Limited'],['seasonal','Seasonal'],['editorial','Editorial'],['imageSpotlight','Image Spotlight'],['recommendation','Recommendation'],['premium','Premium'],['warmBistro','Warm Bistro'],['bold','Bold']
];
const templates = [
 ['clean','Clean','Quiet, direct list'],['modern','Modern','Soft cards + imagery'],['editorial','Editorial','Magazine rhythm'],['bistro','Bistro','Warm European'],['classy','Classy','Thin lines + serif'],['imageFirst','Image First','Photography leads'],['compact','Compact','Built for huge menus'],['street','Street','Bolder identity'],['noir','Noir','Dark fine dining'],['coastal','Coastal','Light, airy, seaside'],['market','Market','Handwritten chalkboard'],['grid','Grid','Two-column tiles']
];

const backgrounds = [['clean','Clean'],['watermark','Watermark'],['geometry','Soft geometry'],['paper','Paper'],['pattern','Pattern'],['gradient','Gradient shadow'],['dark-premium','Dark premium']];

const TOUR_STEPS = [
 {target:null,title:'Welcome to Hap',body:'Your digital menu is already live. Let’s walk through the five things that matter — it takes about a minute.',cta:'Start tour',nav:{mode:'admin',role:'restaurant',tab:'home'}},
 {target:'status',title:'This is your live status',body:'One glance tells you the menu is published, how many categories are out there and what needs attention tonight.',cta:'Got it',nav:{mode:'admin',tab:'home'}},
 {target:'checklist',title:'Your setup checklist',body:'Anything unfinished lives here. Tick it off and the card disappears — no settings maze.',cta:'Next',nav:{mode:'admin',tab:'home'}},
 {target:'item',title:'Add your first dish',body:'Tap “Add item” to open the one-screen form.',tap:true,nav:{mode:'admin',tab:'home'}},
 {target:'sheet-primary',title:'Save it',body:'Name, price and a photo preset are enough. Tap “Add item” to save.',tap:true},
 {target:'nav-menu',title:'Your whole menu lives here',body:'Tap “Menu” to manage categories, photos and availability.',tap:true},
 {target:'menu-search',title:'Find anything fast',body:'Big menus stay usable: search, filter by sold out, and reorder in place.',cta:'Next'},
 {target:'promote',title:'Promote one dish',body:'Tap “Promote” on any item to make it noticeable on the public menu.',tap:true,nav:{mode:'admin',tab:'menu',expand:'popular'}},
 {target:'sheet-primary',title:'Choose how loud it is',body:'Pick a style and intensity, then save. Only one hero promotion runs at a time so the menu never feels spammy.',tap:true},
 {target:'nav-design',title:'Style the public menu',body:'Tap “Design” to switch templates, colours and layout.',tap:true},
 {target:'template',title:'Templates apply instantly',body:'Tap Classy, Noir, Market… the public menu restyles the moment you choose.',cta:'Next',nav:{mode:'admin',tab:'design'}},
 {target:'nav-qr',title:'Share your QR code',body:'Tap “QR” to download or share the code guests scan.',tap:true},
 {target:'preview-toggle',title:'See what guests see',body:'Switch to Preview any time. That’s the tour — everything else is discoverable.',tap:true}
];

function opsCtx(){
 return {state, ui, icon, escapeHtml, money, toast, save, render, confirm:showConfirm};
}
function showConfirm({title,body,label,tone,run}){
 ui.confirm={title,body,label,tone,run};
 render();
}
function langCodeFor(name){
 const found = languages.find(l => l[1] === name);
 return found ? found[0] : 'EN';
}

function defaultState(){
 const ops = (window.HapOps && HapOps.defaults) ? HapOps.defaults() : {};
 return {
  version:9, mode:'admin', role:'restaurant', theme:'light', adminTab:'home', adminSubpage:null,
  preview:{language:'English',languageConfirmed:false,promoSeen:false,strongDismissed:false},
  restaurant:{name:'Sofra',city:'Sarandë, Albania',status:'Open',hours:'09:00 – 23:00',phone:'+355 69 123 4567',address:'Rruga Butrinti, Sarandë',instagram:'@sofra.sarande',website:'sofra.al',defaultLanguage:'English',banner:'assets/banner.jpg',avatar:'assets/sofra-logo.svg',
   subscription:{status:'active',accessSource:'billing',plan:'growth',startedAt:'2026-03-01',endsAt:'2027-09-01',billingInterval:'monthly',grant:null}},
  invoices:[
   {id:'HAP-2026-08',date:'2026-08-01',amount:49,status:'Paid'},
   {id:'HAP-2026-07',date:'2026-07-01',amount:49,status:'Paid'},
   {id:'HAP-2026-06',date:'2026-06-01',amount:49,status:'Paid'},
   {id:'HAP-2026-05',date:'2026-05-01',amount:49,status:'Paid'}
  ],
  paymentMethod:{brand:'Visa',last4:'4242',expiry:'09/28'},

  appearance:{template:'modern',brand:'#8a543c',background:'paper',backgroundIntensity:'low',cards:'soft',images:'soft',radius:'medium',categoryBar:'pill',promotionStyle:'chef',typography:'mixed',header:'compact',mode:'light'},
  categoryTakeover:{active:true,categoryId:'desserts',label:'Featured tonight'},
  qrStyle:'brand',
  tour:{active:false,step:0,done:false},
  hideSoldOut:false, qrDownloaded:false,
  categories:[
   {id:'popular',name:'Popular',items:[
    {id:'truffle-burger',name:'Truffle Burger',ingredients:'Beef, truffle cream, onion, aged cheese',price:12.5,image:'assets/truffle-burger.webp',status:'available',promotion:{active:true,type:'chef',intensity:'normal',label:"Chef's Pick",style:'chef'}},
    {id:'burrata',name:'Burrata & Tomato',ingredients:'Burrata, tomato, basil oil, sea salt',price:9.5,image:'assets/burrata-tomato.webp',status:'available',promotion:{active:false}}
   ]},
   {id:'starters',name:'Starters',items:[
    {id:'caesar',name:'Caesar Salad',ingredients:'Romaine, parmesan, sourdough, Caesar dressing',price:7.5,image:'assets/caesar-salad.webp',status:'available',promotion:{active:false}},
    {id:'house-salad',name:'Village Salad',ingredients:'Tomato, cucumber, peppers, olives, white cheese',price:6.5,image:'assets/house-salad.webp',status:'available',promotion:{active:false}}
   ]},
   {id:'soups',name:'Soups',items:[
    {id:'tomato-soup',name:'Roasted Tomato Soup',ingredients:'Roasted tomato, basil, olive oil, cream',price:5.5,image:'assets/tomato-soup.webp',status:'available',promotion:{active:false}}
   ]},
   {id:'pizza',name:'Pizza',items:[
    {id:'margherita',name:'Margherita',ingredients:'Tomato, mozzarella, basil, olive oil',price:8.5,image:'assets/margherita.webp',status:'available',promotion:{active:false}},
    {id:'diavola',name:'Diavola',ingredients:'Tomato, mozzarella, spicy salami, chilli honey',price:10.5,image:'assets/margherita.webp',status:'soldout',promotion:{active:false}}
   ]},
   {id:'pasta',name:'Pasta',items:[
    {id:'penne',name:'Penne Arrabbiata',ingredients:'Penne, tomato, garlic, chilli, basil',price:8.0,image:'assets/penne-arrabbiata.webp',status:'available',promotion:{active:false}}
   ]},
   {id:'mains',name:'Mains',items:[
    {id:'octopus',name:'Grilled Octopus',ingredients:'Octopus, lemon, capers, tomato, herbs',price:14.5,image:'assets/grilled-octopus.webp',status:'available',promotion:{active:false}},
    {id:'sea-bass',name:'Grilled Sea Bass',ingredients:'Sea bass, herb potatoes, greens, lemon butter',price:17.5,image:'assets/sea-bass.webp',status:'available',promotion:{active:false}}
   ]},
   {id:'desserts',name:'Desserts',items:[
    {id:'tiramisu',name:'Tiramisu',ingredients:'Mascarpone, espresso, ladyfingers, cocoa',price:6.0,image:'assets/tiramisu.webp',status:'available',promotion:{active:false}},
    {id:'pistachio',name:'Pistachio Cheesecake',ingredients:'Cream cheese, pistachio cream, biscuit base',price:6.5,image:'assets/pistachio-cheesecake.webp',status:'available',promotion:{active:false}}
   ]},
   {id:'drinks',name:'Drinks',items:[
    {id:'spritz',name:'Citrus Spritz',ingredients:'Orange, tonic, rosemary, fresh citrus',price:5.0,image:'assets/burrata-tomato.webp',status:'available',promotion:{active:false}}
   ]}
  ],
  superadmin:{restaurants:[
   {id:'sofra',name:'Sofra',owner:'Arben K.',status:'Live',views:'8.4K',languages:12,last:'2 min ago',plan:'Growth',created:'Mar 2026',subscription:{status:'active',accessSource:'billing',plan:'growth',startedAt:'2026-03-01',endsAt:'2027-09-01',billingInterval:'monthly',grant:null}},
   {id:'bella',name:'Bella Napoli',owner:'Elira M.',status:'Live',views:'6.8K',languages:8,last:'14 min ago',plan:'Growth',created:'Feb 2026',subscription:{status:'active',accessSource:'billing',plan:'growth',startedAt:'2026-02-10',endsAt:'2027-02-10',billingInterval:'yearly',grant:null}},
   {id:'marina',name:'Marina',owner:'Jon D.',status:'Live',views:'5.2K',languages:10,last:'31 min ago',plan:'Starter',created:'Jan 2026',subscription:{status:'active',accessSource:'billing',plan:'starter',startedAt:'2026-01-05',endsAt:'2026-11-05',billingInterval:'monthly',grant:null}},
   {id:'kinema',name:'Kinema Bistro',owner:'Sara P.',status:'Draft',views:'1.1K',languages:4,last:'1 h ago',plan:'Starter',created:'Aug 2026',subscription:{status:'trial',accessSource:'trial',plan:'starter',startedAt:'2026-08-12',endsAt:'2026-08-26',billingInterval:null,grant:null}},
   {id:'garden',name:'Garden 21',owner:'Luan B.',status:'Live',views:'3.6K',languages:6,last:'2 h ago',plan:'Scale',created:'Dec 2025',subscription:{status:'active',accessSource:'manual',plan:'scale',startedAt:'2025-12-01',endsAt:null,billingInterval:null,grant:{grantedBy:'Hap Control',grantedAt:'2025-12-01',reason:'Launch partner',duration:'lifetime'}}}
  ]},
  ...ops
 };
}
function loadState(){
 try{ const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)); if(parsed && parsed.version===9){ for(const c of parsed.categories||[]){ for(const i of c.items||[]){ i.ingredients = String(i.ingredients ?? i.description ?? '').trim(); delete i.description; delete i.dietary; delete i.energy; delete i.spice; delete i.portion; } } return parsed; } return defaultState(); }catch(e){ return defaultState(); }
}
let state=loadState();
let ui={sheet:null,sheetData:null,modal:null,expandedCategory:'popular',menuSearch:'',superSearch:'',languageSearch:'',editingItem:null,adminSearch:'',menuFilter:'all',superFilter:'all',userFilter:'all',subId:null,userSearch:'',confirm:null,skeleton:false,lastFocus:null,hoursOpen:false};


function save(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
function setTheme(){
 const theme=state.theme||'light'; document.documentElement.dataset.theme=theme; document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#171614':'#f5f1ea');
}
function escapeHtml(v=''){ return String(v).replace(/[&<>'"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[s])); }
function money(v){ return `€${Number(v).toFixed(2)}`; }
function getItem(id){ for(const c of state.categories){ const item=c.items.find(i=>i.id===id); if(item) return {item,category:c}; } return null; }
function itemIngredients(i){ return String(i.ingredients ?? i.description ?? '').trim(); }
function getPromoted(){ for(const c of state.categories) for(const item of c.items) if(item.promotion?.active) return {item,category:c}; return null; }
function toast(msg){ toastLayer.innerHTML=`<div class="toast">${escapeHtml(msg)}</div>`; clearTimeout(toast._t); toast._t=setTimeout(()=>toastLayer.innerHTML='',2200); }

function rememberFocus(btn){ ui.lastFocus = btn; }
function restoreFocus(){
 if(!ui.lastFocus) return;
 if(document.contains(ui.lastFocus)){ ui.lastFocus.focus(); ui.lastFocus=null; return; }
 const d = ui.lastFocus.dataset;
 let selector = `[data-action="${d.action}"]`;
 if(d.tab) selector += `[data-tab="${d.tab}"]`;
 if(d.sheet) selector += `[data-sheet="${d.sheet}"]`;
 if(d.page) selector += `[data-page="${d.page}"]`;
 if(d.id) selector += `[data-id="${d.id}"]`;
 const el = document.querySelector(selector);
 if(el) el.focus();
 ui.lastFocus=null;
}

function prototypeBar(){
 const isAdmin=state.mode==='admin';
 return `<div class="prototype-bar">
   <div class="proto-segment" aria-label="Prototype mode">
    <button data-action="switch-mode" data-mode="admin" class="${isAdmin?'active':''}">Admin</button>
    <button data-action="switch-mode" data-mode="preview" data-tour="preview-toggle" class="${!isAdmin?'active':''}">Preview</button>
   </div>
   ${isAdmin?`<button class="proto-tool ${state.role==='super'?'active':''}" data-action="role-sheet" aria-label="Switch workspace">${icon(state.role==='super'?'server':'building',18)}</button>`:''}
   <button class="proto-tool" data-action="theme-toggle" aria-label="Toggle theme">${icon(state.theme==='dark'?'sun':'moon',18)}</button>
  </div>`;
}

function render(){
 setTheme();
 if(PUBLIC_CTX){
  const body = renderPreview();
  app.innerHTML=`<div class="app-stage"><div class="phone-app">${body}${renderOverlays()}</div></div>`;
  postRender();
  return;
 }
 const body = ui.skeleton ? renderSkeleton() : (state.mode==='preview' ? renderPreview() : (state.role==='super'?renderSuperadmin():renderRestaurantAdmin()));
 app.innerHTML=`<div class="app-stage"><div class="phone-app">${prototypeBar()}${body}${renderOverlays()}</div></div>`;
 if(!ui.skeleton){ postRender(); syncPath(); }
}

function renderSkeleton(){
 const inner = `<div class="content-scroll"><main class="admin-main skeleton"><div class="skeleton-head"></div><div class="skeleton-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div><div class="skeleton-list"><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div></main></div>${adminNav()}`;
 return state.role==='super' ? `<div class="super-shell">${inner}</div>` : inner;
}

function renderRestaurantAdmin(){
 const ctx = opsCtx();
 const page = state.adminSubpage ? renderAdminSubpage(state.adminSubpage) : ({home:adminHome,menu:adminMenu,promote:adminPromote,design:adminDesign,qr:adminQr,insights:analyticsPage,more:adminMore}[state.adminTab]||adminHome)(ctx);
 return `<div class="content-scroll"><main class="admin-main">${page}</main></div>${adminNav()}`;
}
function adminNav(){
 const tabs = state.role==='super'
  ? [['overview','home','Overview'],['restaurants','building','Restaurants'],['users','users','Users'],['plans','chart','Plans'],['settings','settings','Settings']]
  : [['home','home','Home'],['menu','menu','Menu'],['qr','qr','QR'],['insights','chart','Insights'],['more','more','More']];
 return `<nav class="admin-bottom-nav">${tabs.map(([id,ic,label])=>`<button class="admin-nav-btn ${state.adminTab===id&&!state.adminSubpage?'active':''}" data-action="${state.role==='super'?'super-tab':'admin-tab'}" data-tab="${id}" data-tour="nav-${id}">${icon(ic,21)}<span>${label}</span></button>`).join('')}</nav>`;
}
function allItems(){ return state.categories.flatMap(c=>c.items); }
function setupTasks(){
 const items=allItems();
 return [
  {id:'items',done:items.length>=6,title:'Add at least 6 dishes',sub:`${items.length} added`,action:'open-add-item'},
  {id:'photos',done:items.every(i=>i.image),title:'Add a photo to every dish',sub:'Photos lift attention by ~30%',action:'admin-tab',tab:'menu'},
  {id:'promo',done:!!getPromoted(),title:'Feature one dish',sub:'One tasteful highlight per service',action:'admin-tab',tab:'promote'},
  {id:'design',done:state.appearance.template!=='modern',title:'Pick a menu template',sub:'Classy, Noir, Market and more',action:'admin-tab',tab:'design'},
  {id:'qr',done:!!state.qrDownloaded,title:'Download your QR',sub:'Ready for print and windows',action:'admin-tab',tab:'qr'}
 ];
}
function adminHome(){
 const promoted=getPromoted();
 const items=allItems();
 const sold=items.filter(i=>i.status==='soldout').length;
 const tasks=setupTasks(); const done=tasks.filter(t=>t.done).length; const pct=Math.round(done/tasks.length*100);
 const hour=new Date().getHours(); const greet=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
 return `<div class="page-head" data-tour="restaurant"><div><div class="eyebrow">${greet}</div><h1 class="page-title">${escapeHtml(state.restaurant.name)}</h1><p class="page-subtitle">${escapeHtml(state.restaurant.city)} · ${escapeHtml(state.restaurant.hours)}</p></div><div class="head-actions"><button class="icon-btn" data-action="admin-tab" data-tab="more" aria-label="More">${icon('settings',19)}</button><button class="icon-btn" data-action="switch-mode" data-mode="preview" aria-label="Preview">${icon('eye',20)}</button></div></div>
 <div class="card status-card" data-tour="status"><div class="status-orb">${icon('check',20)}</div><div><strong>Your menu is live</strong><span>${state.categories.length} categories · ${items.filter(i=>i.status!=='hidden').length} visible items · ${escapeHtml(state.preview.language)}</span></div><button class="chip-btn" data-action="switch-mode" data-mode="preview">Open</button></div>
 ${done<tasks.length?`<section class="section"><div class="card checklist" data-tour="checklist"><div class="checklist-head"><div><strong>Finish setting up</strong><span>${done} of ${tasks.length} done</span></div><div class="ring" style="--pct:${pct}"><span>${pct}%</span></div></div><div class="checklist-body">${tasks.map(t=>`<button class="check-row ${t.done?'done':''}" data-action="${t.done?'noop':t.action}" ${t.tab?`data-tab="${t.tab}"`:''}><i class="check-box">${t.done?icon('check',12):''}</i><div><strong>${t.title}</strong><span>${t.sub}</span></div>${t.done?'':icon('chevron',15)}</button>`).join('')}</div></div></section>`:''}
 <section class="section"><div class="section-row"><div class="section-title">Quick actions</div></div><div class="quick-grid">
  <button class="card quick" data-action="open-add-item" data-tour="item"><div class="quick-icon">${icon('plus',18)}</div><div><strong>Add item</strong><span>Dish, price, photo</span></div></button>
  <button class="card quick" data-action="admin-tab" data-tab="promote"><div class="quick-icon">${icon('spark',18)}</div><div><strong>Promote</strong><span>Make something noticeable</span></div></button>
  <button class="card quick" data-action="admin-tab" data-tab="qr"><div class="quick-icon">${icon('qr',18)}</div><div><strong>QR code</strong><span>Download or share</span></div></button>
  <button class="card quick" data-action="admin-tab" data-tab="design" data-tour="appearance"><div class="quick-icon">${icon('palette',18)}</div><div><strong>Design</strong><span>Templates & colour</span></div></button>
 </div></section>
 <section class="section"><div class="section-row"><div class="section-title">Service controls</div></div><div class="settings-list">
  <div class="card settings-row"><div class="settings-icon">${icon('clock',18)}</div><div class="settings-copy"><strong>${state.restaurant.status==='Open'?'Open now':'Closed'}</strong><span>Shown at the top of the public menu</span></div><button class="switch ${state.restaurant.status==='Open'?'on':''}" data-action="toggle-open"><i></i></button></div>
  <div class="card settings-row"><div class="settings-icon">${icon('eyeOff',18)}</div><div class="settings-copy"><strong>Hide sold-out dishes</strong><span>Remove them instead of greying them out</span></div><button class="switch ${state.hideSoldOut?'on':''}" data-action="toggle-hide-soldout"><i></i></button></div>
 </div></section>
 <section class="section"><div class="section-row"><div class="section-title">Tonight</div><button class="section-link" data-action="admin-subpage" data-page="analytics">View insights</button></div><div class="tonight-list">
  <div class="card signal-row"><div class="signal-icon">${icon('spark',17)}</div><div class="signal-copy"><strong>${promoted?escapeHtml(promoted.item.name):'No active promotion'}</strong><span>${promoted?`${escapeHtml(promoted.item.promotion.label)} · ${escapeHtml(promoted.item.promotion.intensity)}`:'Choose an item to feature'}</span></div><div class="signal-value">${promoted?'1':'0'}</div></div>
  <div class="card signal-row"><div class="signal-icon">${icon('eyeOff',17)}</div><div class="signal-copy"><strong>Sold-out dishes</strong><span>Tap Menu to restock</span></div><div class="signal-value">${sold}</div></div>
  <div class="card signal-row"><div class="signal-icon">${icon('globe',17)}</div><div class="signal-copy"><strong>Missing translations</strong><span>Italian + German need review</span></div><div class="signal-value">3</div></div>
 </div></section>`;
}
function adminMenu(){
 const q=(ui.adminSearch||'').trim().toLowerCase();
 const filter=ui.menuFilter||'all';
 const cats=state.categories.map(c=>({...c,items:c.items.filter(i=>(!q||(i.name+' '+itemIngredients(i)).toLowerCase().includes(q))&&(filter==='all'||(filter==='soldout'&&i.status==='soldout')||(filter==='hidden'&&i.status==='hidden')||(filter==='promoted'&&i.promotion?.active)))})).filter(c=>!q&&filter==='all'?true:c.items.length);
 const total=allItems().length;
 return `<div class="page-head"><div><div class="eyebrow">Manage</div><h1 class="page-title">Menu</h1><p class="page-subtitle">${state.categories.length} categories · ${total} dishes</p></div><button class="icon-btn" data-action="open-add-item">${icon('plus',20)}</button></div>
 <label class="search-field" data-tour="menu-search">${icon('search',17)}<input id="admin-search" value="${escapeHtml(ui.adminSearch||'')}" placeholder="Search dishes"></label>
 <div class="filter-row">${[['all','All'],['soldout','Sold out'],['hidden','Hidden'],['promoted','Promoted']].map(([id,n])=>`<button class="filter-chip ${filter===id?'active':''}" data-action="menu-filter" data-filter="${id}">${n}</button>`).join('')}</div>
 <div class="admin-toolbar"><button class="btn soft" data-action="open-add-category" data-tour="category">${icon('plus',15)} Category</button><button class="btn soft" data-action="restock-all">${icon('refresh',15)} Restock all</button><button class="btn" data-action="switch-mode" data-mode="preview">${icon('eye',15)} Preview</button></div>
 ${cats.map(c=>renderAdminCategory(c)).join('')||'<div class="card empty">Nothing matches that search.</div>'}`;
}

function renderAdminCategory(c){
 const open=ui.expandedCategory===c.id;
 return `<div class="card category-admin"><button class="category-head" data-action="toggle-category" data-id="${c.id}"><div class="drag-handle">${icon('menu',16)}</div><div class="category-copy"><strong>${escapeHtml(c.name)}</strong><span>${c.items.length} items</span></div><div class="category-actions"><span class="mini-icon">${icon(open?'up':'down',15)}</span></div></button>${open?`<div class="category-body">${c.items.map(i=>renderAdminItem(i,c)).join('')}<button class="btn small soft" data-action="open-add-item" data-category="${c.id}">${icon('plus',13)} Add to ${escapeHtml(c.name)}</button></div>`:''}</div>`;
}
function renderAdminItem(i,c){
 const statusLabel=i.status==='available'?'Available':i.status==='soldout'?'Sold out':'Hidden';
 return `<div class="admin-item"><img class="admin-item-img" src="${i.image}" alt=""><div class="admin-item-copy"><strong>${escapeHtml(i.name)}</strong><span><i class="status-dot ${i.status}"></i>${statusLabel} · ${money(i.price)}</span></div><div><button class="mini-icon" data-action="move-item" data-id="${i.id}" data-dir="up" aria-label="Move up">${icon('up',14)}</button><button class="mini-icon" data-action="move-item" data-id="${i.id}" data-dir="down" aria-label="Move down">${icon('down',14)}</button></div><div class="item-menu-actions"><button class="item-action" data-action="edit-item" data-id="${i.id}">Edit</button><button class="item-action" data-action="cycle-status" data-id="${i.id}">${statusLabel}</button><button class="item-action promote" data-tour="promote" data-action="promote-item" data-id="${i.id}">${icon('spark',13)} Promote</button></div></div>`;
}
function adminPromote(){
 const p=getPromoted(); const selectedStyle=state.appearance.promotionStyle;
 return `<div class="page-head"><div><div class="eyebrow">Attention without noise</div><h1 class="page-title">Promote</h1><p class="page-subtitle">Make one dish or category easier to notice.</p></div><button class="icon-btn" data-action="switch-mode" data-mode="preview">${icon('eye',20)}</button></div>
 ${p?`<div class="card promo-summary"><div class="promo-kicker">Active now</div><div class="promo-name">${escapeHtml(p.item.name)}</div><div class="promo-meta">${escapeHtml(p.item.promotion.label)} · ${escapeHtml(p.item.promotion.intensity)} intensity</div><div style="margin-top:12px"><button class="btn small soft" data-action="promote-item" data-id="${p.item.id}">Edit promotion</button> <button class="btn small" data-action="disable-promo" data-id="${p.item.id}">Disable</button></div></div>`:`<div class="card empty">Nothing is promoted. Choose any menu item and tap Promote.</div>`}
 <section class="section"><div class="section-row"><div class="section-title">Category takeover</div></div><div class="card takeover"><div class="takeover-top"><div class="takeover-copy"><strong>${escapeHtml(state.categories.find(c=>c.id===state.categoryTakeover.categoryId)?.name||'Desserts')}</strong><span>Give this section extra visibility tonight.</span></div><button class="switch ${state.categoryTakeover.active?'on':''}" data-action="toggle-takeover"><i></i></button></div><div class="field" style="margin-top:12px"><select data-action="takeover-category">${state.categories.map(c=>`<option value="${c.id}" ${c.id===state.categoryTakeover.categoryId?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select></div></div></section>
 <section class="section"><div class="section-row"><div><div class="section-title">Promotion designs</div><div class="page-subtitle">Tap a style to apply it live.</div></div></div><div class="gallery-grid">${promotionStyles.map(([id,name])=>`<button class="promo-tile ${id} ${selectedStyle===id?'selected':''}" data-action="promo-style" data-style="${id}"><div class="promo-mini-card"><span class="promo-mini-label">${escapeHtml(name)}</span></div><strong style="font-size:11px">${escapeHtml(name)}</strong><small>${id==='minimal'?'Quiet outline':id==='bold'?'More contrast':'Tasteful emphasis'}</small></button>`).join('')}</div></section>`;
}
function tplMini(id){
 return `<div class="tpl-mini template-${id}"><span class="tpl-mini-head">Starters</span>`+
  [1,2].map(()=>`<div class="tpl-mini-row"><i class="tpl-mini-img"></i><div class="tpl-mini-copy"><b></b><s></s></div><em>9.5</em></div>`).join('')+
 `</div>`;
}
function adminDesign(){
 const a=state.appearance;
 const current=templates.find(t=>t[0]===a.template)||templates[0];
 return `<div class="page-head"><div><div class="eyebrow">Public menu</div><h1 class="page-title">Design</h1><p class="page-subtitle">Tap a template — the guest menu changes instantly.</p></div><button class="icon-btn" data-action="switch-mode" data-mode="preview" aria-label="Preview">${icon('eye',20)}</button></div>
 <div class="card design-current"><div><div class="eyebrow">Current template</div><strong>${escapeHtml(current[1])}</strong><span>${escapeHtml(current[2])}</span></div><button class="chip-btn" data-action="switch-mode" data-mode="preview">See it live</button></div>
 <section class="section" data-tour="template"><div class="section-row"><div class="section-title">Templates</div><span class="page-subtitle">${templates.length} styles</span></div>
  <div class="tpl-grid">${templates.map(([id,name,sub])=>`<button class="tpl-card ${a.template===id?'selected':''}" data-action="pick-template" data-value="${id}" style="--menu-brand:${a.brand}">${tplMini(id)}<div class="tpl-meta"><strong>${escapeHtml(name)}</strong><small>${escapeHtml(sub)}</small></div>${a.template===id?`<span class="tpl-check">${icon('check',12)}</span>`:''}</button>`).join('')}</div></section>
 <section class="section"><div class="section-row"><div class="section-title">Brand colour</div></div><div class="card" style="padding:14px"><div class="color-row">${['#8a543c','#b84a32','#677849','#315c62','#3e4d70','#8b5f8e','#1f1f1f'].map(c=>`<button class="swatch ${a.brand===c?'active':''}" style="background:${c}" data-action="brand-color" data-color="${c}" aria-label="${c}"></button>`).join('')}<input class="color-input" type="color" value="${a.brand}" data-action="brand-custom" aria-label="Custom brand colour"></div></div></section>
 <section class="section"><div class="section-row"><div class="section-title">Mode</div></div><div class="segment-control"><button class="${state.theme==='light'?'active':''}" data-action="set-theme" data-theme="light">Light</button><button class="${state.theme==='dark'?'active':''}" data-action="set-theme" data-theme="dark">Dark</button></div></section>
 <section class="section"><div class="section-row"><div class="section-title">Background</div></div><div class="preset-scroll">${backgrounds.map(([id,name])=>`<button class="preset ${a.background===id?'selected':''}" data-action="appearance" data-key="background" data-value="${id}"><div class="preset-preview" style="background:${id==='dark-premium'?'#26221f':id==='gradient'?'radial-gradient(circle at 25% 25%,rgba(138,84,60,.25),#eee7dd 58%)':'var(--surface-2)'}"></div><strong>${name}</strong></button>`).join('')}</div></section>
 <div class="settings-list" style="margin-top:14px">${settingsRow('settings','Advanced appearance','Header, category bar, images, typography','appearance')}</div>`;
}
function adminQr(){
 return `<div class="page-head"><div><div class="eyebrow">Scan to open</div><h1 class="page-title">Your menu QR</h1><p class="page-subtitle">Ready for windows, counters and print.</p></div></div>
 <div class="card qr-card qr-${state.qrStyle}"><div class="qr-wrap"><canvas id="live-qr" width="360" height="360" aria-label="QR code to this deployed Preview"></canvas></div><div class="qr-title">${escapeHtml(state.restaurant.name)}</div><div class="qr-note">This QR uses the current deployed URL · #preview</div><div class="qr-actions"><button class="btn primary" data-action="download-qr">${icon('download',15)} Download</button><button class="btn" data-action="share-preview">${icon('share',15)} Share</button></div><button class="btn full" style="margin-top:8px" data-action="switch-mode" data-mode="preview">${icon('eye',15)} Open preview</button></div>
 <section class="section"><div class="section-row"><div class="section-title">Change design</div></div><div class="preset-scroll">${['simple','brand','counter','window','premium','social'].map(id=>`<button class="preset ${state.qrStyle===id?'selected':''}" data-action="qr-style" data-style="${id}"><div class="preset-preview"><div style="width:42px;height:42px;background:#fff;border:5px solid ${id==='brand'?'var(--brand)':'#ddd'};margin:auto"></div></div><strong>${id[0].toUpperCase()+id.slice(1)}</strong></button>`).join('')}</div></section>`;
}
function adminMore(){
 return `<div class="page-head"><div><div class="eyebrow">Restaurant controls</div><h1 class="page-title">More</h1><p class="page-subtitle">Everything else, without turning into a settings maze.</p></div></div>
 <div class="settings-list">
  ${settingsRow('palette','Appearance','Template, colour, background','appearance')}
  ${settingsRow('users','Staff','Team roles and access','staff')}
  ${settingsRow('settings','Settings','Profile, hours, payments','settings')}
  ${settingsRow('chart','Billing','Plan, payment method, invoices','billing')}
  <button class="card settings-row" data-action="role-sheet"><div class="settings-icon">${icon('server',18)}</div><div class="settings-copy"><strong>Switch workspace</strong><span>Restaurant Admin ↔ Superadmin</span></div>${icon('chevron',17)}</button>
 </div>
 <section class="section"><div class="section-row"><div class="section-title">Prototype tools</div></div><div class="settings-list">
  <button class="card settings-row" data-action="replay-onboarding"><div class="settings-icon">${icon('spark',18)}</div><div class="settings-copy"><strong>Replay onboarding</strong><span>Run the focused 5-step guide</span></div>${icon('chevron',17)}</button>
  <button class="card settings-row" data-action="new-customer"><div class="settings-icon">${icon('eye',18)}</div><div class="settings-copy"><strong>Open as new customer</strong><span>Replay language + promotion flow</span></div>${icon('chevron',17)}</button>
  <button class="card settings-row" data-action="reset-demo"><div class="settings-icon">${icon('refresh',18)}</div><div class="settings-copy"><strong>Reset demo data</strong><span>Restore the original Sofra prototype</span></div>${icon('chevron',17)}</button>
 </div></section>`;
}
function settingsRow(ic,title,sub,page){ return `<button class="card settings-row" data-action="admin-subpage" data-page="${page}"><div class="settings-icon">${icon(ic,18)}</div><div class="settings-copy"><strong>${title}</strong><span>${sub}</span></div>${icon('chevron',17)}</button>`; }
function renderAdminSubpage(page){
 if(page==='appearance') return appearancePage();
 if(page==='billing') return billingPage();
 if(page==='analytics') return analyticsPage();
 if(page==='staff') return HapOps.adminPages.staff(opsCtx());
 if(page==='settings') return HapOps.adminSubpages.opsSettings(opsCtx());
 return adminMore();
}
function subHead(title,eyebrow=''){ return `<div class="back-row"><button data-action="subpage-back">${icon('back',18)}</button><div><div class="eyebrow">${escapeHtml(eyebrow)}</div><strong>${escapeHtml(title)}</strong></div><button class="section-link" style="margin-left:auto" data-action="switch-mode" data-mode="preview">Preview</button></div>`; }
function appearancePage(){
 const a=state.appearance;
 return `${subHead('Appearance','Live editor')}
 <div class="appearance-group"><label>Menu style</label><div class="preset-scroll">${templates.map(([id,name,sub])=>`<button class="preset ${a.template===id?'selected':''}" data-action="appearance" data-key="template" data-value="${id}"><div class="preset-preview ${id}"><span class="thumb"></span><i></i><i></i><i style="width:45%"></i></div><strong>${name}</strong><small>${sub}</small></button>`).join('')}</div></div>
 <div class="appearance-group"><label>Brand colour</label><div class="color-row">${['#8a543c','#b84a32','#677849','#315c62','#3e4d70','#8b5f8e'].map(c=>`<button class="swatch ${a.brand===c?'active':''}" style="background:${c}" data-action="brand-color" data-color="${c}" aria-label="${c}"></button>`).join('')}<input class="color-input" type="color" value="${a.brand}" data-action="brand-custom" aria-label="Custom brand colour"></div></div>
 <div class="appearance-group"><label>Mode</label><div class="segment-control"><button class="${state.theme==='light'?'active':''}" data-action="set-theme" data-theme="light">Light</button><button class="${state.theme==='dark'?'active':''}" data-action="set-theme" data-theme="dark">Dark</button></div></div>
 <div class="appearance-group"><label>Background</label><div class="preset-scroll">${backgrounds.map(([id,name])=>`<button class="preset ${a.background===id?'selected':''}" data-action="appearance" data-key="background" data-value="${id}"><div class="preset-preview" style="background:${id==='dark-premium'?'#26221f':id==='gradient'?'radial-gradient(circle at 25% 25%,rgba(138,84,60,.25),#eee7dd 58%)':'var(--surface-2)'}"></div><strong>${name}</strong></button>`).join('')}</div></div>
 <div class="appearance-group"><label>Header</label><div class="segment-control">${[['compact','Compact'],['minimal','Minimal'],['centered','Centered']].map(([id,n])=>`<button class="${a.header===id?'active':''}" data-action="appearance" data-key="header" data-value="${id}">${n}</button>`).join('')}</div></div>
 <div class="appearance-group"><label>Category bar</label><div class="segment-control">${[['pill','Pills'],['soft','Soft'],['underline','Underline']].map(([id,n])=>`<button class="${a.categoryBar===id?'active':''}" data-action="appearance" data-key="categoryBar" data-value="${id}">${n}</button>`).join('')}</div></div>
 <div class="appearance-group"><label>Images</label><div class="segment-control">${[['soft','Rounded'],['square','Square']].map(([id,n])=>`<button class="${a.images===id?'active':''}" data-action="appearance" data-key="images" data-value="${id}">${n}</button>`).join('')}</div></div>
 <div class="appearance-group"><label>Typography</label><div class="segment-control">${[['mixed','Balanced'],['serif','Serif'],['bold','Bold']].map(([id,n])=>`<button class="${a.typography===id?'active':''}" data-action="appearance" data-key="typography" data-value="${id}">${n}</button>`).join('')}</div></div>`;
}

/* ---------------- Billing ---------------- */
const PLAN_LABELS = {starter:'Starter',growth:'Growth',scale:'Scale'};
const PLAN_PRICES = {starter:19,growth:49,scale:129};
function formatDay(iso){
 if(!iso) return 'No end date';
 const d=new Date(iso); if(isNaN(d)) return iso;
 return d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
}
function subscriptionOf(){
 if(!state.restaurant.subscription) state.restaurant.subscription={status:'trial',accessSource:'trial',plan:'starter',startedAt:new Date().toISOString().slice(0,10),endsAt:null,billingInterval:null,grant:null};
 return state.restaurant.subscription;
}
function accessLabel(sub){
 if(sub.accessSource==='manual') return 'Access granted by Hap';
 if(sub.accessSource==='trial') return 'Free trial';
 return sub.billingInterval==='yearly' ? 'Billed yearly' : 'Billed monthly';
}
function billingPage(){
 const sub=subscriptionOf();
 const plan=PLAN_LABELS[sub.plan]||'Starter';
 const price=PLAN_PRICES[sub.plan]||19;
 const invoices=state.invoices||[];
 const pm=state.paymentMethod||{brand:'Visa',last4:'4242',expiry:'09/28'};
 const statusTone = sub.status==='active' ? 'ok' : (sub.status==='trial' ? 'warn' : 'bad');
 return `${subHead('Billing','Plan and payments')}
 <div class="card" style="padding:16px">
  <div class="section-row" style="margin-bottom:8px"><div><div class="eyebrow">Current plan</div><strong style="font-size:20px;letter-spacing:-.02em">${plan}</strong></div><span class="status-pill tone-${statusTone}">${escapeHtml(sub.status)}</span></div>
  <p class="page-subtitle" style="margin:0">${sub.endsAt?`Active until ${formatDay(sub.endsAt)}`:'Lifetime access — no end date'} · ${accessLabel(sub)}</p>
  ${sub.accessSource==='manual'&&sub.grant?`<p class="page-subtitle" style="margin:6px 0 0">Granted by ${escapeHtml(sub.grant.grantedBy)} on ${formatDay(sub.grant.grantedAt)}${sub.grant.reason?` · ${escapeHtml(sub.grant.reason)}`:''}</p>`:''}
  <div style="display:flex;gap:8px;margin-top:13px">
   <button class="btn primary" style="flex:1" data-action="billing-placeholder" data-what="Change plan">Change plan</button>
   <button class="btn" style="flex:1" data-action="billing-placeholder" data-what="Manage subscription">Manage subscription</button>
  </div>
 </div>
 <section class="section"><div class="section-row"><div class="section-title">Payment method</div></div>
  <div class="card list-card">
   <div class="system-row"><strong>${escapeHtml(pm.brand)} •••• ${escapeHtml(pm.last4)}</strong><span>Expires ${escapeHtml(pm.expiry)}</span></div>
  </div>
  <button class="btn full" style="margin-top:9px" data-action="billing-placeholder" data-what="Update payment method">Update payment method</button>
 </section>
 <section class="section"><div class="section-row"><div class="section-title">Billing history</div><span class="section-link">${money(price)}${sub.accessSource==='billing'?'/mo':''}</span></div>
  <div class="card list-card">${invoices.length?invoices.map(inv=>`<button class="data-row" data-action="billing-placeholder" data-what="Invoice ${escapeHtml(inv.id)}"><div class="data-copy"><strong>${escapeHtml(inv.id)}</strong><span>${formatDay(inv.date)}</span></div><span style="font-weight:800;font-size:12px">${money(inv.amount)}</span><span class="status-pill tone-ok">${escapeHtml(inv.status)}</span>${icon('chevron',16)}</button>`).join(''):`<div class="empty-inline">No invoices yet.</div>`}</div>
 </section>
 <p class="page-subtitle" style="text-align:center;margin:14px 0 4px">Prototype billing — no payment provider is connected yet.</p>`;
}
function analyticsPage(){
 const hours=[4,6,9,14,22,31,44,58,71,86,74,52,33,18];
 const items=allItems().slice(0,5);
 const head = state.adminSubpage
  ? subHead('Analytics','Useful signals only')
  : `<div class="page-head"><div><div class="eyebrow">Last 7 days</div><h1 class="page-title">Insights</h1><p class="page-subtitle">How guests are using your menu</p></div></div>`;
 return `${head}
 <div class="stat-grid"><div class="card stat"><span>Menu views (7d)</span><strong>1,284</strong><em class="stat-delta up">+12%</em></div><div class="card stat"><span>Scans today</span><strong>163</strong><em class="stat-delta up">+8%</em></div><div class="card stat"><span>Promo interaction</span><strong>18%</strong><em class="stat-delta up">+3pt</em></div><div class="card stat"><span>Avg. time on menu</span><strong>1:47</strong><em class="stat-delta">steady</em></div></div>
 <section class="section"><div class="section-title" style="margin-bottom:10px">Views by hour</div><div class="card" style="padding:14px"><div class="spark">${hours.map((h,i)=>`<i style="height:${Math.max(8,h)}%" class="${h===86?'peak':''}"></i>`).join('')}</div><div class="spark-axis"><span>10:00</span><span>16:00</span><span>23:00</span></div></div></section>
 <section class="section"><div class="section-title" style="margin-bottom:10px">Most viewed dishes</div><div class="card bar-list">${items.map((it,i)=>`<div class="bar-row"><div class="bar-label"><span>${escapeHtml(it.name)}</span><span>${90-i*14}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${90-i*14}%"></div></div></div>`).join('')}</div></section>
 <section class="section"><div class="section-title" style="margin-bottom:10px">Guest languages</div><div class="card bar-list">${[['English',46],['Italian',21],['German',15],['Albanian',12],['Other',6]].map(([n,v])=>`<div class="bar-row"><div class="bar-label"><span>${n}</span><span>${v}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${v}%"></div></div></div>`).join('')}</div></section>
 <section class="section"><div class="section-title" style="margin-bottom:10px">Promotion</div><div class="card signal-row"><div class="signal-icon">${icon('spark',17)}</div><div class="signal-copy"><strong>${escapeHtml(getPromoted()?getPromoted().item.name:'No active promotion')}</strong><span>231 attention events · 41 menu jumps</span></div><div class="signal-value">18%</div></div></section>
 <p class="page-subtitle" style="text-align:center;margin:14px 0 4px">Prototype data — shown to illustrate the reporting shape.</p>`;
}
function settingsPage(){
 const r=state.restaurant;
 return `${subHead('Restaurant settings','Organised by intent')}<div class="form-grid">
 <div class="card" style="padding:14px"><div class="section-title" style="margin-bottom:12px">Identity</div><div class="field"><label>Restaurant name</label><input data-setting="name" value="${escapeHtml(r.name)}"></div><div class="field" style="margin-top:10px"><label>City</label><input data-setting="city" value="${escapeHtml(r.city)}"></div></div>
 <div class="card" style="padding:14px"><div class="section-title" style="margin-bottom:12px">Contact</div><div class="field"><label>Phone</label><input data-setting="phone" value="${escapeHtml(r.phone)}"></div><div class="field" style="margin-top:10px"><label>Address</label><input data-setting="address" value="${escapeHtml(r.address)}"></div></div>
 <div class="card" style="padding:14px"><div class="section-title" style="margin-bottom:12px">Opening hours</div><div class="field"><label>Today</label><input data-setting="hours" value="${escapeHtml(r.hours)}"></div></div>
 <div class="card" style="padding:14px"><div class="section-title" style="margin-bottom:12px">Online</div><div class="field"><label>Instagram</label><input data-setting="instagram" value="${escapeHtml(r.instagram||'')}"></div><div class="field" style="margin-top:10px"><label>Website</label><input data-setting="website" value="${escapeHtml(r.website||'')}"></div></div>
 <div class="card" style="padding:14px"><div class="section-title" style="margin-bottom:12px">Public menu</div><div class="field"><label>Default language</label><select data-setting="defaultLanguage">${languages.slice(0,8).map(l=>`<option ${r.defaultLanguage===l[1]?'selected':''}>${l[1]}</option>`).join('')}</select></div></div>
 </div><p class="page-subtitle" style="text-align:center;margin-top:12px">Changes save automatically in this prototype.</p>`;
}

function weekHours(){
 const fallback=[['Monday',state.restaurant.hours],['Tuesday',state.restaurant.hours],['Wednesday',state.restaurant.hours],['Thursday',state.restaurant.hours],['Friday',state.restaurant.hours],['Saturday',state.restaurant.hours],['Sunday',state.restaurant.hours]];
 const list=(state.ops&&Array.isArray(state.ops.hours)&&state.ops.hours.length)?state.ops.hours:fallback;
 const todayIndex=(new Date().getDay()+6)%7;
 return {list,todayIndex,today:(list[todayIndex]||[])[1]||state.restaurant.hours};
}
function hoursDisclosure(){
 const {list,todayIndex,today}=weekHours();
 const open=!!ui.hoursOpen;
 return `<div class="hours-disclosure ${open?'open':''}">
  <button class="hours-trigger" data-action="toggle-hours" aria-expanded="${open}" aria-controls="hours-panel">${icon('clock',13)}<span>${escapeHtml(today)}</span>${icon(open?'up':'down',13)}</button>
  <div class="hours-panel" id="hours-panel" ${open?'':'hidden'}>
   <div class="hours-panel-head">${icon('calendar',14)} Opening hours</div>
   ${list.map(([day,hrs],idx)=>`<div class="hours-row ${idx===todayIndex?'is-today':''}"><span>${escapeHtml(day)}</span><strong>${escapeHtml(hrs)}</strong></div>`).join('')}
  </div>
 </div>`;
}
function renderPreview(){
 const a=state.appearance; const p=getPromoted();
 const themeClass=state.theme==='dark'?'dark-menu':'';
 const r=state.restaurant;
 const code = langCodeFor(state.preview.language);
 return `<div class="public-root ${themeClass} bg-${a.background} template-${a.template} header-${a.header} typography-${a.typography} images-${a.images} radius-${a.radius==='low'?'low':a.radius==='high'?'high':'medium'} category-${a.categoryBar}" style="--menu-brand:${a.brand};--brand:${a.brand}"><div class="public-scroll" id="public-scroll">
  <header class="public-header">
   <div class="public-banner">${r.banner?`<img src="${escapeHtml(r.banner)}" alt="${escapeHtml(r.name)} restaurant">`:`<div class="banner-placeholder">${icon('image',22)}<span>Banner image</span></div>`}
    <div class="public-head-actions"><button class="public-head-btn" data-action="language-sheet" aria-label="Language">${icon('globe',17)}</button></div>
   </div>
   <div class="restaurant-line"><div class="public-avatar">${r.avatar?`<img src="${escapeHtml(r.avatar)}" alt="">`:`<span class="avatar-placeholder">${icon('image',20)}</span>`}</div><div class="restaurant-copy"><h1>${escapeHtml(r.name)}</h1><div class="restaurant-meta"><span class="open-chip"><i></i>${escapeHtml(r.status)}</span>${hoursDisclosure()}</div></div></div>
   <label class="public-search">${icon('search',17)}<input id="public-search-input" value="${escapeHtml(ui.menuSearch)}" placeholder="Search the menu" autocomplete="off"><span class="lang-code lang-indicator" aria-label="Current language ${escapeHtml(state.preview.language)}">${escapeHtml(code)}</span></label></header>
  ${p&&p.item.promotion.intensity==='strong'&&!state.preview.strongDismissed?`<button class="strong-promo-card reveal-item" data-action="scroll-item" data-id="${p.item.id}"><img src="${p.item.image}" alt=""><div><b>${escapeHtml(p.item.promotion.label)}</b><strong>${escapeHtml(p.item.name)}</strong><span>${escapeHtml(itemIngredients(p.item))}</span></div>${icon('chevron',18)}</button>`:''}
  <div class="category-sticky" id="category-sticky"><nav class="category-strip" id="category-strip">${state.categories.map((c,idx)=>`<button class="category-chip ${idx===0?'active':''} ${state.categoryTakeover.active&&state.categoryTakeover.categoryId===c.id?'takeover':''}" data-action="jump-category" data-id="${c.id}">${escapeHtml(c.name)}</button>`).join('')}</nav></div>
  <main class="menu-sections">${state.categories.map((c,ci)=>renderPublicCategory(c,ci)).join('')}</main>
 </div></div>`;
}

function renderPublicCategory(c,ci){
 const visible=c.items.filter(i=>i.status!=='hidden');
 return `<section class="menu-category ${state.categoryTakeover.active&&state.categoryTakeover.categoryId===c.id?'takeover':''}" id="cat-${c.id}" data-category="${c.id}"><div class="menu-category-head"><h2>${escapeHtml(c.name)}</h2><span>${visible.length} ${visible.length===1?'item':'items'}</span></div><div class="product-list">${visible.map((i,ii)=>renderPublicItem(i,c,ci*4+ii)).join('')}</div></section>`;
}
function renderPublicItem(i,c,idx){
 const p=i.promotion||{}; const promoted=p.active; const ing=itemIngredients(i);
 return `<article class="menu-product reveal-item ${promoted?'is-promoted promo-'+(p.intensity||'subtle')+' promo-style-'+(p.style||state.appearance.promotionStyle):''} ${i.status==='hidden'?'hidden-item':''}" data-item-id="${i.id}" data-search="${escapeHtml((i.name+' '+ing+' '+c.name).toLowerCase())}" style="transition-delay:${Math.min(idx%5*35,140)}ms">${promoted?`<span class="promo-border-label">${escapeHtml(p.label||'Recommended')}</span>`:''}<img class="product-img" src="${i.image}" alt="${escapeHtml(i.name)}" loading="lazy"><div class="product-copy"><h3>${escapeHtml(i.name)}</h3>${ing?`<p>${escapeHtml(ing)}</p>`:''}</div><div class="product-price">${money(i.price)}</div>${i.status==='soldout'?`<div class="product-status">Sold out</div>`:''}</article>`;
}

function renderSuperadmin(){
 const ctx = opsCtx();
 const page = state.adminSubpage ? (HapOps.superSubpages[state.adminSubpage]||HapOps.superPages.overview)(ctx) : (HapOps.superPages[state.adminTab]||HapOps.superPages.overview)(ctx);
 return `<div class="super-shell"><div class="content-scroll"><main class="admin-main">${page}</main></div>${superNav()}</div>`;
}
function superNav(){
 const tabs=[['overview','home','Overview'],['restaurants','building','Restaurants'],['users','users','Users'],['plans','chart','Plans'],['settings','settings','Settings']];
 return `<nav class="admin-bottom-nav">${tabs.map(([id,ic,label])=>`<button class="admin-nav-btn ${state.adminTab===id&&!state.adminSubpage?'active':''}" data-action="super-tab" data-tab="${id}" data-tour="nav-${id}">${icon(ic,21)}<span>${label}</span></button>`).join('')}</nav>`;
}

function renderOverlays(){
 let out='';
 if(ui.sheet) out+=`<div class="overlay" data-action="close-sheet"></div>${renderSheet()}`;
 if(ui.modal==='special') out+=renderSpecialModal();
 if(ui.confirm) out+=renderConfirmModal();
 return out;
}
function renderSheet(){
 if(ui.sheet==='language') return languageSheet();
 if(ui.sheet==='info') return infoSheet();
 if(ui.sheet==='role') return roleSheet();
 if(ui.sheet==='editItem') return editItemSheet();
 if(ui.sheet==='addItem') return addItemSheet();
 if(ui.sheet==='addCategory') return addCategorySheet();
 if(ui.sheet==='promote') return promoteSheet();
 if(ui.sheet==='restaurantDetail') return restaurantDetailSheet();
 if(window.HapOps && HapOps.sheet) return HapOps.sheet(ui.sheet, opsCtx(), sheetShell);
 return '';
}
function sheetShell(title,sub,body){ return `<section class="sheet" role="dialog" aria-modal="true"><div class="sheet-handle"></div><div class="sheet-head"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div><button class="close-btn" data-action="close-sheet">${icon('close',18)}</button></div>${body}</section>`; }
function languageSheet(){
 const q=ui.languageSearch.toLowerCase(); const list=languages.filter(l=>(l[1]+' '+l[2]).toLowerCase().includes(q));
 return sheetShell('Choose menu language','Fast search across a large language catalog.',`<label class="search-field">${icon('search',16)}<input id="language-search" value="${escapeHtml(ui.languageSearch)}" placeholder="Search languages"></label><div class="sheet-label" style="margin-top:14px">${q?'Results':'Suggested + all languages'}</div><div class="language-list">${list.map(l=>`<button class="language-item ${state.preview.language===l[1]?'active':''}" data-action="select-language" data-lang="${escapeHtml(l[1])}"><span class="lang-code">${escapeHtml(l[0])}</span><strong>${escapeHtml(l[1])}</strong><small>${escapeHtml(l[2])}</small>${state.preview.language===l[1]?icon('check',15):''}</button>`).join('')}</div>`);
}
function infoSheet(){ const r=state.restaurant; const {list,todayIndex}=weekHours(); return sheetShell(r.name,r.city,`<div class="settings-list"><div class="card"><div class="hours-panel-head" style="padding:12px 14px 4px">${icon('calendar',14)} Opening hours</div><div style="padding:0 14px 12px">${list.map(([day,hrs],idx)=>`<div class="hours-row ${idx===todayIndex?'is-today':''}"><span>${escapeHtml(day)}</span><strong>${escapeHtml(hrs)}</strong></div>`).join('')}</div></div><div class="card settings-row"><div class="settings-icon">${icon('location',18)}</div><div class="settings-copy"><strong>${escapeHtml(r.address)}</strong><span>Tap directions on your live menu</span></div></div><div class="card settings-row"><div class="settings-icon">${icon('phone',18)}</div><div class="settings-copy"><strong>${escapeHtml(r.phone)}</strong><span>Call the restaurant</span></div></div></div>`); }
function roleSheet(){ return sheetShell('Switch workspace','These are intentionally different products.',`<div class="choice-grid"><button class="choice ${state.role==='restaurant'?'active':''}" data-action="set-role" data-role="restaurant"><strong>Restaurant Admin</strong><span>Menu, promotions, QR, appearance</span></button><button class="choice ${state.role==='super'?'active':''}" data-action="set-role" data-role="super"><strong>Hap Control</strong><span>Restaurants, users, plans, settings</span></button></div>`); }
function editItemSheet(){
 const found=getItem(ui.sheetData?.id); if(!found) return ''; const {item,category}=found;
 return sheetShell('Edit item',category.name,`<form id="edit-item-form" class="form-grid"><input type="hidden" name="id" value="${item.id}"><div class="field"><label>Name</label><input name="name" value="${escapeHtml(item.name)}" required></div><div class="field"><label>Ingredients</label><input name="ingredients" value="${escapeHtml(itemIngredients(item))}" maxlength="90" placeholder="Tomato, mozzarella, basil"><small class="field-hint">Short list shown under the name on the public menu.</small></div><div class="form-row"><div class="field"><label>Price (€)</label><input name="price" type="number" min="0" step="0.1" value="${item.price}"></div><div class="field"><label>Category</label><select name="category">${state.categories.map(c=>`<option value="${c.id}" ${c.id===category.id?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select></div></div><button class="btn primary full" type="button" data-action="save-item-form">Save changes</button><button class="btn danger full" type="button" data-action="delete-item" data-id="${item.id}">${icon('trash',15)} Delete item</button></form>`);
}
function addItemSheet(){ const cat=ui.sheetData?.category||state.categories[0].id; return sheetShell('Add menu item','Photo, name, ingredients, price.',`<form id="add-item-form" class="form-grid"><div class="field"><label>Name</label><input name="name" required placeholder="e.g. Wild Mushroom Risotto"></div><div class="field"><label>Ingredients</label><input name="ingredients" maxlength="90" placeholder="Arborio rice, mushrooms, parmesan"><small class="field-hint">Short list shown under the name on the public menu.</small></div><div class="form-row"><div class="field"><label>Price (€)</label><input name="price" type="number" step="0.1" value="9.5"></div><div class="field"><label>Category</label><select name="category">${state.categories.map(c=>`<option value="${c.id}" ${c.id===cat?'selected':''}>${escapeHtml(c.name)}</option>`).join('')}</select></div></div><div class="field"><label>Photo preset</label><select name="image"><option value="assets/burrata-tomato.webp">Fresh plate</option><option value="assets/penne-arrabbiata.webp">Pasta</option><option value="assets/grilled-octopus.webp">Grill</option><option value="assets/tiramisu.webp">Dessert</option></select></div><button class="btn primary full" type="button" data-tour="sheet-primary" data-action="save-add-item">Add item</button></form>`); }
function addCategorySheet(){ return sheetShell('Add category','Keep category names short and scannable.',`<form id="add-category-form" class="form-grid"><div class="field"><label>Category name</label><input name="name" required placeholder="e.g. Breakfast"></div><button class="btn primary full" type="button" data-action="save-add-category">Add category</button></form>`); }
function promoteSheet(){
 const found=getItem(ui.sheetData?.id); if(!found) return ''; const item=found.item; const p=item.promotion||{};
 const temp=ui.sheetData.temp||{type:p.type||'tonight',intensity:p.intensity||'normal',label:p.label||"Tonight's Pick",style:p.style||state.appearance.promotionStyle}; ui.sheetData.temp=temp;
 const types=[['today','Feature today'],['tonight','Feature tonight'],['new','New item'],['chef',"Chef's pick"],['limited','Limited'],['special','Special price'],['pair','Pair with…']];
 const labels=["Chef's Pick","Tonight's Pick",'Popular','New','House Favourite','Seasonal','Limited','Recommended'];
 return sheetShell(`Promote ${escapeHtml(item.name)}`,'Make it noticeable, not annoying.',`<div class="sheet-section"><div class="sheet-label">What do you want?</div><div class="choice-grid">${types.map(([id,n])=>`<button class="choice ${temp.type===id?'active':''}" data-action="promo-temp" data-key="type" data-value="${id}"><strong>${escapeHtml(n)}</strong><span>${id==='tonight'?'Ends automatically tonight':'Tasteful placement'}</span></button>`).join('')}</div></div><div class="sheet-section"><div class="sheet-label">How noticeable?</div><div class="segment-control">${['subtle','normal','strong'].map(id=>`<button class="${temp.intensity===id?'active':''}" data-action="promo-temp" data-key="intensity" data-value="${id}">${id[0].toUpperCase()+id.slice(1)}</button>`).join('')}</div></div><div class="sheet-section"><div class="sheet-label">Label</div><div class="preset-scroll">${labels.map(l=>`<button class="preset ${temp.label===l?'selected':''}" data-action="promo-temp" data-key="label" data-value="${escapeHtml(l)}"><strong>${escapeHtml(l)}</strong></button>`).join('')}</div></div><div class="sheet-section"><div class="sheet-label">Design</div><div class="gallery-grid">${promotionStyles.slice(0,8).map(([id,n])=>`<button class="promo-tile ${id} ${temp.style===id?'selected':''}" data-action="promo-temp" data-key="style" data-value="${id}"><div class="promo-mini-card"><span class="promo-mini-label">${escapeHtml(n)}</span></div><strong style="font-size:10px">${escapeHtml(n)}</strong></button>`).join('')}</div></div><button class="btn primary full" data-tour="sheet-primary" data-action="save-promotion" data-id="${item.id}">Save promotion</button>${p.active?`<button class="btn full" style="margin-top:8px" data-action="disable-promo" data-id="${item.id}">Disable promotion</button>`:''}`);
}
function restaurantDetailSheet(){
 const r=state.superadmin.restaurants.find(x=>x.id===ui.sheetData?.id); if(!r) return '';
 return sheetShell(r.name,'Restaurant detail',`<div class="stat-grid"><div class="card stat"><span>Owner</span><strong style="font-size:14px;margin-top:7px">${escapeHtml(r.owner)}</strong></div><div class="card stat"><span>Status</span><strong style="font-size:14px;margin-top:7px">${escapeHtml(r.status)}</strong></div><div class="card stat"><span>Views</span><strong>${escapeHtml(r.views)}</strong></div><div class="card stat"><span>Languages</span><strong>${r.languages}</strong></div></div><div class="settings-list" style="margin-top:12px"><div class="card settings-row"><div class="settings-icon">${icon('eye',18)}</div><div class="settings-copy"><strong>Public menu</strong><span>Inspect customer-facing menu</span></div>${icon('chevron',17)}</div><div class="card settings-row"><div class="settings-icon">${icon('qr',18)}</div><div class="settings-copy"><strong>QR</strong><span>Latest QR design</span></div>${icon('chevron',17)}</div><div class="card settings-row"><div class="settings-icon">${icon('activity',18)}</div><div class="settings-copy"><strong>Last activity</strong><span>${escapeHtml(r.last)}</span></div></div></div>`);
}
function renderSpecialModal(){
 const p=getPromoted(); if(!p) return '';
 return `<div class="overlay"></div><div class="special-modal"><button class="close-btn" style="position:absolute;right:14px;top:14px" data-action="close-modal">${icon('close',18)}</button><span class="modal-badge">${icon('spark',13)} ${escapeHtml(p.item.promotion.label)}</span><h2>${escapeHtml(p.item.name)}</h2><p>Something worth noticing — just for tonight.</p><img src="${p.item.image}" alt=""><p>${escapeHtml(itemIngredients(p.item))}</p><div class="price">${money(p.item.price)}</div><button class="btn primary full" data-action="view-special" data-id="${p.item.id}">View on menu ${icon('chevron',15)}</button><button class="btn full" style="margin-top:7px" data-action="close-modal">Maybe later</button></div>`;
}
function renderConfirmModal(){
 const c=ui.confirm;
 return `<div class="overlay" data-action="confirm-cancel"></div><div class="confirm-modal" role="dialog" aria-modal="true"><strong>${escapeHtml(c.title)}</strong><p>${escapeHtml(c.body)}</p><div class="confirm-actions"><button class="btn" data-action="confirm-cancel">Cancel</button><button class="btn ${c.tone==='danger'?'danger':'primary'} full" data-action="confirm-action">${escapeHtml(c.label)}</button></div></div>`;
}

function postRender(){
 document.documentElement.style.setProperty('--brand',state.appearance.brand);
 if(ui.sheet || ui.modal || ui.confirm){
  const overlay = document.querySelector('.sheet, .special-modal, .confirm-modal');
  if(overlay){
   const first = overlay.querySelector('input, select, textarea, button');
   if(first) setTimeout(()=>first.focus(), 0);
  }
 } else {
  restoreFocus();
 }
 requestAnimationFrame(()=>{
  document.querySelectorAll('.reveal-item').forEach((el,i)=>{ if(!('IntersectionObserver' in window)){el.classList.add('visible');return;} });
  setupReveal(); setupPublicObservers(); renderLiveQr(); mountTour();
 });
 if(state.mode==='preview'&&!state.preview.languageConfirmed&&!ui.sheet&&!ui.modal){ setTimeout(()=>{ ui.sheet='language'; render(); },80); }
}
function setupReveal(){
 const els=[...document.querySelectorAll('.reveal-item')];
 if(!els.length) return;
 if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('visible'));return;}
 const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}}),{root:document.getElementById('public-scroll'),rootMargin:'0px 0px -8% 0px',threshold:.08});
 els.forEach(e=>obs.observe(e));
}
function setupPublicObservers(){
 if(state.mode!=='preview') return;
 const scroller=document.getElementById('public-scroll'); if(!scroller) return;
 const sticky=document.getElementById('category-sticky');
 const updateActive=()=>{
  const sections=[...document.querySelectorAll('.menu-category')].filter(s=>s.style.display!=='none');
  if(!sections.length) return;
  const scrollerTop=scroller.getBoundingClientRect().top;
  const marker=scrollerTop+Math.min(170,scroller.clientHeight*.28);
  let current=sections[0];
  for(const sec of sections){ if(sec.getBoundingClientRect().top<=marker) current=sec; else break; }
  setActiveCategory(current.dataset.category);
 };
 let ticking=false;
 scroller.addEventListener('scroll',()=>{
  sticky?.classList.toggle('stuck',sticky.getBoundingClientRect().top<=document.querySelector('.prototype-bar').getBoundingClientRect().bottom+1);
  if(!ticking){ ticking=true; requestAnimationFrame(()=>{updateActive();ticking=false;}); }
 },{passive:true});
 updateActive();
 if('IntersectionObserver' in window){
  const po=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('promo-attention'); po.unobserve(e.target);} }),{root:scroller,rootMargin:'-28% 0px -35% 0px',threshold:.45}); document.querySelectorAll('.menu-product.is-promoted').forEach(p=>po.observe(p));
 }
 const search=document.getElementById('public-search-input'); search?.addEventListener('input',e=>{ui.menuSearch=e.target.value;filterPublicItems(e.target.value);updateActive();});
}
function setActiveCategory(id){ document.querySelectorAll('.category-chip').forEach(b=>b.classList.toggle('active',b.dataset.id===id)); const active=document.querySelector(`.category-chip[data-id="${CSS.escape(id)}"]`); const strip=document.getElementById('category-strip'); if(active&&strip){ const left=active.offsetLeft-(strip.clientWidth-active.offsetWidth)/2; strip.scrollTo({left:Math.max(0,left),behavior:'smooth'}); } }
function scrollToCategory(id){ const scroller=document.getElementById('public-scroll'); const target=document.getElementById(`cat-${id}`); const sticky=document.getElementById('category-sticky'); if(!scroller||!target)return; const top=target.getBoundingClientRect().top-scroller.getBoundingClientRect().top+scroller.scrollTop-(sticky?.offsetHeight||0)-4; scroller.scrollTo({top:Math.max(0,top),behavior:'smooth'}); }
function filterPublicItems(q){ const t=q.trim().toLowerCase(); document.querySelectorAll('.menu-product').forEach(el=>el.style.display=!t||el.dataset.search.includes(t)?'':'none'); document.querySelectorAll('.menu-category').forEach(sec=>{ const any=[...sec.querySelectorAll('.menu-product')].some(el=>el.style.display!=='none'); sec.style.display=any?'':'none'; }); }
function tourStep(){ return TOUR_STEPS[Math.min(state.tour.step,TOUR_STEPS.length-1)]; }
function applyTourNav(i){
 const nav=TOUR_STEPS[i]&&TOUR_STEPS[i].nav; if(!nav) return;
 if(nav.role) state.role=nav.role;
 if(nav.mode) state.mode=nav.mode;
 if(nav.tab){ state.adminTab=nav.tab; state.adminSubpage=null; }
 if(nav.expand) ui.expandedCategory=nav.expand;
}
function startTour(){ state.tour={active:true,step:0,done:false}; state.mode='admin'; state.role='restaurant'; state.adminTab='home'; state.adminSubpage=null; ui.sheet=null; ui.modal=null; applyTourNav(0); save(); render(); }
function tourNext(){
 const next=state.tour.step+1;
 if(next>=TOUR_STEPS.length){ endTour(true); return; }
 state.tour.step=next; applyTourNav(next); save(); render();
}
function tourBack(){ if(state.tour.step===0) return; state.tour.step-=1; applyTourNav(state.tour.step); save(); render(); }
function endTour(completed){ state.tour={active:false,step:0,done:true}; save(); toast(completed?'You are all set':'Tour skipped — replay it from More'); render(); }
function mountTour(){
 document.getElementById('tour-layer')?.remove();
 if(!state.tour||!state.tour.active) return;
 const phone=document.querySelector('.phone-app'); if(!phone) return;
 const step=tourStep(); const idx=Math.min(state.tour.step,TOUR_STEPS.length-1);
 let el=step.target?phone.querySelector('[data-tour="'+step.target+'"]'):null;
 if(el){
  const scroller=el.closest('.content-scroll,.public-scroll,.sheet');
  if(scroller){
   const er=el.getBoundingClientRect(), sr=scroller.getBoundingClientRect();
   if(er.top<sr.top+10||er.bottom>sr.bottom-10) scroller.scrollTop+=(er.top-sr.top)-(sr.height/2-er.height/2);
  }
 }
 const pr=phone.getBoundingClientRect();
 const layer=document.createElement('div'); layer.id='tour-layer'; layer.className='tour-layer';
 let html='';
 let below=true, spotBottom=0, spotTop=0;
 if(el){
  const r=el.getBoundingClientRect(); const pad=7;
  const x=Math.max(0,r.left-pr.left-pad), y=Math.max(0,r.top-pr.top-pad);
  const w=Math.min(pr.width-x,r.width+pad*2), h=Math.min(pr.height-y,r.height+pad*2);
  spotTop=y; spotBottom=y+h; below=(y+h)<pr.height*0.52;
  html+=`<div class="tour-dim" style="left:0;top:0;width:100%;height:${y}px"></div>`;
  html+=`<div class="tour-dim" style="left:0;top:${y+h}px;width:100%;bottom:0"></div>`;
  html+=`<div class="tour-dim" style="left:0;top:${y}px;width:${x}px;height:${h}px"></div>`;
  html+=`<div class="tour-dim" style="left:${x+w}px;top:${y}px;right:0;height:${h}px"></div>`;
  html+=`<div class="tour-ring" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`;
 } else {
  html+=`<div class="tour-dim" style="inset:0"></div>`;
 }
 const dots=TOUR_STEPS.map((_,i)=>`<i class="${i===idx?'on':i<idx?'past':''}"></i>`).join('');
 const cardPos=el?(below?`top:${spotBottom+14}px`:`bottom:${Math.max(12,pr.height-spotTop+14)}px`):'top:50%;transform:translateY(-50%)';
 html+=`<div class="tour-card${el?'':' tour-card-center'}" style="${cardPos}">
  <div class="tour-top"><span class="tour-count">${idx+1} / ${TOUR_STEPS.length}</span><button class="tour-skip" data-action="tour-skip">Skip</button></div>
  <h3>${escapeHtml(step.title)}</h3>
  <p>${escapeHtml(step.body)}</p>
  <div class="tour-dots">${dots}</div>
  <div class="tour-actions">
   ${idx>0?`<button class="tour-ghost" data-action="tour-back">Back</button>`:''}
   ${step.tap?`<span class="tour-tap">${icon('spark',13)} Tap the highlighted control</span>`:`<button class="tour-cta" data-action="tour-next">${escapeHtml(step.cta||'Next')} ${icon('chevron',14)}</button>`}
  </div>
 </div>`;
 layer.innerHTML=html;
 phone.appendChild(layer);
}
let tourTick=false;
window.addEventListener('resize',()=>{ if(state.tour&&state.tour.active) mountTour(); });
document.addEventListener('scroll',()=>{
 if(!state.tour||!state.tour.active||tourTick) return; tourTick=true;
 requestAnimationFrame(()=>{ mountTour(); tourTick=false; });
},true);

app.addEventListener('click',e=>{
 if(state.tour&&state.tour.active){
  const st=tourStep();
  if(st&&st.tap&&st.target&&e.target.closest('[data-tour="'+st.target+'"]')) setTimeout(()=>{ if(state.tour.active) tourNext(); },0);
 }
 const btn=e.target.closest('[data-action]'); if(!btn) return; const a=btn.dataset.action;
 const opensOverlay = ['language-sheet','info-sheet','role-sheet','open-add-item','open-add-category','edit-item','promote-item','restaurant-detail','open-sheet'].includes(a);
 if(opensOverlay) rememberFocus(btn);
 if(a==='switch-mode'){ state.mode=btn.dataset.mode; if(state.mode==='admin'){state.preview.promoSeen=true;} save(); ui.sheet=null; ui.modal=null; render(); return; }
 if(a==='theme-toggle'){ state.theme=state.theme==='dark'?'light':'dark'; state.appearance.mode=state.theme; save(); render(); return; }
 if(a==='set-theme'){ state.theme=btn.dataset.theme; state.appearance.mode=state.theme; save(); render(); return; }
 if(a==='admin-tab'){ state.role='restaurant'; state.adminTab=btn.dataset.tab; state.adminSubpage=null; ui.skeleton=true; save(); render(); setTimeout(()=>{ui.skeleton=false; render();},180); return; }
 if(a==='super-tab'){ state.adminTab=btn.dataset.tab; state.adminSubpage=null; ui.skeleton=true; save(); render(); setTimeout(()=>{ui.skeleton=false; render();},180); return; }
 if(a==='admin-subpage'){ state.adminSubpage=btn.dataset.page; save(); render(); return; }
 if(a==='billing-placeholder'){ toast(`${btn.dataset.what} isn't connected in the prototype`); return; }
 if(a==='subpage-back'){ state.adminSubpage=null; render(); return; }
 if(a==='toggle-category'){ ui.expandedCategory=ui.expandedCategory===btn.dataset.id?null:btn.dataset.id; render(); return; }
 if(a==='open-add-item'){ ui.sheet='addItem'; ui.sheetData={category:btn.dataset.category||ui.expandedCategory||state.categories[0].id}; render(); return; }
 if(a==='open-add-category'){ ui.sheet='addCategory'; ui.sheetData={}; render(); return; }
 if(a==='edit-item'){ ui.sheet='editItem'; ui.sheetData={id:btn.dataset.id}; render(); return; }
 if(a==='promote-item'){ ui.sheet='promote'; ui.sheetData={id:btn.dataset.id,temp:null}; render(); return; }
 if(a==='cycle-status'){ const f=getItem(btn.dataset.id); if(f){ f.item.status=f.item.status==='available'?'soldout':f.item.status==='soldout'?'hidden':'available'; save(); toast(`Status: ${f.item.status}`); render(); } return; }
 if(a==='move-item'){ moveItem(btn.dataset.id,btn.dataset.dir); return; }
 if(a==='delete-item'){ deleteItem(btn.dataset.id); return; }
 if(a==='save-item-form'){ saveEditItemForm(); return; }
 if(a==='save-add-item'){ saveAddItemForm(); return; }
 if(a==='save-add-category'){ saveAddCategoryForm(); return; }
 if(a==='disable-promo'){ const f=getItem(btn.dataset.id); if(f){f.item.promotion={active:false};save();ui.sheet=null;toast('Promotion disabled');render();} return; }
 if(a==='promo-temp'){ ui.sheetData.temp={...(ui.sheetData.temp||{}),[btn.dataset.key]:btn.dataset.value}; render(); return; }
 if(a==='save-promotion'){ savePromotion(btn.dataset.id); return; }
 if(a==='toggle-takeover'){ state.categoryTakeover.active=!state.categoryTakeover.active; save(); render(); return; }
 if(a==='promo-style'){ state.appearance.promotionStyle=btn.dataset.style; const p=getPromoted(); if(p){p.item.promotion.style=btn.dataset.style;} save(); toast('Promotion style applied'); render(); return; }
 if(a==='appearance'){ state.appearance[btn.dataset.key]=btn.dataset.value; save(); render(); return; }
 if(a==='brand-color'){ state.appearance.brand=btn.dataset.color; save(); render(); return; }
 if(a==='pick-template'){ state.appearance.template=btn.dataset.value; save(); toast(`${(templates.find(t=>t[0]===btn.dataset.value)||[])[1]||'Template'} applied`); render(); return; }
 if(a==='qr-style'){ state.qrStyle=btn.dataset.style; save(); render(); return; }
 if(a==='download-qr'){ downloadLiveQr(); return; }
 if(a==='share-preview'){ sharePreview(); return; }
 if(a==='toggle-hours'){ ui.hoursOpen=!ui.hoursOpen; render(); return; }
 if(a==='language-sheet'){ ui.sheet='language'; render(); return; }
 if(a==='info-sheet'){ ui.sheet='info'; render(); return; }
 if(a==='role-sheet'){ ui.sheet='role'; render(); return; }
 if(a==='set-role'){ state.role=btn.dataset.role; state.mode='admin'; state.adminTab=state.role==='super'?'overview':'home'; state.adminSubpage=null; ui.sheet=null; save(); render(); return; }
 if(a==='close-sheet'){ ui.sheet=null; ui.sheetData=null; render(); return; }
 if(a==='select-language'){ state.preview.language=btn.dataset.lang; state.preview.languageConfirmed=true; ui.sheet=null; save(); render(); if(!state.preview.promoSeen&&getPromoted()){ setTimeout(()=>{ui.modal='special';state.preview.promoSeen=true;save();render();},1400);} return; }
 if(a==='close-modal'){ ui.modal=null; state.preview.promoSeen=true; save(); render(); return; }
 if(a==='view-special'){ const id=btn.dataset.id; ui.modal=null; render(); setTimeout(()=>document.querySelector(`[data-item-id="${CSS.escape(id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),80); return; }
 if(a==='jump-category'){ setActiveCategory(btn.dataset.id); scrollToCategory(btn.dataset.id); return; }
 if(a==='scroll-item'){ document.querySelector(`[data-item-id="${CSS.escape(btn.dataset.id)}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}); return; }
 if(a==='reset-demo'){ showConfirm({title:'Reset all prototype changes?',body:'This restores the original Sofra demo and clears any edits you made.',label:'Reset demo',tone:'danger',run(){ localStorage.removeItem(STORAGE_KEY); state=defaultState(); ui={sheet:null,sheetData:null,modal:null,expandedCategory:'popular',menuSearch:'',superSearch:'',languageSearch:'',editingItem:null,adminSearch:'',menuFilter:'all',superFilter:'all',userFilter:'all',subId:null,userSearch:'',confirm:null,skeleton:false,lastFocus:null}; save(); toast('Demo restored'); render(); }}); return; }
 if(a==='replay-onboarding'||a==='tour-start'){ startTour(); return; }
 if(a==='new-customer'){ state.preview.languageConfirmed=false; state.preview.promoSeen=false; state.preview.strongDismissed=false; state.mode='preview'; ui.sheet=null;ui.modal=null;save();render();return; }
 if(a==='tour-skip'){ endTour(false); return; }
 if(a==='tour-next'){ tourNext(); return; }
 if(a==='tour-back'){ tourBack(); return; }
 if(a==='restaurant-detail'){ ui.sheet='restaurantDetail';ui.sheetData={id:btn.dataset.id};render();return; }
 if(a==='open-sheet'){ ui.sheet=btn.dataset.sheet; ui.sheetData={id:btn.dataset.id,rid:btn.dataset.rid,cid:btn.dataset.cid,iid:btn.dataset.iid}; render(); return; }
 if(a==='confirm-action'){ const c=ui.confirm; ui.confirm=null; if(c&&c.run){ c.run(); } else { render(); } return; }
 if(a==='confirm-cancel'){ ui.confirm=null; render(); return; }
 if(a==='toggle-open'){ state.restaurant.status=state.restaurant.status==='Open'?'Closed':'Open'; save(); toast(state.restaurant.status==='Open'?'Open now':'Closed now'); render(); return; }
 if(a==='toggle-hide-soldout'){ state.hideSoldOut=!state.hideSoldOut; save(); render(); return; }
 if(a==='menu-filter'){ ui.menuFilter=btn.dataset.filter; render(); return; }
 if(a==='restock-all'){ allItems().forEach(i=>{if(i.status==='soldout')i.status='available';}); save(); toast('All dishes restocked'); render(); return; }
 if(window.HapOps && HapOps.actions(a, btn, opsCtx())) return;
});

app.addEventListener('change',e=>{
 const el=e.target;
 if(el.matches('[data-action="takeover-category"]')){ state.categoryTakeover.categoryId=el.value; save(); render(); return; }
 if(el.matches('[data-action="brand-custom"]')){ state.appearance.brand=el.value; save(); render(); return; }
 if(el.matches('[data-setting]')){ state.restaurant[el.dataset.setting]=el.value; save(); toast('Saved'); return; }
});
app.addEventListener('input',e=>{
 if(e.target.id==='language-search'){ ui.languageSearch=e.target.value; const pos=e.target.selectionStart; render(); const n=document.getElementById('language-search'); if(n){n.focus();n.setSelectionRange(pos,pos);} }
 if(e.target.id==='super-search'){ ui.superSearch=e.target.value; const pos=e.target.selectionStart; render(); const n=document.getElementById('super-search'); if(n){n.focus();n.setSelectionRange(pos,pos);} }
 if(e.target.id==='user-search'){ ui.userSearch=e.target.value; const pos=e.target.selectionStart; render(); const n=document.getElementById('user-search'); if(n){n.focus();n.setSelectionRange(pos,pos);} }
 if(e.target.id==='admin-search'){ ui.adminSearch=e.target.value; const pos=e.target.selectionStart; render(); const n=document.getElementById('admin-search'); if(n){n.focus();n.setSelectionRange(pos,pos);} }
});
function saveEditItemForm(){
 const form=document.getElementById('edit-item-form'); if(!form) return;
 const fd=new FormData(form); const f=getItem(fd.get('id')); if(!f) return; const oldCat=f.category;
 f.item.name=String(fd.get('name')||'').trim(); f.item.ingredients=String(fd.get('ingredients')||'').trim(); f.item.price=Number(fd.get('price'))||0;
 const newCat=state.categories.find(c=>c.id===fd.get('category')); if(newCat&&newCat!==oldCat){ oldCat.items=oldCat.items.filter(x=>x.id!==f.item.id); newCat.items.push(f.item); ui.expandedCategory=newCat.id; }
 save(); ui.sheet=null; toast('Item updated'); render();
}
function saveAddItemForm(){
 const form=document.getElementById('add-item-form'); if(!form) return; const fd=new FormData(form); const cat=state.categories.find(c=>c.id===fd.get('category'))||state.categories[0];
 const id='item-'+Date.now(); cat.items.push({id,name:String(fd.get('name')||'').trim()||'Untitled item',ingredients:String(fd.get('ingredients')||'').trim(),price:Number(fd.get('price'))||0,image:fd.get('image'),status:'available',promotion:{active:false}});
 save(); ui.sheet=null; ui.expandedCategory=cat.id; toast('Item added'); render();
}
function saveAddCategoryForm(){
 const form=document.getElementById('add-category-form'); if(!form) return; const fd=new FormData(form); const name=String(fd.get('name')||'').trim(); if(!name) return;
 const id=(name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'category')+'-'+Date.now().toString().slice(-4); state.categories.push({id,name,items:[]});
 save(); ui.sheet=null; ui.expandedCategory=id; toast('Category added'); render();
}

app.addEventListener('submit',e=>{ e.preventDefault(); if(e.target.id==='edit-item-form') saveEditItemForm(); if(e.target.id==='add-item-form') saveAddItemForm(); if(e.target.id==='add-category-form') saveAddCategoryForm(); });

function moveItem(id,dir){ const f=getItem(id);if(!f)return;const arr=f.category.items;const idx=arr.findIndex(x=>x.id===id);const next=dir==='up'?idx-1:idx+1;if(next<0||next>=arr.length)return;[arr[idx],arr[next]]=[arr[next],arr[idx]];save();render(); }
function deleteItem(id){ showConfirm({title:'Delete this item?',body:'This removes it from the menu immediately.',label:'Delete item',tone:'danger',run(){ for(const c of state.categories)c.items=c.items.filter(i=>i.id!==id);save();ui.sheet=null;toast('Item deleted');render(); }}); }
function savePromotion(id){ const f=getItem(id);if(!f)return;
 for(const c of state.categories)for(const i of c.items)if(i.id!==id&&i.promotion?.active)i.promotion.active=false;
 f.item.promotion={active:true,...ui.sheetData.temp};state.appearance.promotionStyle=ui.sheetData.temp.style;state.preview.promoSeen=false;save();ui.sheet=null;toast('Promotion is live in Preview');render(); }

// Offline QR encoder for the live deployed Preview URL.
// Fixed QR Version 5-L (37x37), byte mode. This keeps the Netlify package dependency-free.
function qrGalois(){
 const exp=new Array(512),log=new Array(256); let x=1;
 for(let i=0;i<255;i++){exp[i]=x;log[x]=i;x<<=1;if(x&0x100)x^=0x11d;}
 for(let i=255;i<512;i++)exp[i]=exp[i-255]; return {exp,log};
}
const QR_GF=qrGalois();
function qrMul(a,b){ if(a===0||b===0)return 0; return QR_GF.exp[QR_GF.log[a]+QR_GF.log[b]]; }
function qrGenerator(degree){ let g=[1]; for(let i=0;i<degree;i++){ const next=new Array(g.length+1).fill(0); for(let j=0;j<g.length;j++){next[j]^=g[j];next[j+1]^=qrMul(g[j],QR_GF.exp[i]);} g=next;} return g; }
function qrEcc(data,degree=26){ const gen=qrGenerator(degree),res=new Array(degree).fill(0); for(const byte of data){const factor=byte^res[0];res.shift();res.push(0);for(let j=0;j<degree;j++)res[j]^=qrMul(gen[j+1],factor);}return res; }
function qrBitsToBytes(url){
 const bytes=[...new TextEncoder().encode(url)]; if(bytes.length>104) throw new Error('Preview URL is too long for the prototype QR');
 const bits=[]; const push=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push((val>>>i)&1);};
 push(0b0100,4); push(bytes.length,8); bytes.forEach(b=>push(b,8));
 const cap=108*8; for(let i=0;i<4&&bits.length<cap;i++)bits.push(0); while(bits.length%8)bits.push(0);
 const out=[]; for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|(bits[i+j]||0);out.push(b);} let pad=0; while(out.length<108){out.push(pad++%2===0?0xec:0x11);} return out;
}
function qrBchDigit(data){let d=0;while(data!==0){d++;data>>>=1;}return d;}
function qrFormatInfo(mask){ let data=(1<<3)|mask; let d=data<<10; const g=0x537; while(qrBchDigit(d)-qrBchDigit(g)>=0)d^=g<<(qrBchDigit(d)-qrBchDigit(g)); return ((data<<10)|d)^0x5412; }
function qrMatrix(url){
 const n=37,m=Array.from({length:n},()=>Array(n).fill(null));
 const finder=(row,col)=>{for(let r=-1;r<=7;r++)for(let c=-1;c<=7;c++){const y=row+r,x=col+c;if(y<0||y>=n||x<0||x>=n)continue;const dark=r>=0&&r<=6&&c>=0&&c<=6&&(r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4));m[y][x]=dark;}};
 finder(0,0);finder(n-7,0);finder(0,n-7);
 const align=(cy,cx)=>{if(m[cy][cx]!==null)return;for(let r=-2;r<=2;r++)for(let c=-2;c<=2;c++)m[cy+r][cx+c]=Math.abs(r)===2||Math.abs(c)===2||(r===0&&c===0);}; align(30,30);
 for(let i=8;i<n-8;i++){if(m[i][6]===null)m[i][6]=i%2===0;if(m[6][i]===null)m[6][i]=i%2===0;}
 const setFormat=(test)=>{const data=qrFormatInfo(0);for(let i=0;i<15;i++){const mod=!test&&((data>>i)&1)===1;if(i<6)m[i][8]=mod;else if(i<8)m[i+1][8]=mod;else m[n-15+i][8]=mod;if(i<8)m[8][n-i-1]=mod;else if(i<9)m[8][15-i]=mod;else m[8][15-i-1]=mod;}m[n-8][8]=!test;};
 setFormat(true);
 const data=qrBitsToBytes(url),code=data.concat(qrEcc(data,26)); let bit=0,row=n-1,inc=-1;
 for(let col=n-1;col>0;col-=2){if(col===6)col--;while(true){for(let c=0;c<2;c++){const x=col-c;if(m[row][x]===null){let dark=false;if(bit<code.length*8)dark=((code[Math.floor(bit/8)]>>>(7-(bit%8)))&1)===1;if((row+x)%2===0)dark=!dark;m[row][x]=dark;bit++;}}row+=inc;if(row<0||row>=n){row-=inc;inc=-inc;break;}}}
 setFormat(false); return m;
}
function renderLiveQr(){
 const canvas=document.getElementById('live-qr'); if(!canvas)return; const url=publicMenuUrl();
 try{const matrix=qrMatrix(url),quiet=4,size=matrix.length+quiet*2,scale=8;canvas.width=size*scale;canvas.height=size*scale;const ctx=canvas.getContext('2d');ctx.fillStyle='#fffaf2';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#25221f';for(let y=0;y<matrix.length;y++)for(let x=0;x<matrix.length;x++)if(matrix[y][x])ctx.fillRect((x+quiet)*scale,(y+quiet)*scale,scale,scale);canvas.dataset.qrUrl=url;}catch(e){canvas.style.display='none';}
}
function downloadLiveQr(){const canvas=document.getElementById('live-qr');if(!canvas)return;const a=document.createElement('a');a.download=`${state.restaurant.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-menu-qr.png`;a.href=canvas.toDataURL('image/png');a.click();toast('QR downloaded');}

function publicMenuUrl(){ const slug=(state.restaurant.name||'menu').toLowerCase().replace(/[^a-z0-9]+/g,'-'); return location.origin+'/menu/'+slug; }
async function sharePreview(){ const url=publicMenuUrl(); try{ if(navigator.share) await navigator.share({title:`${state.restaurant.name} menu`,url}); else {await navigator.clipboard.writeText(url);toast('Preview link copied');} }catch(e){} }

// Pathname routing: the requested screen arrives as ?p=. Legacy #preview / #admin
// fragments are translated once so old QR / shared links keep working.
const legacyPath = location.hash==='#preview' ? '/preview' : (location.hash==='#admin' ? '/admin' : null);
const bootPath = QS.get('p') || legacyPath || '/';
applyPath(bootPath);
if(legacyPath){ try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} }
if(PUBLIC_CTX){
 state.mode='preview'; state.preview.languageConfirmed=true; state.tour={active:false,step:0,done:true};
 const match = PUBLIC_SLUG && (state.superadmin.restaurants||[]).find(r=>r.id===PUBLIC_SLUG);
 if(match) state.restaurant={...state.restaurant,name:match.name};
}
lastPath = currentPath();
if(!state.tour) state.tour={active:false,step:0,done:false};
if(PUBLIC_CTX||bootPath!=='/'){ if(state.tour.active) state.tour={active:false,step:0,done:state.tour.done}; }
else if(!state.tour.done&&!state.tour.active&&state.mode==='admin'){ state.tour={active:true,step:0,done:false}; }

// Close sheets and modals with Escape.
document.addEventListener('keydown',e=>{
 if(e.key!=='Escape') return;
 if(ui.confirm){ ui.confirm=null; render(); }
 else if(ui.sheet){ ui.sheet=null; ui.sheetData=null; render(); }
 else if(ui.modal){ ui.modal=null; render(); }
});

save(); render();
})();
