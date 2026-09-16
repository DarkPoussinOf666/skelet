import fs from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {reorder,quantize,dedup} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
await MeshoptEncoder.ready;await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const files=['skeleton','head',...JSON.parse(await fs.readFile('dist/models/muscles-files.json')),'nerves'];
await fs.mkdir('sources/exports',{recursive:true});const report=[];
const count=doc=>doc.getRoot().listMeshes().reduce((sum,m)=>sum+m.listPrimitives().reduce((n,p)=>n+(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3,0),0);
for(const file of files){const path='dist/models/'+file+'.glb',backup='sources/exports/'+file+'.glb';try{await fs.access(backup);}catch{await fs.copyFile(path,backup);}const doc=await io.read(backup);const triangles=count(doc);const ids=doc.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>n.getExtras().anatomyId).sort();await doc.transform(dedup(),reorder({encoder:MeshoptEncoder}),quantize({quantizePosition:16,quantizeNormal:12,quantizeColor:8,quantizationVolume:'mesh'}));doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});await io.write(path+'.tmp.glb',doc);const verified=await io.read(path+'.tmp.glb');if(count(verified)!==triangles)throw Error('Triangle count changed: '+file);const afterIds=verified.getRoot().listNodes().filter(n=>n.getMesh()).map(n=>n.getExtras().anatomyId).sort();if(JSON.stringify(ids)!==JSON.stringify(afterIds))throw Error('Anatomical identifiers changed');await fs.rename(path+'.tmp.glb',path);report.push({file,triangles,structures:ids.length,bytes:(await fs.stat(path)).size});}
await fs.writeFile('dist/models/compression-report.json',JSON.stringify(report,null,2));console.log(report);

