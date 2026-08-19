import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Course, ContinueProgress, CategoryType, UserStats } from '../types';

/**
 * Cấu hình Firebase Project Credentials chính thức cho MyEdu
 * Project: myedu-9c611
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCsEPuDvWxDan_8SHcl9qgoCRFzgu9qyAk",
  authDomain: "myedu-9c611.firebaseapp.com",
  projectId: "myedu-9c611",
  storageBucket: "myedu-9c611.firebasestorage.app",
  messagingSenderId: "436794103150",
  appId: "1:436794103150:web:45e0e744297976e57f5d7f",
  measurementId: "G-X57X6WZN0W"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase Cloud Firestore connected successfully for myedu-9c611.');
} catch (error) {
  console.warn('⚠️ Failed to initialize Firebase:', error);
}

export { db };

export interface CloudDatabasePayload {
  courses: Course[];
  categories: string[];
  sources: string[];
  instructors?: string[];
  continueProgress: ContinueProgress | null;
  userStats: UserStats;
  updatedAt: string;
}

const FIRESTORE_COLLECTION = 'myedu_workspaces';
const FIRESTORE_DOC_ID = 'primary_workspace';

/**
 * Hàm đệ quy làm sạch dữ liệu trước khi đẩy lên Cloud Firestore
 * Loại bỏ triệt để các trường có giá trị `undefined` (nguyên nhân gây lỗi Firebase setDoc)
 */
export function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        clean[key] = sanitizeForFirestore(val);
      }
    }
    return clean;
  }
  return obj;
}

/**
 * Tải toàn bộ dữ liệu từ Cloud Firestore về máy
 */
export async function fetchFromCloud(): Promise<CloudDatabasePayload | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as CloudDatabasePayload;
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Cloud fetch error (will use local cache):', error);
    return null;
  }
}

/**
 * Đẩy toàn bộ dữ liệu từ máy lên Cloud Firestore
 */
export async function syncToCloud(payload: Partial<CloudDatabasePayload>): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    const cleanPayload = sanitizeForFirestore({
      ...payload,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, cleanPayload, { merge: true });
    return true;
  } catch (error) {
    console.error('❌ Cloud sync error:', error);
    return false;
  }
}

/**
 * Lắng nghe thay đổi thời gian thực từ Cloud Firestore (Real-time Sync)
 */
export function subscribeToCloudChanges(
  onUpdate: (data: CloudDatabasePayload) => void
): Unsubscribe | null {
  if (!db) return null;
  try {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as CloudDatabasePayload);
      }
    }, (error) => {
      console.warn('⚠️ Realtime sync listener warning:', error);
    });
  } catch {
    return null;
  }
}
