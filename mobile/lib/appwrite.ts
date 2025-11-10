import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite";
import Constants from 'expo-constants';
import { sampleCategories, sampleMenu, sampleOwnerRestaurants, sampleRestaurantOrders } from "./sampleData";

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
const resolvedRestaurantsCollectionId = env('EXPO_PUBLIC_APPWRITE_RESTAURANTS_COLLECTION_ID');
const resolvedOrdersCollectionId = env('EXPO_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID');
const resolvedBucketId = env('EXPO_PUBLIC_APPWRITE_BUCKET_ID');

const forceAppwrite = env('EXPO_PUBLIC_FORCE_APPWRITE') === 'true';
const useMockData = env('EXPO_PUBLIC_USE_MOCK_DATA') === 'true';
const appwriteConfigured =
    Boolean(
        resolvedEndpoint &&
        resolvedProjectId &&
        resolvedDatabaseId &&
        resolvedMenuCollectionId &&
        resolvedRestaurantsCollectionId &&
        resolvedOrdersCollectionId,
    );
export const shouldUseAppwrite = appwriteConfigured && (forceAppwrite || !useMockData);

if (!resolvedEndpoint) {
    console.error('[Appwrite] Missing EXPO_PUBLIC_APPWRITE_ENDPOINT. Set it in app.json under expo.extra.');
}
if (!resolvedProjectId) {
    console.error('[Appwrite] Missing EXPO_PUBLIC_APPWRITE_PROJECT_ID. Set it in app.json under expo.extra.');
}

export const appwriteConfig = {
    endpoint: resolvedEndpoint || "",
    projectId: resolvedProjectId || "",
    platform: "com.munchies.app",
    databaseId: resolvedDatabaseId || "",
    bucketId: resolvedBucketId || "",
    userCollectionId: resolvedUserCollectionId || "",
    categoriesCollectionId: resolvedCategoriesCollectionId || "",
    menuCollectionId: resolvedMenuCollectionId || "",
    customizationsCollectionId: resolvedCustomizationsCollectionId || "",
    menuCustomizationsCollectionId: resolvedMenuCustomizationsCollectionId || "",
    restaurantsCollectionId: resolvedRestaurantsCollectionId || "",
    ordersCollectionId: resolvedOrdersCollectionId || "",
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
            menuCustomizations: appwriteConfig.menuCustomizationsCollectionId,
            restaurants: appwriteConfig.restaurantsCollectionId,
            orders: appwriteConfig.ordersCollectionId,
        },
        bucketId: appwriteConfig.bucketId
    });
    if (!shouldUseAppwrite) {
        console.log('[Appwrite] Mock mode enabled. Set EXPO_PUBLIC_USE_MOCK_DATA=false once your backend is ready.');
    }
}

export const client = new Client();

if (appwriteConfigured) {
    try {
        client
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.projectId)
            .setPlatform(appwriteConfig.platform);
    } catch (e) {
        console.error('[Appwrite] Failed to initialize client. Check endpoint & projectId.', e);
    }
} else if (__DEV__) {
    console.warn('[Appwrite] Client not configured. Falling back to mock data until env vars are set.');
}

export const account = new Account(client);
export const databases = new Databases(client);
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

const getMockMenus = ({ query }: { category?: string; query?: string }) => {
    const all = Object.values(sampleMenu).flat();
    if (!query) return all;
    const term = query.toLowerCase();
    return all.filter((item: any) =>
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term),
    );
};

const getMockCategories = () => Object.values(sampleCategories).flat();

const getMockRestaurants = () => sampleOwnerRestaurants.map((rest) => ({
    ...rest,
    id: String(rest.id),
    $id: String(rest.id),
}));

const getMockOrders = () => sampleRestaurantOrders.map((order) => ({
    ...order,
    id: String(order.id),
    $id: String(order.id),
}));

const getAccountId = async () => {
    try {
        const current = await account.get();
        return current.$id;
    } catch {
        return null;
    }
};

const withDocumentId = (doc: any) => ({
    ...doc,
    id: doc.$id || String(doc.id),
    $id: doc.$id || String(doc.id),
});

export type Profile = { name: string; email: string; avatar?: string };

