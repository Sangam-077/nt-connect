
const embedded = window.REMOTE_CONNECTIVITY_DATA || {};
const state = {
  mobile: Array.isArray(embedded.mobile) ? embedded.mobile : [],
  blackspots: Array.isArray(embedded.blackspots) ? embedded.blackspots : [],
  boundary: embedded.boundary || null,
  filtered: [],
  selected: null,
  selectedPriority: null,
  savedPacks: new Set(),
  priorityMode: "combined",
  rankingSort: {key:"gap_index", direction:"desc"},
  simulatedOffline: false
};

const $ = id => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";
const fmt = v => (v === null || v === undefined || v === "" || Number.isNaN(v)) ? "Not available" : v;
const clamp = (x,min,max) => Math.max(min, Math.min(max,x));

function setNetworkStatus(){
  const online = navigator.onLine && !state.simulatedOffline;
  const el = $("networkStatus");
  el.textContent = online ? "● Online" : "● Offline — local data";
  el.className = online ? "status online" : "status offline";
}
window.addEventListener("online",setNetworkStatus);
window.addEventListener("offline",setNetworkStatus);

function safeGetSaved(){
  try{
    const arr = JSON.parse(localStorage.getItem("remoteConnectivitySavedLocations") || "[]");
    if(Array.isArray(arr)) state.savedPacks = new Set(arr);
  }catch(e){}
}
function persistSavedPacks(){
  try{localStorage.setItem("remoteConnectivitySavedLocations",JSON.stringify([...state.savedPacks]));}catch(e){}
  const count=state.savedPacks.size;
  $("offlineSavedCount").textContent=`${count} location${count===1?"":"s"} saved offline`;
}
function uniqueSorted(values){return [...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)))}
function fillSelect(id,values){
  const s=$(id);
  uniqueSorted(values).forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;s.appendChild(o)})
}

