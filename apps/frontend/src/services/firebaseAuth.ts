import { get, ref, set } from "firebase/database";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, User } from "firebase/auth";
import { auth, database, googleProvider } from "../lib/firebase.js";
import { AuthUser } from "../types.js";

const defaultRole: AuthUser["role"] = "COORDINATOR";

const userProfileRef = (uid: string) => ref(database, `users/${uid}`);

const toAuthUser = (user: User): AuthUser => {
  return {
    uid: user.uid,
    email: user.email || "",
    displayName: user.displayName || user.email || "Google User",
    photoURL: user.photoURL || undefined,
    role: defaultRole,
    lastLoginAt: new Date().toISOString()
  };
};

const createProfileFromUser = async (user: User): Promise<AuthUser> => {
  const profileSnapshot = await get(userProfileRef(user.uid));
  const profileData = profileSnapshot.exists() ? profileSnapshot.val() : null;
  const profile: AuthUser = {
    ...toAuthUser(user),
    role: profileData?.role || defaultRole
  };

  await set(userProfileRef(user.uid), profile);
  return profile;
};

export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const optimisticUser = toAuthUser(credential.user);

    void createProfileFromUser(credential.user).catch(() => {
      // Profile synchronization is non-blocking for routing.
    });

    return optimisticUser;
  } catch (error: any) {
    if (error?.code === "auth/popup-blocked" || error?.code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const syncCurrentUserProfile = async (user: User | null): Promise<AuthUser | null> => {
  if (!user) {
    return null;
  }

  try {
    return await createProfileFromUser(user);
  } catch {
    return toAuthUser(user);
  }
};

export const subscribeToAuthState = (callback: (user: AuthUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback(null);
      return;
    }

    // Update route guards immediately, then enrich state after profile sync.
    callback(toAuthUser(user));
    void syncCurrentUserProfile(user).then((profile) => {
      if (profile) {
        callback(profile);
      }
    });
  });
};