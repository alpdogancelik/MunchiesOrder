import { Client, Databases, ID } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';

// Load config from app.json extra so you don't duplicate IDs
const appJsonPath = path.resolve(process.cwd(), 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
const extra = appJson.expo?.extra ?? {};

const ENDPOINT = extra.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = extra.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = extra.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_ID = extra.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID; // not used here
const CATEGORIES_ID = extra.EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID;
const MENU_ID = extra.EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID;
const CUSTOMIZATIONS_ID = extra.EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID;
const MENU_CUSTOMIZATIONS_ID = extra.EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID;

// IMPORTANT: Create an API Key in Appwrite Console (Project → API Keys) with Databases write permissions
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error('\n[seed] Missing APPWRITE_API_KEY in environment. Create a server API key in Appwrite and run:');
    console.error('  setx APPWRITE_API_KEY "<your-api-key>"  # Windows PowerShell');
    process.exit(1);
}

if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !CATEGORIES_ID || !MENU_ID || !CUSTOMIZATIONS_ID || !MENU_CUSTOMIZATIONS_ID) {
    console.error('[seed] Missing one or more IDs in app.json extra. Please fill them first.');
    process.exit(1);
}

// Minimal dummy data
const categories = [
    { name: 'Burgers' },
    { name: 'Pizzas' },
    { name: 'Burritos' },
    { name: 'Sandwiches' },
    { name: 'Wraps' },
    { name: 'Bowls' }
];

const customizations = [
    { name: 'Extra Cheese', price: 25 },
    { name: 'Jalapeños', price: 20 },
    { name: 'Onions', price: 10 },
    { name: 'Fries', price: 35 },
    { name: 'Coke', price: 30 }
];

const menu = [
    { name: 'Classic Cheeseburger', description: 'Beef patty, cheese, lettuce, tomato', image: '', price: 25.99, categories: ['Burgers'] },
    { name: 'Pepperoni Pizza', description: 'Cheesy pepperoni', image: '', price: 30.99, categories: ['Pizzas'] },
    { name: 'Bean Burrito', description: 'Beans, rice, salsa', image: '', price: 20.99, categories: ['Burritos'] },
    { name: 'Chicken Caesar Wrap', description: 'Grilled chicken, Caesar dressing', image: '', price: 21.5, categories: ['Wraps'] }
];

async function main() {
    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    console.log('[seed] Seeding categories...');
    for (const c of categories) {
        try {
            await databases.createDocument(
                DATABASE_ID,
                CATEGORIES_ID,
                ID.unique(),
                c,
                [
                    'read("any")',
                    'update("users")',
                    'delete("users")'
                ]
            );
        } catch (e) {
            if (e?.code === 409) continue; // already exists
            console.error('Category error:', e.message || e);
        }
    }

    console.log('[seed] Seeding customizations...');
    for (const cu of customizations) {
        try {
            await databases.createDocument(
                DATABASE_ID,
                CUSTOMIZATIONS_ID,
                ID.unique(),
                cu,
                [
                    'read("any")',
                    'update("users")',
                    'delete("users")'
                ]
            );
        } catch (e) {
            if (e?.code === 409) continue;
            console.error('Customization error:', e.message || e);
        }
    }

    console.log('[seed] Seeding menu...');
    for (const m of menu) {
        try {
            await databases.createDocument(
                DATABASE_ID,
                MENU_ID,
                ID.unique(),
                m,
                [
                    'read("any")',
                    'update("users")',
                    'delete("users")'
                ]
            );
        } catch (e) {
            if (e?.code === 409) continue;
            console.error('Menu error:', e.message || e);
        }
    }

    console.log('\n[seed] Done. Open the app and test Search/Home.');
}

main().catch((e) => {
    console.error('[seed] Fatal:', e);
    process.exit(1);
});
