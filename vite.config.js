import { defineConfig } from 'vite';
export default defineConfig({build:{rollupOptions:{output:{onlyExplicitManualChunks:true,manualChunks(id){
  if(id.includes('/@firebase/firestore/'))return 'firebase-firestore';
  if(id.includes('/@firebase/auth/'))return 'firebase-auth';
  if(id.includes('/@firebase/storage/'))return 'firebase-storage';
  if(id.includes('/@firebase/functions/'))return 'firebase-functions';
  if(id.includes('/@firebase/'))return 'firebase-core';
}}}}});
