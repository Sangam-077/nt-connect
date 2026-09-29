/*
 * NT Connect · optional historical cyclone-season occurrence calculator.
 * Input: official BOM IDCKMSTM0S.csv best-track archive, selected locally.
 * Uses only TYPE=T (systems recorded as tropical cyclones), and complete
 * Australian seasons 1980-81 to 2024-25 (1 July through 30 June).
 * A season is counted ONCE per community when a cyclone-system centre track
 * came within a selected radius. This is retrospective proximity frequency,
 * NOT a forecast, cyclone force, local impact, or hazard probability.
 */
(function(global){
 'use strict';
 const PERIOD_START=1980,PERIOD_END=2024,TOTAL_SEASONS=45;
 const KM_LAT=111.195;
 const LIMIT_HOURS=24;
 function readFields(line,maxIndex){
   const result=[];let value='',quoted=false;
   for(let i=0;i<line.length;i++){
     const c=line[i];
     if(c==='"'){
       if(quoted && line[i+1]==='"'){value+='"';i++;}
       else quoted=!quoted;
     }else if(c===','&&!quoted){
       result.push(value.trim());value='';
       if(result.length>maxIndex)return result;
     }else value+=c;
   }
   result.push(value.trim());return result;
 }
 function parseUTC(raw){
   if(!raw)return NaN;
   let str=String(raw).trim();
   // Some BOM-style exports use Australian day/month/year instead of ISO.
   const au=str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/);
   if(au)return Date.UTC(Number(au[3]),Number(au[2])-1,Number(au[1]),Number(au[4]),Number(au[5]),Number(au[6]||0));
   if(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}[ T]/.test(str)){
     str=str.replace(/\//g,'-').replace(' ','T');
     if(!/[zZ]|[+-]\d{2}:?\d{2}$/.test(str))str+='Z';
   }
   return Date.parse(str);
 }
 function trackDistKm(points,lat,lon){
   const lonFactor=KM_LAT*Math.cos(lat*Math.PI/180);
   let best=Infinity;
   for(let i=0;i<points.length;i++){
     const a=points[i],x=(a.lon-lon)*lonFactor,y=(a.lat-lat)*KM_LAT;
     const d=Math.hypot(x,y);if(d<best)best=d;
     if(best<=50)break;
     if(i+1===points.length)continue;
     const b=points[i+1];
     if(b.time-a.time>LIMIT_HOURS*3600000 || b.time<=a.time)continue;
     const bx=(b.lon-lon)*lonFactor,by=(b.lat-lat)*KM_LAT;
     const vx=bx-x,vy=by-y,den=vx*vx+vy*vy;
     if(den<1e-12)continue;
     const t=Math.max(0,Math.min(1,-(x*vx+y*vy)/den));
     const segDist=Math.hypot(x+t*vx,y+t*vy);
     if(segDist<best)best=segDist;
   }
   return best;
 }
 async function calculate(file,sites,onProgress){
   if(!file || typeof file.text!=='function')throw Error('Choose the official BOM CSV file first.');
   const content=await file.text();
   const lines=content.replace(/^\uFEFF/,'').split(/\r?\n/);
   const headerIndex=lines.findIndex(line=>{
     const u=line.toUpperCase();
     return u.includes('DISTURBANCE_ID') && u.includes('TM') && u.includes('LAT') && u.includes('LON');
   });
   if(headerIndex<0)throw Error('BOM table header not found. Please select IDCKMSTM0S.csv or your renamed BOM CSV.');
   const headers=readFields(lines[headerIndex],150).map(x=>x.trim().toUpperCase());
   const col={};for(const key of ['DISTURBANCE_ID','TM','TYPE','LAT','LON']){
     col[key]=headers.indexOf(key);
     if(col[key]<0)throw Error('Required BOM field missing: '+key);
   }
   const maxIndex=Math.max(...Object.values(col));
   const groups=new Map();const seasonsSeen=new Set();let included=0;
   if(onProgress)onProgress('Reading official BOM cyclone track records…');
   for(let i=headerIndex+1;i<lines.length;i++){
     if(!lines[i].trim())continue;
     const f=readFields(lines[i],maxIndex);
     if(String(f[col.TYPE]||'').trim().toUpperCase()!=='T')continue;
     const time=parseUTC(f[col.TM]);if(!Number.isFinite(time))continue;
     const d=new Date(time),season=d.getUTCFullYear()-(d.getUTCMonth()<6?1:0);
     if(season<PERIOD_START||season>PERIOD_END)continue;
     const lat=Number(f[col.LAT]),lon=Number(f[col.LON]);
     if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat>0||lat< -50||lon<90||lon>180)continue;
     const id=String(f[col.DISTURBANCE_ID]||'').trim();if(!id)continue;
     const key=season+'|'+id;
     if(!groups.has(key))groups.set(key,{season,id,points:[],minLat:Infinity,maxLat:-Infinity,minLon:Infinity,maxLon:-Infinity});
     const g=groups.get(key);g.points.push({lat,lon,time});
     g.minLat=Math.min(g.minLat,lat);g.maxLat=Math.max(g.maxLat,lat);
     g.minLon=Math.min(g.minLon,lon);g.maxLon=Math.max(g.maxLon,lon);
     seasonsSeen.add(season);included++;
   }
   if(included===0)throw Error('No TYPE=T track observations found in the 1980–81 to 2024–25 period. Check the CSV.');
   if(seasonsSeen.size<40)throw Error('This archive covers fewer than 40 of the expected 45 seasons. A complete BOM best-track download is required.');
   const storms=Array.from(groups.values());
   storms.forEach(g=>g.points.sort((a,b)=>a.time-b.time));
   const locations={};
   for(let i=0;i<sites.length;i++){
     const site=sites[i],lat=Number(site.latitude),lon=Number(site.longitude);
     if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
     const near50=new Set(),near100=new Set(),near200=new Set();
     let trackCount100=0;
     const latPad=210/KM_LAT,lonPad=210/(KM_LAT*Math.max(.35,Math.cos(lat*Math.PI/180)));
     for(const storm of storms){
       if(storm.maxLat<lat-latPad||storm.minLat>lat+latPad||storm.maxLon<lon-lonPad||storm.minLon>lon+lonPad)continue;
       const d=trackDistKm(storm.points,lat,lon);
       if(d<=200){near200.add(storm.season);if(d<=100){near100.add(storm.season);trackCount100++;if(d<=50)near50.add(storm.season);}}
     }
     const n50=near50.size,n100=near100.size,n200=near200.size;
     locations[site.site_name]={
       seasons_within_50km:n50,seasons_within_100km:n100,seasons_within_200km:n200,
       cyclone_systems_within_100km:trackCount100,
       historical_seasonal_frequency_100km_pct:Math.round(n100/TOTAL_SEASONS*1000)/10,
       seasons_100km:Array.from(near100).sort().map(y=>`${y}–${String((y+1)%100).padStart(2,'0')}`)
     };
     if(onProgress && (i%12===0||i===sites.length-1)){
       onProgress(`Analysed ${i+1} / ${sites.length} NT locations…`);
       await new Promise(resolve=>setTimeout(resolve,0));
     }
   }
   return {
     metadata:{source:'Bureau of Meteorology IDCKMSTM0S best-track CSV',input_filename:file.name,
       study_period:'1980–81 to 2024–25',season_definition:'1 July–30 June, UTC',
       total_complete_seasons:TOTAL_SEASONS,season_start:PERIOD_START,season_end:PERIOD_END,
       method:'Unique seasons with a TYPE=T cyclone-system centre track within 100 km, divided by 45; distances approximated locally and track segments joined only when consecutive fixes are at most 24 hours apart.',
       cyclone_tracks_in_period:storms.length,parsed_track_observations:included,calculated_at:new Date().toISOString(),
       caution:'Retrospective centre-track proximity; NOT a forecast of next-season occurrence, wind exposure, cyclone impact or hazard probability.'},
     locations
   };
 }
 global.NT_CYCLONE_PROCESSOR={calculate,readFields,trackDistKm,parseUTC};
})(typeof window!=='undefined'?window:globalThis);
