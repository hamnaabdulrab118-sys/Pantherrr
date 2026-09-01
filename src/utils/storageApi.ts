import { GiftData } from '../types';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';

const DB_NAME = 'PantherDinoMediaDB';
const STORE_NAME = 'gifts';
const DB_VERSION = 1;

export interface SaveGiftResult {
  success: boolean;
  giftId: string;
  shareCode?: string;
  firestoreSaved: boolean;
  serverSaved: boolean;
  error?: string;
}

export interface FetchGiftDiagnostics {
  gift: GiftData | null;
  status: 'success' | 'not_found' | 'permission_denied' | 'error';
  attemptedId: string;
  source?: 'firestore_doc' | 'firestore_sharecode' | 'server_api' | 'indexeddb' | 'localstorage';
  errorMessage?: string;
}

/**
 * Strips undefined values from objects before writing to Firestore
 */
function cleanObjectForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanObjectForFirestore);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanObjectForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Initialize IndexedDB for high-capacity local offline storage
 */
function openIndexedDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const idb = event.target.result as IDBDatabase;
        if (!idb.objectStoreNames.contains(STORE_NAME)) {
          idb.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Saves a gift to IndexedDB
 */
export async function saveGiftToIndexedDb(gift: GiftData): Promise<void> {
  const localDb = await openIndexedDb();
  if (!localDb) return;

  return new Promise((resolve) => {
    try {
      const tx = localDb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(gift);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Retrieves a gift from IndexedDB by id or shareCode
 */
export async function getGiftFromIndexedDb(idOrCode: string): Promise<GiftData | null> {
  const localDb = await openIndexedDb();
  if (!localDb) return null;

  return new Promise((resolve) => {
    try {
      const tx = localDb.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(idOrCode);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result as GiftData);
          return;
        }
        // If not found by primary key ID, scan for matching shareCode
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const list = getAllRequest.result as GiftData[];
          const match = list.find(
            (g) =>
              g.id?.toLowerCase() === idOrCode.toLowerCase() ||
              g.shareCode?.toLowerCase() === idOrCode.toLowerCase()
          );
          resolve(match || null);
        };
        getAllRequest.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Saves a gift to Firebase Firestore (cloud), Express server API, and IndexedDB
 */
export async function saveGiftToServer(gift: GiftData): Promise<SaveGiftResult> {
  const giftId = gift.id || `gift-${Date.now()}`;
  const shareCode = gift.shareCode || Math.random().toString(36).substring(2, 8);
  const normalizedGift: GiftData = {
    ...gift,
    id: giftId,
    shareCode,
    updatedAt: new Date().toISOString(),
  };

  console.log('💾 [Firestore WRITE] Initiating write to Firestore gifts collection:', {
    giftId,
    shareCode,
    title: normalizedGift.title,
    letterLength: normalizedGift.letter?.length || 0,
  });

  let firestoreSaved = false;
  let serverSaved = false;
  let errorDetail: string | undefined;

  // 1. Save to local IndexedDB immediately
  await saveGiftToIndexedDb(normalizedGift).catch((e) =>
    console.warn('IndexedDB write warning:', e)
  );

  // 2. Save to localStorage backup
  try {
    localStorage.setItem(`panther_gift_${giftId}`, JSON.stringify(normalizedGift));
    if (shareCode) {
      localStorage.setItem(`panther_gift_${shareCode}`, JSON.stringify(normalizedGift));
    }
  } catch {
    // ignore quota
  }

  // 3. Save to Firebase Firestore Cloud Database
  try {
    const cleanPayload = cleanObjectForFirestore(normalizedGift);
    
    // Save under primary doc ID (gift.id)
    const giftDocRef = doc(db, 'gifts', giftId);
    await setDoc(giftDocRef, cleanPayload, { merge: true });
    
    // Also save under shareCode alias doc if distinct, so direct doc lookups succeed either way
    if (shareCode && shareCode !== giftId) {
      const aliasDocRef = doc(db, 'gifts', shareCode);
      await setDoc(aliasDocRef, cleanPayload, { merge: true });
    }

    firestoreSaved = true;
    console.log('✅ [Firestore WRITE SUCCESS] Successfully written to Firestore collection "gifts":', {
      giftId,
      shareCode,
    });
  } catch (firestoreErr: any) {
    errorDetail = firestoreErr?.message || String(firestoreErr);
    console.error('❌ [Firestore WRITE ERROR] Could not write to Firestore database:', firestoreErr);
  }

  // 4. Post to Express Server API for disk persistence & fallback
  try {
    const res = await fetch('/api/gifts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedGift),
    });

    if (res.ok) {
      serverSaved = true;
      console.log('✅ [Server API WRITE SUCCESS] Synced gift with backend disk storage');
    }
  } catch (err) {
    console.warn('Backend server API sync skipped (normal in preview environment):', err);
  }

  return {
    success: firestoreSaved || serverSaved,
    giftId,
    shareCode,
    firestoreSaved,
    serverSaved,
    error: errorDetail,
  };
}

/**
 * Fetches a gift with detailed diagnostics (for UI error feedback & debugging)
 */
export async function fetchGiftWithDiagnostics(idOrCode: string): Promise<FetchGiftDiagnostics> {
  const trimmed = (idOrCode || '').trim();
  if (!trimmed) {
    return {
      gift: null,
      status: 'not_found',
      attemptedId: '',
      errorMessage: 'No gift ID or share code was provided in the URL.',
    };
  }

  console.log('🔍 [Firestore READ] Looking up gift in Firestore collection "gifts":', {
    attemptedLookup: trimmed,
  });

  // 1. Try direct Firebase Firestore doc lookup (by ID or shareCode)
  try {
    const docRef = doc(db, 'gifts', trimmed);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as GiftData;
      console.log('✅ [Firestore READ SUCCESS] Found direct document match:', {
        id: data.id,
        title: data.title,
        letterLength: data.letter?.length || 0,
      });
      saveGiftToIndexedDb(data).catch(() => {});
      return {
        gift: data,
        status: 'success',
        attemptedId: trimmed,
        source: 'firestore_doc',
      };
    }
  } catch (firestoreErr: any) {
    const errMsg = firestoreErr?.message || String(firestoreErr);
    console.error('❌ [Firestore READ ERROR] Error reading Firestore document:', firestoreErr);
    if (errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('denied')) {
      return {
        gift: null,
        status: 'permission_denied',
        attemptedId: trimmed,
        errorMessage: `Firestore permission denied: ${errMsg}`,
      };
    }
  }

  // 2. Try querying Firestore by shareCode or ID field
  try {
    const giftsRef = collection(db, 'gifts');
    const q1 = query(giftsRef, where('shareCode', '==', trimmed), limit(1));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      const data = snap1.docs[0].data() as GiftData;
      console.log('✅ [Firestore QUERY SUCCESS] Found gift via shareCode query:', data.id);
      saveGiftToIndexedDb(data).catch(() => {});
      return {
        gift: data,
        status: 'success',
        attemptedId: trimmed,
        source: 'firestore_sharecode',
      };
    }

    const q2 = query(giftsRef, where('id', '==', trimmed), limit(1));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const data = snap2.docs[0].data() as GiftData;
      console.log('✅ [Firestore QUERY SUCCESS] Found gift via ID query:', data.id);
      saveGiftToIndexedDb(data).catch(() => {});
      return {
        gift: data,
        status: 'success',
        attemptedId: trimmed,
        source: 'firestore_doc',
      };
    }
  } catch (queryErr: any) {
    console.warn('Firestore query attempt error:', queryErr);
  }

  // 3. Try Express Server API
  try {
    const res = await fetch(`/api/gifts/${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.gift) {
        console.log('✅ [Server API SUCCESS] Found gift via backend API:', data.gift.id);
        saveGiftToIndexedDb(data.gift).catch(() => {});
        return {
          gift: data.gift as GiftData,
          status: 'success',
          attemptedId: trimmed,
          source: 'server_api',
        };
      }
    }
  } catch (apiErr) {
    console.warn('Server API lookup error:', apiErr);
  }

  // 4. Try IndexedDB
  const indexedDbGift = await getGiftFromIndexedDb(trimmed);
  if (indexedDbGift) {
    console.log('✅ [IndexedDB SUCCESS] Found gift in local database:', indexedDbGift.id);
    return {
      gift: indexedDbGift,
      status: 'success',
      attemptedId: trimmed,
      source: 'indexeddb',
    };
  }

  // 5. Try LocalStorage
  try {
    const raw = localStorage.getItem(`panther_gift_${trimmed}`);
    if (raw) {
      const parsed = JSON.parse(raw) as GiftData;
      return {
        gift: parsed,
        status: 'success',
        attemptedId: trimmed,
        source: 'localstorage',
      };
    }
    const collectionRaw = localStorage.getItem('panther_dino_collection');
    if (collectionRaw) {
      const collectionList = JSON.parse(collectionRaw) as GiftData[];
      const match = collectionList.find(
        (g) =>
          g.id?.toLowerCase() === trimmed.toLowerCase() ||
          g.shareCode?.toLowerCase() === trimmed.toLowerCase()
      );
      if (match) {
        return {
          gift: match,
          status: 'success',
          attemptedId: trimmed,
          source: 'localstorage',
        };
      }
    }
  } catch {
    // ignore
  }

  console.warn(`⚠️ [Lookup Result] Gift ID or code "${trimmed}" was not found in any storage source.`);
  return {
    gift: null,
    status: 'not_found',
    attemptedId: trimmed,
    errorMessage: `Memory with ID "${trimmed}" was not found in Firestore cloud database.`,
  };
}

/**
 * Fetches a full-resolution gift from Firestore cloud database, server API, or local storage
 */
export async function fetchGiftFromServer(idOrCode: string): Promise<GiftData | null> {
  const result = await fetchGiftWithDiagnostics(idOrCode);
  return result.gift;
}

/**
 * Fetches all saved gifts from Firestore or the server API
 */
export async function fetchAllServerGifts(): Promise<GiftData[]> {
  // 1. Try Firestore
  try {
    const giftsRef = collection(db, 'gifts');
    const querySnap = await getDocs(giftsRef);
    if (!querySnap.empty) {
      const list: GiftData[] = [];
      const seenIds = new Set<string>();
      querySnap.forEach((d) => {
        const item = d.data() as GiftData;
        if (item.id && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          list.push(item);
        }
      });
      if (list.length > 0) {
        console.log(`✅ [Firestore SYNC] Loaded ${list.length} gifts from Firestore`);
        return list;
      }
    }
  } catch (firestoreErr) {
    console.warn('Firestore collection fetch error, trying backend API:', firestoreErr);
  }

  // 2. Try Express Server API
  try {
    const res = await fetch('/api/gifts');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.gifts)) {
        return data.gifts;
      }
    }
  } catch (err) {
    console.warn('Failed to load server collection:', err);
  }

  return [];
}

/**
 * Deletes a gift from Firestore, server API, IndexedDB, and localStorage
 */
export async function deleteGiftFromServer(id: string): Promise<boolean> {
  if (!id) return false;

  console.log('🗑️ [Firestore DELETE] Deleting gift:', id);

  // 1. Delete from Firestore Cloud Database
  try {
    const giftDocRef = doc(db, 'gifts', id);
    await deleteDoc(giftDocRef);
  } catch (err) {
    console.warn('Could not delete from Firestore:', err);
  }

  // 2. Delete from Express Server API
  try {
    await fetch(`/api/gifts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Could not delete from server API:', err);
  }

  // 3. Delete from IndexedDB
  try {
    const localDb = await openIndexedDb();
    if (localDb) {
      const tx = localDb.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
    }
  } catch {
    // ignore
  }

  // 4. Delete from localStorage
  try {
    localStorage.removeItem(`panther_gift_${id}`);
  } catch {
    // ignore
  }

  return true;
}
