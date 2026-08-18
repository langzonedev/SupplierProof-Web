const STORE_KEY='supplierproof.public-demo.v1';
const emptyState={profile:{},evidence:[],lastRequest:null};
const state=JSON.parse(localStorage.getItem(STORE_KEY)||JSON.stringify(emptyState));
const $=id=>document.getElementById(id);
const save=()=>localStorage.setItem(STORE_KEY,JSON.stringify(state));
const normal=s=>(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ');

const publicDemoKeywords={
  'public liability insurance':['public liability','liability insurance'],
  'workers compensation insurance':['workers compensation','workcover','workers comp'],
  'whs policy':['whs','work health safety','workplace health safety','safety policy'],
  'cyber security policy':['cyber','information security','cyber security'],
  'trade licence':['licence','license','electrical contractor','trade licence'],
  'environmental policy':['environment','environmental'],
  'modern slavery statement':['modern slavery','slavery statement']
};

function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('is-active',v.id===id));
  document.querySelectorAll('.step').forEach(b=>b.classList.toggle('is-active',b.dataset.view===id));
  document.querySelector('.workspace')?.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelectorAll('.step').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('.next').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.next)));

function hydrateProfile(){
  ['businessName','abn','contact','email','businessType'].forEach(k=>$(k).value=state.profile[k]||'');
  $('profile-status').textContent=state.profile.businessName?'Saved':'Not started';
}
$('saveProfile').addEventListener('click',()=>{
  state.profile={businessName:$('businessName').value.trim(),abn:$('abn').value.trim(),contact:$('contact').value.trim(),email:$('email').value.trim(),businessType:$('businessType').value.trim()};
  save();hydrateProfile();
});

function isExpired(item){return item.expiryDate&&new Date(item.expiryDate+'T23:59:59')<new Date();}
function renderEvidence(){
  $('evidence-count').textContent=`${state.evidence.length} item${state.evidence.length===1?'':'s'}`;
  if(!state.evidence.length){$('evidenceList').innerHTML='<div class="empty">No evidence yet. Add a synthetic record or load the sample set.</div>';return;}
  $('evidenceList').innerHTML=state.evidence.map((e,i)=>`<article class="evidence-item"><div class="row"><div><strong>${escapeHtml(e.type)}</strong><div class="meta">${escapeHtml(e.ref||'No reference')}</div></div><button class="remove" data-remove="${i}">Remove</button></div><div class="meta">Issued: ${e.issueDate||'—'} · Expires: ${e.expiryDate||'No expiry supplied'}</div>${e.notes?`<div class="meta">${escapeHtml(e.notes)}</div>`:''}<span class="pill ${isExpired(e)?'bad':'good'}">${isExpired(e)?'Expired':'Available'}</span></article>`).join('');
  document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{state.evidence.splice(Number(b.dataset.remove),1);save();renderEvidence();}));
}
$('addEvidence').addEventListener('click',()=>{
  state.evidence.push({type:$('evidenceType').value,ref:$('evidenceRef').value.trim(),issueDate:$('issueDate').value,expiryDate:$('expiryDate').value,notes:$('evidenceNotes').value.trim()});
  save();renderEvidence();['evidenceRef','issueDate','expiryDate','evidenceNotes'].forEach(id=>$(id).value='');
});
$('loadSamples').addEventListener('click',()=>{
  if(state.evidence.length&&!confirm('Add five synthetic records to the current sample library?'))return;
  const year=new Date().getFullYear();
  state.evidence.push(
    {type:'Public liability insurance',ref:'SAMPLE-PL-1001 / Example Mutual',issueDate:`${year}-01-15`,expiryDate:`${year+1}-01-14`,notes:'Synthetic $20m policy record'},
    {type:'Workers compensation insurance',ref:'SAMPLE-WC-2044 / Example Cover',issueDate:`${year}-02-01`,expiryDate:`${year+1}-01-31`,notes:'Synthetic employer cover'},
    {type:'WHS policy',ref:'WHS-POL-01',issueDate:`${year}-03-10`,expiryDate:'',notes:'Sample safety policy'},
    {type:'Cyber security policy',ref:'CYBER-POL-02',issueDate:`${year-2}-04-05`,expiryDate:`${year-1}-04-04`,notes:'Deliberately expired sample'},
    {type:'Trade licence',ref:'SA-ELEC-SAMPLE-77',issueDate:`${year}-05-12`,expiryDate:`${year+2}-05-11`,notes:'Synthetic electrical contractor licence'}
  );save();renderEvidence();
});