function project(lon,lat,w=1000,h=900){
  const minLon=128.5,maxLon=138.5,minLat=-26.5,maxLat=-10.0;
  const x=70+((lon-minLon)/(maxLon-minLon))*(w-140);
  const y=55+((maxLat-lat)/(maxLat-minLat))*(h-110);
  return [x,y];
}
function geometryToPath(geometry,w=1000,h=900){
  const parts=[];
  const drawRing=ring=>{
    if(!ring?.length)return;
    const [x0,y0]=project(ring[0][0],ring[0][1],w,h);
    let d=`M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
    for(let i=1;i<ring.length;i++){const [x,y]=project(ring[i][0],ring[i][1],w,h);d+=` L ${x.toFixed(2)} ${y.toFixed(2)}`}
    parts.push(d+" Z");
  };
  if(geometry?.type==="Polygon")geometry.coordinates.forEach(drawRing);
  else if(geometry?.type==="MultiPolygon")geometry.coordinates.forEach(poly=>poly.forEach(drawRing));
  return parts.join(" ");
}
function addBoundary(svg,w=1000,h=900){
  const feature=state.boundary?.features?.[0]; if(!feature)return;
  const p=document.createElementNS(NS,"path");p.setAttribute("d",geometryToPath(feature.geometry,w,h));p.setAttribute("class","nt-boundary");svg.appendChild(p)
}

function searchCombined(query){
  const q=query.trim().toLowerCase(); if(!q)return [];
  const mobileMatches=state.mobile.filter(r=>String(r.site_name||"").toLowerCase().includes(q)).slice(0,6).map(r=>({type:"mobile",label:r.site_name,sub:`${r.site_type} · ${r.coverage_type}`,row:r}));
  const bsMatches=state.blackspots.filter(r=>String(r.location||"").toLowerCase().includes(q)).slice(0,4).map(r=>({type:"blackspot",label:r.location,sub:`Black Spot · ${r.site_status}`,row:r}));
  return [...mobileMatches,...bsMatches].slice(0,8);
}
function renderSearchResults(){
  const box=$("searchResults"), q=$("searchInput").value;
  const results=searchCombined(q);
  if(!q.trim()||!results.length){box.hidden=true;box.innerHTML="";return}
  box.innerHTML="";
  results.forEach(item=>{
    const b=document.createElement("button");b.type="button";b.className="search-result";
    b.innerHTML=`${item.label}<small>${item.sub}</small>`;
    b.addEventListener("click",()=>{
      $("searchInput").value=item.label; box.hidden=true;
      if(item.type==="mobile"){selectLocation(item.row); state.filtered=[item.row]; renderMap()}
      else{selectBlackspot(item.row)}
    });
    box.appendChild(b);
  });
  box.hidden=false;
}

function renderMap(){
  const svg=$("mapSvg");svg.innerHTML="";addBoundary(svg,1000,900);
  if($("toggleMobile").checked){
    state.filtered.forEach(row=>{
      const lon=Number(row.longitude),lat=Number(row.latitude);if(!Number.isFinite(lon)||!Number.isFinite(lat))return;
      const [x,y]=project(lon,lat);const c=document.createElementNS(NS,"circle");c.setAttribute("cx",x);c.setAttribute("cy",y);c.setAttribute("r",5);
      c.setAttribute("class","mobile-marker"+(state.selected?.site_name===row.site_name?" selected":""));c.setAttribute("tabindex","0");
      c.addEventListener("click",()=>selectLocation(row));c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();selectLocation(row)}});
      const t=document.createElementNS(NS,"title");t.textContent=`${row.site_name} — ${row.coverage_type}`;c.appendChild(t);svg.appendChild(c)
    });
  }
  if($("toggleBlackspots").checked){
    state.blackspots.forEach(row=>{
      const lon=Number(row.longitude),lat=Number(row.latitude);if(!Number.isFinite(lon)||!Number.isFinite(lat))return;
      const [x,y]=project(lon,lat);const p=document.createElementNS(NS,"path");p.setAttribute("d",`M ${x} ${y-7} L ${x-6} ${y+5} L ${x+6} ${y+5} Z`);p.setAttribute("class","blackspot-marker");p.setAttribute("tabindex","0");
      p.addEventListener("click",()=>selectBlackspot(row));p.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();selectBlackspot(row)}});
      const t=document.createElementNS(NS,"title");t.textContent=`Black Spot: ${row.location} — ${row.site_status}`;p.appendChild(t);svg.appendChild(p)
    });
  }
  $("mapEmpty").hidden=state.filtered.length!==0;$("visibleCount").textContent=`${state.filtered.length} locations shown`
}
function applyFilters(){
  const q=$("searchInput").value.trim().toLowerCase(),provider=$("providerFilter").value,coverage=$("coverageFilter").value,site=$("siteFilter").value,remote=$("remotenessFilter").value;
  state.filtered=state.mobile.filter(row=>(!q||String(row.site_name||"").toLowerCase().includes(q))&&(!provider||row.provider===provider)&&(!coverage||row.coverage_type===coverage)&&(!site||row.site_type===site)&&(!remote||row.remoteness===remote));
  renderMap();
}
function detailRow(label,value){return `<div class="detail-row"><span>${label}</span><strong>${fmt(value)}</strong></div>`}
function selectLocation(row){
  state.selected=row;$("detailEmpty").hidden=true;$("detailContent").hidden=false;$("detailName").textContent=row.site_name;
  $("detailRows").innerHTML=[
    detailRow("Site type",row.site_type),detailRow("Population",row.population),detailRow("Provider",row.provider),detailRow("Coverage",row.coverage_type),
    detailRow("Remoteness",row.remoteness),detailRow("Nearest Black Spot",row.nearest_mbsp_location),
    detailRow("Distance to nearest project",row.nearest_mbsp_distance_km!=null?`${row.nearest_mbsp_distance_km} km`:null),
    detailRow("Nearest project status",row.nearest_mbsp_status),
    detailRow("Inside supplied NBN fixed-line layer",row.nbn_fixedline_2024?"Yes":"No")
  ].join("");
  const saved=state.savedPacks.has(row.site_name);$("savePack").disabled=false;$("saveSelectedOffline").disabled=false;
  $("savePack").textContent=saved?"Saved offline ✓":"Save this location offline";$("saveSelectedOffline").textContent=saved?"Saved offline ✓":`Save ${row.site_name} offline`;
  $("saveMessage").textContent=saved?"This location is already stored in this browser.":"";
  renderMap()
}
function selectBlackspot(row){
  state.selected=null;$("detailEmpty").hidden=true;$("detailContent").hidden=false;$("detailName").textContent=`Black Spot: ${row.location}`;
  $("detailRows").innerHTML=[detailRow("Project ID",row.mbsp_id),detailRow("Round",row.round),detailRow("Grantee",row.grantee),detailRow("Remoteness",row.remoteness),detailRow("Base station type",row.base_station_type),detailRow("Status",row.site_status),detailRow("Solution category",row.solution_category),detailRow("LGA",row.lga)].join("");
  $("savePack").disabled=true;$("saveSelectedOffline").disabled=true;$("savePack").textContent="Offline save is for mobile locations";$("saveSelectedOffline").textContent="Select a mobile location to save"
}

function downloadBlob(filename,text,type){
  const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)
}
function downloadJson(filename,payload){downloadBlob(filename,JSON.stringify(payload,null,2),"application/json")}
function downloadPack(row){
  const pack={generated_at:new Date().toISOString(),note:"Offline community pack generated from Remote Connectivity NT.",caution:"Infrastructure/program records do not directly measure mobile signal quality or reliability.",location:row};
  state.savedPacks.add(row.site_name);persistSavedPacks();
  try{localStorage.setItem(`remoteConnectivityLocation:${row.site_name}`,JSON.stringify(pack))}catch(e){}
  downloadJson(`${String(row.site_name).toLowerCase().replace(/[^a-z0-9]+/g,"_")}_offline_pack.json`,pack);
  $("savePack").textContent="Saved offline ✓";$("saveSelectedOffline").textContent="Saved offline ✓";$("saveMessage").textContent="Saved locally and downloaded as a JSON community pack."
}

/* Transparent, illustrative scoring */
const maxKnownPop = Math.max(...state.mobile.map(r=>Number(r.population)||0),1);
function mobileGap(r){
  let s=80;
  if(r.macro_cell)s-=50;
  if(r.small_cell)s-=25;
  if(r.proximity_to_cell)s-=5;
  return clamp(s,5,95);
}
function nbnGap(r){return r.nbn_fixedline_2024?15:85}
function remoteGap(r){
  const x=String(r.remoteness||"");
  if(x.includes("Very Remote"))return 90;
  if(x.includes("Remote"))return 65;
  if(x.includes("Outer Regional"))return 45;
  if(x.includes("Inner Regional"))return 25;
  return 35;
}
function interventionGap(r){
  const d=Number(r.nearest_mbsp_distance_km);
  if(!Number.isFinite(d))return 70;
  if(r.mbsp_within_20km && r.nearest_mbsp_status==="In Progress")return 20;
  if(r.mbsp_within_20km)return 35;
  if(d<=50)return 55;
  if(d<=100)return 70;
  return 90;
}
function populationImpact(r){
  const p=Number(r.population);
  if(!Number.isFinite(p)||p<=0)return 20;
  return Math.round(clamp((Math.log1p(p)/Math.log1p(maxKnownPop))*100,10,100));
}
function weights(){
  return {
    mobile:Number($("wMobile").value),nbn:Number($("wNbn").value),remote:Number($("wRemote").value),
    intervention:Number($("wIntervention").value),population:Number($("wPopulation").value)
  };
}
function scoredRow(r){
  const comps={mobile_gap:mobileGap(r),nbn_gap:nbnGap(r),remote_gap:remoteGap(r),intervention_gap:interventionGap(r),population_impact:populationImpact(r)};
  const w=weights();const total=w.mobile+w.nbn+w.remote+w.intervention+w.population||1;
  const gap=(comps.mobile_gap*w.mobile+comps.nbn_gap*w.nbn+comps.remote_gap*w.remote+comps.intervention_gap*w.intervention+comps.population_impact*w.population)/total;
  return {...r,...comps,gap_index:Math.round(gap)};
}
function rankedCommunities(){
  return state.mobile.filter(r=>["COMMUNITY","VILLAGE"].includes(r.site_type)&&Number(r.population)>0).map(scoredRow)
}
function scoreClass(score){return score>=65?"high":score>=45?"moderate":"low"}
function modeScore(r){
  const s=scoredRow(r);
  return state.priorityMode==="mobile"?s.mobile_gap:state.priorityMode==="nbn"?s.nbn_gap:state.priorityMode==="remote"?s.remote_gap:state.priorityMode==="intervention"?s.intervention_gap:state.priorityMode==="population"?s.population_impact:s.gap_index;
}
function pointRadius(r){const p=Number(r.population)||0;return clamp(5+Math.sqrt(p)/7,5,14)}

function renderPriorityMap(){
  const svg=$("priorityMapSvg");svg.innerHTML="";addBoundary(svg,1000,760);
  rankedCommunities().forEach(r=>{
    const [x,y]=project(Number(r.longitude),Number(r.latitude),1000,760);const score=modeScore(r);
    const c=document.createElementNS(NS,"circle");c.setAttribute("cx",x);c.setAttribute("cy",y);c.setAttribute("r",pointRadius(r));c.setAttribute("class",`priority-point score-${scoreClass(score)}${state.selectedPriority?.site_name===r.site_name?" selected":""}`);
    c.setAttribute("tabindex","0");c.addEventListener("click",()=>selectPriority(r));c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();selectPriority(r)}});
    const t=document.createElementNS(NS,"title");t.textContent=`${r.site_name}: ${Math.round(score)}/100`;c.appendChild(t);svg.appendChild(c)
  })
}
function recommendations(s){
  const drivers=[
    ["Mobile infrastructure",s.mobile_gap],["NBN fixed-line",s.nbn_gap],["Remoteness",s.remote_gap],["Intervention distance",s.intervention_gap],["Population impact",s.population_impact]
  ].sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);
  const recs=[];
  if(drivers.includes("Mobile infrastructure"))recs.push("Validate on-the-ground mobile performance and investigate whether co-location, a dedicated small cell or macro-cell upgrade is feasible before investment.");
  if(drivers.includes("NBN fixed-line"))recs.push("Check the actual NBN technology serving the location; this prototype only knows the fixed-line layer, so fixed wireless and satellite must be verified.");
  if(drivers.includes("Remoteness"))recs.push("Prioritise resilient power, backhaul and offline-first access to essential digital services because of the location's remoteness.");
  if(drivers.includes("Intervention distance"))recs.push("Review nearby Mobile Black Spot Program activity and whether a future co-investment or infrastructure-sharing opportunity exists.");
  if(drivers.includes("Population impact"))recs.push("Include the number of residents and local service users affected when comparing this location with other investment candidates.");
  return recs.slice(0,2);
}
function selectPriority(r){
  const s=scoredRow(r);state.selectedPriority=s;
  const top=[["Mobile coverage gap",s.mobile_gap],["NBN fixed-line gap",s.nbn_gap],["Remoteness",s.remote_gap],["Intervention distance",s.intervention_gap],["Population impact",s.population_impact]].sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]).join(", ");
  $("priorityDetail").innerHTML=`<h3>${s.site_name} — Gap Index: ${s.gap_index}/100</h3><div>Population: ${fmt(s.population)} · largest drivers: ${top}</div><div class="driver-grid">
    <div class="driver-box"><span>Mobile</span><strong>${s.mobile_gap}</strong></div><div class="driver-box"><span>NBN fixed-line</span><strong>${s.nbn_gap}</strong></div>
    <div class="driver-box"><span>Remoteness</span><strong>${s.remote_gap}</strong></div><div class="driver-box"><span>Intervention</span><strong>${s.intervention_gap}</strong></div>
    <div class="driver-box"><span>Population</span><strong>${s.population_impact}</strong></div></div>
    ${recommendations(s).map(x=>`<div class="recommendation">${x}</div>`).join("")}`;
  renderPriorityMap()
}
function renderRanking(){
  const rows=rankedCommunities();const {key,direction}=state.rankingSort;const dir=direction==="asc"?1:-1;
  rows.sort((a,b)=>{const av=a[key],bv=b[key];if(typeof av==="string")return av.localeCompare(bv)*dir;return ((Number(av)||0)-(Number(bv)||0))*dir});
  const body=$("rankingTable").querySelector("tbody");body.innerHTML="";
  rows.forEach(r=>{
    const tr=document.createElement("tr");tr.innerHTML=`<td>${r.site_name}</td><td>${fmt(r.population)}</td><td>${r.mobile_gap}</td><td>${r.nbn_gap}</td><td>${r.remote_gap}</td><td>${r.intervention_gap}</td><td>${r.population_impact}</td><td><span class="score-badge badge-${scoreClass(r.gap_index)}">${r.gap_index}</span></td>`;
    tr.addEventListener("click",()=>{selectPriority(r);document.querySelector("#priority").scrollIntoView({behavior:"smooth",block:"start"})});body.appendChild(tr)
  })
}
function updatePriority(){
  ["Mobile","Nbn","Remote","Intervention","Population"].forEach(name=>{$("v"+name).textContent=$( "w"+name).value});
  renderPriorityMap();renderRanking();
  if(state.selectedPriority)selectPriority(state.selectedPriority)
}
function rankingCsv(){
  const rows=rankedCommunities().sort((a,b)=>b.gap_index-a.gap_index);
  const headers=["community","population","mobile_gap","nbn_fixedline_gap","remoteness","intervention_distance","population_impact","gap_index"];
  const lines=[headers.join(",")];
  rows.forEach(r=>lines.push([r.site_name,r.population,r.mobile_gap,r.nbn_gap,r.remote_gap,r.intervention_gap,r.population_impact,r.gap_index].map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")));
  return lines.join("\n");
}

function initialize(){
  safeGetSaved();persistSavedPacks();setNetworkStatus();state.filtered=[...state.mobile];
  fillSelect("providerFilter",state.mobile.map(d=>d.provider));fillSelect("coverageFilter",state.mobile.map(d=>d.coverage_type));fillSelect("siteFilter",state.mobile.map(d=>d.site_type));fillSelect("remotenessFilter",state.mobile.map(d=>d.remoteness));
  $("metricLocations").textContent=state.mobile.length;$("metricVeryRemote").textContent=state.mobile.filter(d=>d.remoteness==="Very Remote Australia").length;$("metricBlackSpots").textContent=state.blackspots.length;$("metricInProgress").textContent=state.blackspots.filter(d=>d.site_status==="In Progress").length;
  $("dataStatus").textContent=`Local data ready: ${state.mobile.length} locations + ${state.blackspots.length} Black Spot projects`;
  $("healthText").textContent=`${state.mobile.length} mobile locations and ${state.blackspots.length} Black Spot projects loaded locally.`;
  renderMap();updatePriority()
}

$("searchInput").addEventListener("input",()=>{renderSearchResults();applyFilters()});
["providerFilter","coverageFilter","siteFilter","remotenessFilter"].forEach(id=>$(id).addEventListener("change",applyFilters));
["toggleMobile","toggleBlackspots"].forEach(id=>$(id).addEventListener("change",renderMap));
$("resetFilters").addEventListener("click",()=>{$("searchInput").value="";["providerFilter","coverageFilter","siteFilter","remotenessFilter"].forEach(id=>$(id).value="");$("searchResults").hidden=true;applyFilters()});
$("savePack").addEventListener("click",()=>{if(state.selected)downloadPack(state.selected)});
$("saveSelectedOffline").addEventListener("click",()=>{if(state.selected)downloadPack(state.selected)});
$("downloadFiltered").addEventListener("click",()=>downloadJson("remote_connectivity_filtered_locations.json",{generated_at:new Date().toISOString(),count:state.filtered.length,locations:state.filtered}));
document.querySelectorAll(".mode-pill").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".mode-pill").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.priorityMode=b.dataset.mode;renderPriorityMap()}));
["wMobile","wNbn","wRemote","wIntervention","wPopulation"].forEach(id=>$(id).addEventListener("input",updatePriority));
$("resetWeights").addEventListener("click",()=>{$("wMobile").value=35;$("wNbn").value=20;$("wRemote").value=20;$("wIntervention").value=15;$("wPopulation").value=10;updatePriority()});
$("communityPreset").addEventListener("click",()=>{$("wMobile").value=25;$("wNbn").value=15;$("wRemote").value=25;$("wIntervention").value=10;$("wPopulation").value=25;updatePriority()});
document.querySelectorAll("#rankingTable th[data-sort]").forEach(th=>th.addEventListener("click",()=>{const key=th.dataset.sort;if(state.rankingSort.key===key)state.rankingSort.direction=state.rankingSort.direction==="asc"?"desc":"asc";else state.rankingSort={key,direction:key==="site_name"?"asc":"desc"};renderRanking()}));
$("downloadRanking").addEventListener("click",()=>downloadBlob("remote_connectivity_priority_ranking.csv",rankingCsv(),"text/csv"));
$("simulateOffline").addEventListener("click",()=>{state.simulatedOffline=!state.simulatedOffline;document.body.classList.toggle("simulated-offline",state.simulatedOffline);$("simulateOffline").textContent=state.simulatedOffline?"Return to online UI":"Simulate offline UI";setNetworkStatus()});

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}))}
initialize();