const buildMockProfile = (overrides: Partial<Profile> = {}) => {
    const fallbackName = overrides.name || sampleOwnerRestaurants[0]?.name || "Campus Operator";
    return {
        $id: `demo-${Date.now()}`,
        name: fallbackName,
        email: overrides.email || "owner@munchies.app",
        avatar: overrides.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}`,
    };
};

export const createUser = async ({ email, password, name }: { email: string; password: string; name: string }) => {
    if (!shouldUseAppwrite || !appwriteConfigured) {
        return buildMockProfile({ name, email });
    }

    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if (!newAccount) throw Error;

        // Create a session right after account creation
        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name);

        if (appwriteConfig.databaseId && appwriteConfig.userCollectionId) {
            try {
                return await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.userCollectionId,
                    ID.unique(),
                    { email, name, accountId: newAccount.$id, avatar: avatarUrl }
                );
            } catch (docErr: any) {
                if (__DEV__) console.warn('[Appwrite] profile creation failed; falling back to Account data', normalizeError(docErr));
                return { name, email, avatar: avatarUrl } as unknown as Profile;
            }
        }

        return { name, email, avatar: avatarUrl } as unknown as Profile;
    } catch (e: any) {
        // If the user already exists (409), try to sign them in and upsert the profile document
        if (e?.code === 409) {
            try {
                // Try to sign in with provided credentials
                await signIn({ email, password });

                // Fetch current account and upsert profile doc if missing
                const current = await account.get();
                const avatarUrl = avatars.getInitialsURL(name);

                if (!appwriteConfig.databaseId || !appwriteConfig.userCollectionId) {
                    return { name: current.name || name, email: current.email, avatar: avatarUrl } as unknown as Profile;
                }

                const existing = await databases.listDocuments(
                    appwriteConfig.databaseId,
                    appwriteConfig.userCollectionId,
                    [Query.equal('accountId', current.$id)]
                );

                if (existing.total > 0) {
                    // Optionally patch missing fields like avatar/name
                    return existing.documents[0] as any;
                }

                try {
                    return await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.userCollectionId,
                        ID.unique(),
                        { email, name, accountId: current.$id, avatar: avatarUrl }
                    );
                } catch (docErr: any) {
                    if (__DEV__) console.warn('[Appwrite] profile upsert failed; using Account data', normalizeError(docErr));
                    return { name: current.name || name, email: current.email, avatar: avatarUrl } as unknown as Profile;
                }
            } catch (inner: any) {
                // If sign-in fails (e.g., wrong password), guide the user to sign in
                const msg = inner?.code === 401
                    ? 'This email is already registered. Please sign in with the correct password.'
                    : normalizeError(inner);
                throw new Error(msg);
            }
        }

        throw new Error(normalizeError(e));
    }
}

export const signIn = async ({ email, password }: { email: string; password: string }) => {
    if (!shouldUseAppwrite || !appwriteConfigured) {
        return { sessionId: `mock-session-${Date.now()}`, email };
    }

    try {
        await account.createEmailPasswordSession(email, password);
        try { await account.get(); } catch { }
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
    if (!shouldUseAppwrite || !appwriteConfigured) {
        return buildMockProfile() as any;
    }

    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const fallback: Profile = {
            name: currentAccount.name,
            email: currentAccount.email,
            avatar: avatars.getInitialsURL(currentAccount.name || currentAccount.email).toString()
        };

        if (!appwriteConfig.databaseId || !appwriteConfig.userCollectionId) return fallback as any;

        try {
            const currentUser = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                [Query.equal('accountId', currentAccount.$id)]
            );

            if (!currentUser || currentUser.total === 0) return fallback as any;

            return currentUser.documents[0];
        } catch (docErr: any) {
            if (docErr?.code === 404 || docErr?.code === 400) {
                if (__DEV__) console.warn('[Appwrite] user profile collection not accessible; using Account fallback');
                return fallback as any;
            }
            throw docErr;
        }
    } catch (e: any) {
        if (e?.code === 401) return null as any;
        if (__DEV__) console.log('[Appwrite] getCurrentUser error:', normalizeError(e));
        return buildMockProfile() as any;
    }
}

export const getMenu = async ({ category, query }: { category?: string; query?: string; limit?: number }) => {
    const fallback = () => {
        let list = getMockMenus({ category, query });
        if (category) {
            const normalized = category.toLowerCase();
            list = list.filter(
                (item: any) =>
                    item.name?.toLowerCase().includes(normalized) ||
                    item.description?.toLowerCase().includes(normalized),
            );
        }
        return list;
    };

    if (!shouldUseAppwrite) return fallback();

    try {
        const queries: any[] = [];

        if (category) queries.push(Query.equal('categories', category));
        if (query) queries.push(Query.search('name', query));

        if (!appwriteConfig.databaseId || !appwriteConfig.menuCollectionId) return fallback();
        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        );

        return menus.documents as any[];
    } catch (e: any) {
        if (__DEV__) console.warn('[Appwrite] menus collection not accessible - returning mock list', normalizeError(e));
        return fallback();
    }
}

export const getCategories = async () => {
    const fallback = () => getMockCategories();

    if (!shouldUseAppwrite) return fallback();

    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.categoriesCollectionId) return fallback();
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        );

        return categories.documents as any[];
    } catch (e: any) {
        if (__DEV__) console.warn('[Appwrite] categories collection not accessible - returning mock list', normalizeError(e));
        return fallback();
    }
}

export const getOwnerRestaurants = async () => {
    const fallback = () => getMockRestaurants();

    if (!shouldUseAppwrite) return fallback();

    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.restaurantsCollectionId) return fallback();
        const ownerId = await getAccountId();
        const queries = ownerId ? [Query.equal("ownerId", ownerId)] : [];
        const docs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.restaurantsCollectionId,
            queries,
        );
        return docs.documents.map(withDocumentId);
    } catch (e: any) {
        if (__DEV__) console.warn("[Appwrite] restaurants collection not accessible - returning mock list", normalizeError(e));
        return fallback();
    }
};

export const createRestaurant = async (payload: {
    name: string;
    cuisine: string;
    description?: string;
    deliveryFee?: string;
    deliveryTime?: string;
    imageUrl?: string;
}) => {
    const fallback = () => ({
        ...payload,
        id: String(Date.now()),
        $id: String(Date.now()),
    });

    if (!shouldUseAppwrite) return fallback();

    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.restaurantsCollectionId) return fallback();
        const ownerId = await getAccountId();
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.restaurantsCollectionId,
            ID.unique(),
            {
                ...payload,
                ownerId: ownerId || null,
            },
        );
        return withDocumentId(doc);
    } catch (e: any) {
        if (__DEV__) console.warn("[Appwrite] createRestaurant failed - using mock object", normalizeError(e));
        return fallback();
    }
};

export const getRestaurantMenu = async ({ restaurantId }: { restaurantId: string }) => {
    const fallback = () => {
        if (!restaurantId) return [];
        const list = sampleMenu[Number(restaurantId)] || Object.values(sampleMenu).flat();
        return list.map((item) => ({
            ...item,
            id: String(item.id ?? item.$id ?? `${restaurantId}-${item.name}`),
            $id: String(item.id ?? item.$id ?? `${restaurantId}-${item.name}`),
            restaurantId,
            price: Number(item.price),
        }));
    };

    if (!shouldUseAppwrite) return fallback();

    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.menuCollectionId || !restaurantId) return fallback();
        const docs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            [Query.equal("restaurantId", restaurantId)],
        );
        return docs.documents.map((doc: any) => ({
            ...doc,
            id: doc.$id,
            $id: doc.$id,
            price: Number(doc.price),
        }));
    } catch (e: any) {
        if (__DEV__) console.warn("[Appwrite] getRestaurantMenu failed - using mock data", normalizeError(e));
        return fallback();
    }
};

export const createMenuItem = async (restaurantId: string, payload: {
    name: string;
    price: string | number;
    description?: string;
    imageUrl?: string;
}) => {
    const fallback = () => ({
        ...payload,
        id: String(Date.now()),
        $id: String(Date.now()),
        restaurantId,
        price: Number(payload.price),
    });

    if (!shouldUseAppwrite) return fallback();

    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.menuCollectionId || !restaurantId) return fallback();
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            ID.unique(),
            {
                ...payload,
                restaurantId,
                price: Number(payload.price),
            },
        );
        return {
            ...doc,
            id: doc.$id,
            $id: doc.$id,
            price: Number(doc.price),
        };
    } catch (e: any) {
        if (__DEV__) console.warn("[Appwrite] createMenuItem failed - returning mock entry", normalizeError(e));
        return fallback();
    }
};

export const getRestaurantOrders = async (restaurantId: string) => {
    const fallback = () => getMockOrders().map((order) => ({
        ...order,
        restaurantId: restaurantId ?? "sample",
    }));

    if (!shouldUseAppwrite) return fallback();

    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.ordersCollectionId || !restaurantId) return fallback();
        const docs = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.equal("restaurantId", restaurantId)],
        );
        return docs.documents.map(withDocumentId);
    } catch (e: any) {
        if (__DEV__) console.warn("[Appwrite] getRestaurantOrders failed - using mock orders", normalizeError(e));
        return fallback();
    }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
    if (!shouldUseAppwrite) return { id: orderId, status };

    try {
        if (!appwriteConfig.databaseId || !appwriteConfig.ordersCollectionId) {
            return { id: orderId, status };
        }
        const doc = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId,
            { status },
        );
        return withDocumentId(doc);
    } catch (e: any) {
        if (__DEV__) console.warn("[Appwrite] updateOrderStatus failed", normalizeError(e));
        return { id: orderId, status };
    }
};
