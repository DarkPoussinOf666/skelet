import fs from 'node:fs';
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(r=>{this.result=r;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(r=>{this.result='data:'+blob.type+';base64,'+Buffer.from(r).toString('base64');this.onloadend?.();});}};
const buffer=fs.readFileSync('sources/SkeletalSystem100.fbx');
const original=new FBXLoader().parse(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
original.updateMatrixWorld(true);
const groups=[new THREE.Group(),new THREE.Group()];const entries=[];const materials={};
original.traverse(object=>{if(!object.isMesh||/muscle|Extensor|Flexor/i.test(object.name))return;const mats=Array.isArray(object.material)?object.material:[object.material];for(const m of mats)materials[m.name]=(materials[m.name]||0)+1;if(object.geometry.attributes.position.count<=36||!mats.some(m=>/bone|cartilage|tooth|teeth|enamel|dentin/i.test(m.name)))return;
let geometry=object.geometry.clone();for(const attr of Object.keys(geometry.attributes))if(!['position','normal'].includes(attr))geometry.deleteAttribute(attr);geometry.clearGroups();geometry.applyMatrix4(object.matrixWorld);geometry.scale(.01,.01,.01);geometry=mergeVertices(geometry,1e-6);if(object.matrixWorld.determinant()<0){const idx=geometry.index.array;for(let t=0;t<idx.length;t+=3){const swap=idx[t];idx[t]=idx[t+2];idx[t+2]=swap;}}
let sourceName=object.name.replaceAll('_',' ');if(sourceName!=='Vomer'&&/[lr]$/.test(sourceName)&&/[a-z][lr]$/.test(sourceName))sourceName=sourceName.slice(0,-1)+'.'+sourceName.slice(-1);
const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0xd4d1bd}));mesh.name=object.name;mesh.userData={sourceName,anatomyId:'za-'+object.name};let ancestor=object;let rootName='';while(ancestor.parent&&ancestor.parent!==original)ancestor=ancestor.parent;rootName=ancestor.name;
const head=/Cranium|Extracranial|Auditory|Teeth/.test(rootName);mesh.userData.region=head?'head':null;groups[head?1:0].add(mesh);entries.push({id:mesh.userData.anatomyId,name:sourceName,region:mesh.userData.region,vertices:geometry.attributes.position.count});
});
console.log({selected:entries.length,materials});
const exporter=new GLTFExporter();for(let i=0;i<groups.length;i++){const data=await exporter.parseAsync(groups[i],{binary:true,onlyVisible:false});const file=i?'head.glb':'skeleton.glb';fs.writeFileSync('dist/models/'+file,Buffer.from(data));console.log(file,data.byteLength,groups[i].children.length);}
fs.writeFileSync('dist/models/catalog.json',JSON.stringify(entries,null,2));


