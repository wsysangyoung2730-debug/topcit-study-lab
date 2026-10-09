import { emptyState, isStudyState, type StudyState } from './study';
const DB='topcit-study-lab';
let connection:Promise<IDBDatabase>|undefined;
function db() { return connection??=new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore('records');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);}); }
export async function readState():Promise<StudyState> {const connection=await db();return new Promise((resolve,reject)=>{const request=connection.transaction('records').objectStore('records').get('state');request.onsuccess=()=>resolve(isStudyState(request.result)?request.result:emptyState());request.onerror=()=>reject(request.error);});}
export async function writeState(state:StudyState) {const connection=await db();return new Promise<void>((resolve,reject)=>{const tx=connection.transaction('records','readwrite');tx.objectStore('records').put(state,'state');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
export function exportState(state:StudyState){const url=URL.createObjectURL(new Blob([JSON.stringify(state)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`topcit-study-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
