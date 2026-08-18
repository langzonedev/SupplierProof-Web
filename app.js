const STORE_KEY='supplierproof.public-demo.v2';
const blank={profile:{},evidence:[],activeRequest:null,requests:[]};
let state;
try{state=JSON.parse(localStorage.getItem(STORE_KEY)||'null')||JSON.parse(JSON.stringify(blank));}catch{state=JSON.parse(JSON.stringify(blank));}
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const normal=s=>(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const uid=()=>`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const today=()=>new Date().toISOString().slice(0,10);
const save=()=>{localStorage.setItem(STORE_KEY,JSON.stringify(state));renderDashboard();};
const keywords={
 'public liability insurance':['public liability','liability insurance'],
 'professional indemnity insurance':['professional indemnity','pi insurance'],
 'workers compensation insurance':['workers compensation','workcover','workers comp'],
 'whs policy':['whs','work health safety','workplace health safety','safety policy'],
 'cyber security policy':['cyber','information security','cyber security'],
 'privacy policy':['privacy','personal information'],
 'trade licence':['licence','license','electrical contractor','trade licence'],
 'environmental policy':['environment','environmental'],
 'modern slavery statement':['modern slavery','slavery statement'],
 'business continuity plan':['business continuity','disaster recovery','continuity plan']
};

function showView(id){
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('is-active',v.id===id));
 document.querySelectorAll('.step').forEach(b=>b.classList.toggle('is-active',b.dataset.view===id));
 document.getElementById('workspace')?.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelectorAll('.step').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('.next').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.next)));

function isExpired(e){return !!(e.expiryDate&&e.expiryDate<today());}
function renderDashboard(){
 const expired=state.evidence.filter(isExpired).length;
 const review=state.evidence.filter(e=>e.review==='Needs review').length;
 $('dashboard').innerHTML=`<article><span>Supplier</span><strong>${esc(state.profile.businessName||'Not set up')}</strong></article><article><span>Reusable evidence</span><strong>${state.evidence.length}</strong><small>${expired} expired · ${review} review</small></article><article><span>Customer responses</span><strong>${state.requests.length}</strong><small>saved in this browser</small></article>`;
 $('workspaceSummary').textContent=state.profile.businessName?`${state.profile.businessName} · ${state.evidence.length} evidence item${state.evidence.length===1?'':'s'} · ${state.requests.length} saved request${state.requests.length===1?'':'s'}`:'Your workspace is saved in this browser.';
}

function hydrateProfile(){['businessName','abn','contact','email','industry','region','businessType'].forEach(k=>$(k).value=state.profile[k]||'');$('profile-status').textContent=state.profile.businessName?'Saved':'Not started';}
$('saveProfile').addEventListener('click',()=>{
 state.profile={businessName:$('businessName').value.trim(),abn:$('abn').value.trim(),contact:$('contact').value.trim(),email:$('email').value.trim(),industry:$('industry').value,region:$('region').value.trim(),businessType:$('businessType').value.trim()};save();hydrateProfile();
});

function evidenceHealth(e){if(isExpired(e))return['Expired','bad'];if(e.review==='Needs review')return['Needs review','review'];return['Current','good'];}
function renderEvidence(){
 $('evidence-count').textContent=`${state.evidence.length} item${state.evidence.length===1?'':'s'}`;
 if(!state.evidence.length){$('evidenceList').innerHTML='<div class="empty">No evidence yet. Add an item or load the sample pack.</div>';return;}
 $('evidenceList').innerHTML=state.evidence.map(e=>{const [health,cls]=evidenceHealth(e);return `<article class="evidence-item"><div class="row"><div><strong>${esc(e.type)}</strong><div class="meta">${esc(e.ref||'No reference')}</div></div><span class="pill ${cls}">${health}</span></div><div class="meta">Owner: ${esc(e.owner||'Unassigned')} · Issued ${e.issueDate||'—'} · Review/expiry ${e.expiryDate||'not set'}</div>${e.notes?`<div>${esc(e.notes)}</div>`:''}<div class="item-actions"><button class="mini" data-review-evidence="${e.id}">Toggle review</button><button class="mini danger" data-remove-evidence="${e.id}">Remove</button></div></article>`}).join('');
 document.querySelectorAll('[data-review-evidence]').forEach(b=>b.onclick=()=>{const e=state.evidence.find(x=>x.id===b.dataset.reviewEvidence);if(e){e.review=e.review==='Needs review'?'Current':'Needs review';save();renderEvidence();renderResults();}});
 document.querySelectorAll('[data-remove-evidence]').forEach(b=>b.onclick=()=>{state.evidence=state.evidence.filter(x=>x.id!==b.dataset.removeEvidence);save();renderEvidence();renderResults();});
}
$('addEvidence').addEventListener('click',()=>{
 state.evidence.push({id:uid(),type:$('evidenceType').value,ref:$('evidenceRef').value.trim(),owner:$('evidenceOwner').value.trim(),review:$('evidenceReview').value,issueDate:$('issueDate').value,expiryDate:$('expiryDate').value,notes:$('evidenceNotes').value.trim()});save();renderEvidence();['evidenceRef','evidenceOwner','issueDate','expiryDate','evidenceNotes'].forEach(id=>$(id).value='');$('evidenceReview').value='Current';
});
$('loadSamples').addEventListener('click',()=>{
 if(state.evidence.length&&!confirm('Add the synthetic starter pack to the evidence already saved?'))return;
 const y=new Date().getFullYear();
 [
 ['Public liability insurance','SAMPLE-PL-1001 / Example Mutual','Finance Manager','Current',`${y}-01-15`,`${y+1}-01-14`,'Synthetic $20m liability policy'],
 ['Workers compensation insurance','SAMPLE-WC-2044 / Example Cover','Office Manager','Current',`${y}-02-01`,`${y+1}-01-31`,'Synthetic employer cover'],
 ['WHS policy','WHS-POL-01','Operations Manager','Current',`${y}-03-10`,'','Reviewed safety management policy'],
 ['Cyber security policy','CYBER-POL-02','IT Support','Current',`${y-2}-04-05`,`${y-1}-04-04`,'Deliberately expired sample'],
 ['Trade licence','SA-ELEC-SAMPLE-77','Director','Current',`${y}-05-12`,`${y+2}-05-11`,'Synthetic electrical contractor licence'],
 ['Privacy policy','PRIV-POL-03','Director','Needs review',`${y-2}-06-01`,'','Existing policy flagged for review']
 ].forEach(x=>state.evidence.push({id:uid(),type:x[0],ref:x[1],owner:x[2],review:x[3],issueDate:x[4],expiryDate:x[5],notes:x[6]}));save();renderEvidence();
});

$('loadBuyerSample').addEventListener('click',()=>{
 $('buyerName').value='Example Facilities Group';$('requestRef').value='2026 contractor onboarding';$('portal').value='Customer procurement portal';$('requirements').value='Current public liability insurance\nWorkers compensation insurance\nWHS policy\nCyber security policy\nElectrical contractor licence\nEnvironmental management policy\nPrivacy policy';const d=new Date();d.setDate(d.getDate()+14);$('dueDate').value=d.toISOString().slice(0,10);
});
function autoMatch(text){
 const q=normal(text),candidates=[];
 state.evidence.forEach(e=>{const keys=keywords[e.type.toLowerCase()]||normal(e.type).split(' ');let score=0;keys.forEach(k=>{if(q.includes(k))score+=4;else normal(k).split(' ').forEach(w=>{if(w.length>4&&q.includes(w))score++;});});if(score)candidates.push({e,score});});
 candidates.sort((a,b)=>b.score-a.score);
 if(!candidates.length)return{status:'Missing',evidenceId:null,reason:'No supporting evidence found.'};
 const e=candidates[0].e;if(isExpired(e))return{status:'Expired',evidenceId:e.id,reason:'Evidence found, but its review date has passed.'};if(e.review==='Needs review'||candidates[0].score<4)return{status:'Needs review',evidenceId:e.id,reason:'Possible evidence found. Please review it.'};return{status:'Matched',evidenceId:e.id,reason:'Suggested match. Please confirm it.'};
}
$('runMatch').addEventListener('click',()=>{
 const reqs=$('requirements').value.split(/\n+/).map(x=>x.trim()).filter(Boolean);if(!reqs.length){alert('Add at least one customer requirement.');return;}
 state.activeRequest={id:uid(),buyer:$('buyerName').value.trim()||'Unnamed customer',ref:$('requestRef').value.trim(),dueDate:$('dueDate').value,portal:$('portal').value.trim(),createdAt:new Date().toISOString(),notes:'',requirements:reqs.map(text=>({id:uid(),text,...autoMatch(text)}))};save();renderResults();showView('results');
});

const getEvidence=id=>state.evidence.find(e=>e.id===id);
function renderResults(){
 const r=state.activeRequest;if(!r){$('resultsList').innerHTML='<div class="empty">No active request.</div>';$('resultScore').textContent='No request';$('resultIntro').textContent='Add a customer request to see readiness.';$('responseNotes').value='';return;}
 const ready=r.requirements.filter(x=>x.status==='Matched').length;$('resultIntro').textContent=`${r.buyer} · ${r.requirements.length} requirements · ${state.evidence.length} evidence items`;$('resultScore').textContent=`${ready}/${r.requirements.length} ready`;$('responseNotes').value=r.notes||'';
 const cls={Matched:'good',Missing:'bad',Expired:'warn','Needs review':'review'};
 $('resultsList').innerHTML=r.requirements.map(x=>{const e=getEvidence(x.evidenceId);return `<article class="result-item"><div class="row"><div><strong>${esc(x.text)}</strong>${e?`<div class="meta">Evidence: ${esc(e.type)} · ${esc(e.ref||'No reference')}</div>`:''}</div><span class="pill ${cls[x.status]}">${x.status}</span></div><div>${esc(x.reason)}</div><div class="review-controls"><label>Human decision<select data-status="${x.id}">${['Matched','Missing','Expired','Needs review'].map(v=>`<option${v===x.status?' selected':''}>${v}</option>`).join('')}</select></label><label>Supporting evidence<select data-evidence="${x.id}"><option value="">None</option>${state.evidence.map(ev=>`<option value="${ev.id}"${ev.id===x.evidenceId?' selected':''}>${esc(ev.type)} — ${esc(ev.ref||'No ref')}</option>`).join('')}</select></label></div></article>`}).join('');
 document.querySelectorAll('[data-status]').forEach(s=>s.onchange=()=>{const x=r.requirements.find(q=>q.id===s.dataset.status);x.status=s.value;x.reason='Reviewed by you.';save();renderResults();});
 document.querySelectorAll('[data-evidence]').forEach(s=>s.onchange=()=>{const x=r.requirements.find(q=>q.id===s.dataset.evidence);x.evidenceId=s.value||null;save();renderResults();});
}
$('responseNotes').addEventListener('input',()=>{if(state.activeRequest){state.activeRequest.notes=$('responseNotes').value;save();}});
$('saveResponse').addEventListener('click',()=>{
 if(!state.activeRequest){alert('Create a customer request first.');return;}
 state.activeRequest.notes=$('responseNotes').value.trim();state.activeRequest.savedAt=new Date().toISOString();
 const copy=JSON.parse(JSON.stringify(state.activeRequest));const i=state.requests.findIndex(x=>x.id===copy.id);if(i>=0)state.requests[i]=copy;else state.requests.unshift(copy);save();renderHistory();$('saveResponse').textContent='Saved';setTimeout(()=>$('saveResponse').textContent='Save reviewed response',1200);
});

function renderHistory(){
 $('history-count').textContent=`${state.requests.length} saved`;
 if(!state.requests.length){$('requestHistory').innerHTML='<div class="empty">No saved responses yet.</div>';return;}
 $('requestHistory').innerHTML=state.requests.map(r=>{const ready=r.requirements.filter(x=>x.status==='Matched').length;return `<article class="history-item"><div class="row"><div><strong>${esc(r.buyer)}</strong><div class="meta">${esc(r.ref||'No reference')} · ${r.dueDate?`due ${r.dueDate}`:'no due date'} · ${esc(r.portal||'channel not recorded')}</div></div><span class="status-pill">${ready}/${r.requirements.length} ready</span></div><div class="meta">Saved ${new Date(r.savedAt||r.createdAt).toLocaleString()}</div><div class="item-actions"><button class="mini" data-open-request="${r.id}">Open</button><button class="mini danger" data-delete-request="${r.id}">Delete</button></div></article>`}).join('');
 document.querySelectorAll('[data-open-request]').forEach(b=>b.onclick=()=>{state.activeRequest=JSON.parse(JSON.stringify(state.requests.find(x=>x.id===b.dataset.openRequest)));save();renderResults();showView('results');});
 document.querySelectorAll('[data-delete-request]').forEach(b=>b.onclick=()=>{state.requests=state.requests.filter(x=>x.id!==b.dataset.deleteRequest);save();renderHistory();});
}
function summary(){
 const r=state.activeRequest;if(!r)return'No SupplierProof customer request has been mapped yet.';
 return [`SupplierProof response summary`,`Supplier: ${state.profile.businessName||'Not supplied'}`,`Customer: ${r.buyer}`,`Reference: ${r.ref||'Not supplied'}`,`Due: ${r.dueDate||'Not supplied'}`,`Channel: ${r.portal||'Not supplied'}`,'','Important: this prototype organises sample evidence and does not certify compliance.','',...r.requirements.map((x,i)=>{const e=getEvidence(x.evidenceId);return `${i+1}. [${x.status}] ${x.text}${e?`\n   Evidence: ${e.type} — ${e.ref||'No reference'}`:''}\n   ${x.reason}`;}),'',`Internal notes: ${r.notes||'None'}`].join('\n');
}
$('copySummary').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary());$('copySummary').textContent='Copied';setTimeout(()=>$('copySummary').textContent='Copy summary',1200);}catch{alert('Clipboard access is unavailable in this browser.');}});
$('downloadSummary').addEventListener('click',()=>{const blob=new Blob([summary()],{type:'text/plain'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`supplierproof-${(state.activeRequest?.buyer||'request').toLowerCase().replace(/[^a-z0-9]+/g,'-')}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);});
$('newRequest').addEventListener('click',()=>{state.activeRequest=null;save();['buyerName','requestRef','dueDate','portal','requirements'].forEach(id=>$(id).value='');renderResults();showView('request');});
$('resetDemo').addEventListener('click',()=>{if(confirm('Reset all SupplierProof sample data saved in this browser?')){localStorage.removeItem(STORE_KEY);location.reload();}});

hydrateProfile();renderEvidence();renderResults();renderHistory();renderDashboard();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));