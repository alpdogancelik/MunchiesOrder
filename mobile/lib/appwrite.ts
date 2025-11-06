import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";
import Constants from 'expo-constants';

// Resolve environment variables safely (Expo injects EXPO_PUBLIC_* into process.env, but fall back to app.json extra)
const extra: any = Constants.expoConfig?.extra || {};
// Prefer Constants.expoConfig.extra for web environment where process.env may be undefined
const env = (name: string) => (typeof process !== 'undefined' ? (process as any).env?.[name] : undefined) || extra[name];
const resolvedEndpoint = env('EXPO_PUBLIC_APPWRITE_ENDPOINT');
const resolvedProjectId = env('EXPO_PUBLIC_APPWRITE_PROJECT_ID');
const resolvedDatabaseId = env('EXPO_PUBLIC_APPWRITE_DATABASE_ID');
const resolvedUserCollectionId = env('EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID');
const resolvedCategoriesCollectionId = env('EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID');
const resolvedMenuCollectionId = env('EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID');
const resolvedCustomizationsCollectionId = env('EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID');
const resolvedMenuCustomizationsCollectionId = env('EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID');
const resolvedBucketId = env('EXPO_PUBLIC_APPWRITE_BUCKET_ID');

if (!resolvedEndpoint) {
    console.error('[Appwrite] Missing EXPO_PUBLIC_APPWRITE_ENDPOINT. Set it in app.json under expo.extra.');
}
if (!resolvedProjectId) {
    console.error('[Appwrite] Missing EXPO_PUBLIC_APPWRITE_PROJECT_ID. Set it in app.json under expo.extra.');
}

export const appwriteConfig = {
    endpoint: resolvedEndpoint!,
    projectId: resolvedProjectId!,
    platform: "com.munchies.app",
    databaseId: resolvedDatabaseId,
    bucketId: resolvedBucketId,
    userCollectionId: resolvedUserCollectionId,
    categoriesCollectionId: resolvedCategoriesCollectionId,
    menuCollectionId: resolvedMenuCollectionId,
    customizationsCollectionId: resolvedCustomizationsCollectionId,
    menuCustomizationsCollectionId: resolvedMenuCustomizationsCollectionId
};

// Debug log once (avoid spamming): helps diagnose 404 masking due to permissions
if (__DEV__) {
    // Mask sensitive endpoint host only partially
    const maskedEndpoint = appwriteConfig.endpoint?.replace(/(https?:\/\/)([^\/]+)(.*)/, (
        _m: string,
        p1: string,
        host: string,
        rest: string
    ) => p1 + host.split('').map((c: string, i: number) => i < 3 ? c : '*').join('') + rest);
    console.log('[Appwrite][Config]', {
        endpoint: maskedEndpoint,
        projectId: appwriteConfig.projectId,
        databaseId: appwriteConfig.databaseId,
        collections: {
            user: appwriteConfig.userCollectionId,
            categories: appwriteConfig.categoriesCollectionId,
            menus: appwriteConfig.menuCollectionId,
            customizations: appwriteConfig.customizationsCollectionId,
            menuCustomizations: appwriteConfig.menuCustomizationsCollectionId
        },
        bucketId: appwriteConfig.bucketId
    });
}

export const client = new Client();

try {
    client
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId)
        .setPlatform(appwriteConfig.platform);
} catch (e) {
    console.error('[Appwrite] Failed to initialize client. Check endpoint & projectId.', e);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

const normalizeError = (e: any): string => {
    try {
        if (typeof e === 'string') return e;
        const code = e?.code ? ` (code ${e.code})` : '';
        if (e?.message) return `${e.message}${code}`;
        return JSON.stringify(e);
    } catch {
        return 'Unexpected error';
    }
};

export const createUser = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if (!newAccount) throw Error;

        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, name, accountId: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e) {
        throw new Error(normalizeError(e));
    }
}

export const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
        await account.createEmailPasswordSession(email, password);
    } catch (e: any) {
        // If a session already exists (409), treat as success
        if (e?.code === 409) {
            try {
                const current = await account.get();
                if (current) return;
            } catch { }
        }
        throw new Error(normalizeError(e));
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        if (!appwriteConfig.databaseId || !appwriteConfig.userCollectionId) return null;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser || currentUser.total === 0) return null;

        return currentUser.documents[0];
    } catch (e: any) {
        // 404 may mean collection not found OR permission denied (Appwrite masks as 404)
        if (e?.code === 404) {
            if (__DEV__) console.warn('[Appwrite] user profile collection not accessible (404) - returning null');
            return null as any;
        }
        console.log('[Appwrite] getCurrentUser error:', normalizeError(e));
        return null as any;
    }
}

export const getMenu = async ({ category, query }: { category?: string; query?: string; limit?: number }) => {
    try {
        const queries: any[] = [];

        if (category) queries.push(Query.equal('categories', category));
        if (query) queries.push(Query.search('name', query));

        if (!appwriteConfig.databaseId || !appwriteConfig.menuCollectionId) return [];
        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        );

        return menus.documents as any[];
    } catch (e: any) {
        if (e?.code === 404) {
            // Likely permission issue or collection missing
            if (__DEV__) console.warn('[Appwrite] menus collection not accessible (404) - returning empty list');
            return [];
        }
        throw new Error(normalizeError(e));
    }
}

export const getCategories = async () => {
    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.categoriesCollectionId) return [];
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        );

        return categories.documents as any[];
    } catch (e: any) {
        if (e?.code === 404) {
            if (__DEV__) console.warn('[Appwrite] categories collection not accessible (404) - returning empty list');
            return [];
        }
        throw new Error(normalizeError(e));
    }
}
