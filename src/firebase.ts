import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  doc, 
  deleteDoc,
  getDocFromServer
} from "firebase/firestore";

// Your web app's Firebase configuration explicitly defined
const firebaseConfig = {
  apiKey: "AIzaSyBxPwniC1eZyAyHmcXFT7wLqKcHivrYO9U",
  authDomain: "trip-e4895.firebaseapp.com",
  projectId: "trip-e4895",
  storageBucket: "trip-e4895.firebasestorage.app",
  messagingSenderId: "1065765707302",
  appId: "1:1065765707302:web:86842a085b031d394b50e7",
  measurementId: "G-RDE98LM6RJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: "anonymous_admin",
      email: null,
      emailVerified: false,
      isAnonymous: true,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Warn: ', JSON.stringify(errInfo));
  // Throw standard descriptive log so we inspect rules, but let the client handle it gracefully
}

// Seed Login Credentials
export async function seedLoginCredentials() {
  try {
    await setDoc(doc(db, "logins", "admin_rajesh"), {
      username: "Rajesh",
      password: "8072117912",
      role: "admin",
      updatedAt: new Date().toISOString()
    });
    console.log("Admin credentials seeded to Firestore database logins collection!");
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, "logins/admin_rajesh");
  }
}

// Test Connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connected Successfully to trip-e4895!");
    await seedLoginCredentials();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'test/connection');
  }
}
testConnection();

// Verify Admin / Login Credentials against Firebase DB
export interface LoginResult {
  success: boolean;
  role?: string;
  error?: string;
}

export async function verifyLoginFromFirestore(usernameInput: string, passwordInput: string): Promise<LoginResult> {
  try {
    const snap = await getDocs(collection(db, "logins"));
    let matched = false;
    let role = "";
    snap.forEach((d) => {
      const data = d.data();
      if (
        data.username && 
        data.password && 
        String(data.username).trim().toLowerCase() === String(usernameInput).trim().toLowerCase() && 
        String(data.password).trim() === String(passwordInput).trim()
      ) {
        matched = true;
        role = data.role || "user";
      }
    });

    if (matched) {
      return { success: true, role };
    } else {
      return { success: false, error: "Invalid username or password. Please verify your credentials." };
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, "logins");
    return { success: false, error: "Failed to connect to Firebase database for authentication verification." };
  }
}

// Simple sync helpers that load and save to Firestore
export async function loadTripsFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "trips"));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, "trips");
    return null;
  }
}

export async function saveTripToFirestore(trip: any) {
  try {
    await setDoc(doc(db, "trips", trip.id), trip);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `trips/${trip.id}`);
  }
}

export async function loadMembersFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "members"));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, "members");
    return null;
  }
}

export async function saveMemberToFirestore(member: any) {
  try {
    await setDoc(doc(db, "members", member.id), member);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `members/${member.id}`);
  }
}

export async function loadExpensesFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "expenses"));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, "expenses");
    return null;
  }
}

export async function saveExpenseToFirestore(expense: any) {
  try {
    await setDoc(doc(db, "expenses", expense.id), expense);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `expenses/${expense.id}`);
  }
}

export async function deleteExpenseFromFirestore(expenseId: string) {
  try {
    await deleteDoc(doc(db, "expenses", expenseId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `expenses/${expenseId}`);
  }
}

// 📸 Gallery persistence sync helpers
export async function loadGalleryFromFirestore() {
  try {
    const snap = await getDocs(collection(db, "gallery"));
    const list: any[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() });
    });
    return list;
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, "gallery");
    return null;
  }
}

export async function saveGalleryItemToFirestore(item: any) {
  try {
    await setDoc(doc(db, "gallery", item.id), item);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `gallery/${item.id}`);
  }
}

export async function deleteGalleryItemFromFirestore(itemId: string) {
  try {
    await deleteDoc(doc(db, "gallery", itemId));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, `gallery/${itemId}`);
  }
}

