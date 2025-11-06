import { promisify } from 'util';
import { scrypt, randomBytes } from 'crypto';
import { db } from './db';
import { eq } from 'drizzle-orm';
import {
    users,
    addresses,
    restaurants,
    menuCategories,
    menuItems,
} from '@shared/schema';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
}

async function main() {
    console.log('Seeding database...');

    // Create demo users
    const ownerId = 'owner_1';
    const studentId = 'student_1';
    const courierId = 'courier_1';

    const [owner] = await db
        .insert(users)
        .values({
            id: ownerId,
            username: 'owner',
            email: 'owner@example.com',
            password: await hashPassword('owner123'),
            firstName: 'Restaurant',
            lastName: 'Owner',
            role: 'restaurant_owner',
        })
        .onConflictDoNothing()
        .returning();

    const [student] = await db
        .insert(users)
        .values({
            id: studentId,
            username: 'student',
            email: 'student@example.com',
            password: await hashPassword('student123'),
            firstName: 'Demo',
            lastName: 'Student',
            role: 'student',
        })
        .onConflictDoNothing()
        .returning();

    const [courier] = await db
        .insert(users)
        .values({
            id: courierId,
            username: 'courier',
            email: 'courier@example.com',
            password: await hashPassword('courier123'),
            firstName: 'Demo',
            lastName: 'Courier',
            role: 'courier',
        })
        .onConflictDoNothing()
        .returning();

    // Address for student
    await db
        .insert(addresses)
        .values({
            userId: studentId,
            title: 'Home',
            addressLine1: 'Campus Residences, Block A, Apt 12',
            city: 'Kalkanlı',
            country: 'TRNC',
            isDefault: true,
        })
        .onConflictDoNothing();

    // Restaurant
    const [rest] = await db
        .insert(restaurants)
        .values({
            ownerId,
            name: 'Campus Burger',
            cuisine: 'Fast Food',
            address: 'Center',
            openingHours: '9:00-22:00',
            deliveryRadius: 5,
            imageUrl: '',
            rating: '4.6',
            reviewCount: 0,
            deliveryTime: '20-35',
            deliveryFee: '19.90',
            minimumOrder: '0',
            isActive: true,
        })
        .onConflictDoNothing()
        .returning();

    const restId = rest?.id || (
        (await db.select({ id: restaurants.id }).from(restaurants).limit(1))[0]?.id
    );

    if (!restId) throw new Error('Failed to create or retrieve restaurant');

    // Menu categories and items
    const [burgers] = await db
        .insert(menuCategories)
        .values({ restaurantId: restId, name: 'Burgers', displayOrder: 1 })
        .onConflictDoNothing()
        .returning();

    const catId = burgers?.id || (
        (await db
            .select({ id: menuCategories.id })
            .from(menuCategories)
            .where(eq(menuCategories.restaurantId, restId))
            .limit(1))[0]?.id
    );

    await db
        .insert(menuItems)
        .values([
            { restaurantId: restId, categoryId: catId, name: 'Classic Burger', price: '149.90', isAvailable: true, isPopular: true },
            { restaurantId: restId, categoryId: catId, name: 'Cheeseburger', price: '159.90', isAvailable: true, isPopular: false },
        ])
        .onConflictDoNothing();

    console.log('Seed completed. Users: owner/student/courier. Restaurant and menu seeded.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
