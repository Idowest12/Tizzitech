const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /import \{ getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, getDoc, query, where, runTransaction \} from 'firebase\/firestore';/,
  "import { getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, getDoc, query, where, runTransaction, deleteDoc } from 'firebase/firestore';"
);

if (!code.includes('import { createServer as createViteServer } from "vite";')) {
  code = code.replace(/import express from 'express';/, "import express from 'express';\nimport { createServer as createViteServer } from 'vite';");
}

fs.writeFileSync('server.ts', code);
