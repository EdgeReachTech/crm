import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import { config } from 'dotenv';
import * as path from 'path';

config();

const serviceAccount = path.resolve(process.cwd(), process.env.FIREBASE_PRIVATE_KEY_PATH!);

initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});

export const auth = getAuth();
export const storage = getStorage();