$('loadBuyerSample').addEventListener('click',()=>{
  $('buyerName').value='Example Facilities Group';
  $('requirements').value='Current public liability insurance\nWorkers compensation insurance\nWHS policy\nCyber security policy\nElectrical contractor licence\nEnvironmental management policy';
});
function matchRequirement(req){
  const q=normal(req);let candidates=[];
  state.evidence.forEach(e=>{
    const keys=publicDemoKeywords[e.type.toLowerCase()]||normal(e.type).split(' ');
    const hay=normal(`${e.type} ${e.ref} ${e.notes}`);
    const score=keys.reduce((n,k)=>n+(q.includes(k)?3:(normal(k).split(' ').some(w=>w.length>4&&q.includes(w))?1:0))+(hay.includes(q)&&q.length>5?1:0),0);
    if(score>0)candidates.push({e,score});
  });
  candidates.sort((a,b)=>b.score-a.score);
  if(!candidates.length)return{requirement:req,status:'Missing',evidence:null,reason:'No likely evidence found in this sample library.'};
  const best=candidates[0];
  if(isExpired(best.e))return{requirement:req,status:'Expired',evidence:best.e,reason:'A likely supporting record exists, but its sample expiry date has passed.'};
  if(best.score<3)return{requirement:req,status:'Needs review',evidence:best.e,reason:'A possible demo match exists, but a person should review the relationship.'};
  return{requirement:req,status:'Matched',evidence:best.e,reason:'Likely demo match based on public sample keywords. Human review is still required.'};
}
$('runMatch').addEventListener('click',()=>{
  const requirements=$('requirements').value.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  if(!requirements.length){alert('Add at least one buyer requirement.');return;}
  state.lastRequest={buyer:$('buyerName').value.trim()||'Unnamed buyer',createdAt:new Date().toISOString(),requirements:requirements.map(matchRequirement)};
  save();renderResults();showView('results');
});
function renderResults(){
  const r=state.lastRequest;
  if(!r){$('resultsList').innerHTML='<div class="empty">No buyer request has been mapped yet.</div>';$('resultScore').textContent='No request';return;}
  const matched=r.requirements.filter(x=>x.status==='Matched').length;
  $('resultIntro').textContent=`${r.buyer}: ${r.requirements.length} requirements mapped against ${state.evidence.length} reusable sample records.`;
  $('resultScore').textContent=`${matched}/${r.requirements.length} matched`;
  const cls={Matched:'good',Missing:'bad','Needs review':'review',Expired:'warn'};
  $('resultsList').innerHTML=r.requirements.map(x=>`<article class="result-item"><div class="row"><strong>${escapeHtml(x.requirement)}</strong><span class="pill ${cls[x.status]}">${x.status}</span></div><div>${escapeHtml(x.reason)}</div>${x.evidence?`<div class="meta">Supporting sample: <strong>${escapeHtml(x.evidence.type)}</strong> · ${escapeHtml(x.evidence.ref||'No reference')} · expiry ${x.evidence.expiryDate||'not supplied'}</div>`:''}</article>`).join('');
}
function summary(){
  if(!state.lastRequest)return'No SupplierProof buyer request has been mapped yet.';
  const r=state.lastRequest;
  return[`SupplierProof demo response summary`,`Supplier: ${state.profile.businessName||'Not supplied'}`,`Buyer: ${r.buyer}`,`Generated: ${new Date(r.createdAt).toLocaleString()}`,'','Important: this prototype organises sample evidence and does not certify compliance.','',...r.requirements.map((x,i)=>`${i+1}. [${x.status}] ${x.requirement}${x.evidence?`\n   Sample evidence: ${x.evidence.type} — ${x.evidence.ref||'No reference'}`:''}\n   ${x.reason}`)].join('\n');
}
$('copySummary').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary());$('copySummary').textContent='Copied';setTimeout(()=>$('copySummary').textContent='Copy summary',1400);}catch{alert('Clipboard access is unavailable in this browser.');}});
$('downloadSummary').addEventListener('click',()=>{const blob=new Blob([summary()],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`supplierproof-demo-${(state.lastRequest?.buyer||'request').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.txt`;a.click();URL.revokeObjectURL(a.href);});
$('newRequest').addEventListener('click',()=>{$('buyerName').value='';$('requirements').value='';showView('request');});
$('resetDemo').addEventListener('click',()=>{if(confirm('Reset all SupplierProof sample data in this browser?')){localStorage.removeItem(STORE_KEY);location.reload();}});

hydrateProfile();renderEvidence();renderResults();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
