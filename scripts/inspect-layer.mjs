import fs from 'node:fs';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
const b=fs.readFileSync('sources/'+process.argv[2]+'System100.fbx');const g=new FBXLoader().parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');
const materials={};const candidates=[];g.traverse(x=>{if(!x.isMesh)return;const mats=Array.isArray(x.material)?x.material:[x.material];for(const m of mats)materials[m.name]=(materials[m.name]||0)+1;if(x.geometry.attributes.position.count>36&&mats.some(m=>process.argv[2]==='Muscular'?/muscle|tendon|aponeuro/i.test(m.name):/nerv|spinal|brain/i.test(m.name)))candidates.push({name:x.name,parent:x.parent.name,n:x.geometry.attributes.position.count,m:mats.map(m=>m.name)});});
fs.writeFileSync('sources/'+process.argv[2]+'-inspect.json',JSON.stringify({materials,candidates},null,2));console.log(materials);console.log('CANDIDATES',candidates.length,candidates.slice(0,12));
