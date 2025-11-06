// Lightweight in-memory storage for development without DATABASE_URL
// Only implements methods used by auth endpoints

import type {
    User,
    InsertSecurityLog,
} from "@shared/schema";

interface NewUser {
    id: string;
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

class MemoryStorage {
    private users = new Map<string, User & { password: string }>();

    async getUser(id: string): Promise<User | undefined> {
        const u = this.users.get(id);
        if (!u) return undefined;
        const { password, ...rest } = u;
        return rest as User;
    }

    async getUserByUsername(username: string): Promise<(User & { password: string }) | undefined> {
        const it = this.users.values();
        let next = it.next();
        while (!next.done) {
            const u = next.value;
            if (u.username === username) return u;
            next = it.next();
        }
        return undefined;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const it = this.users.values();
        let next = it.next();
        while (!next.done) {
            const u = next.value as any;
            if (u.email === email) {
                const { password, ...rest } = u;
                return rest as User;
            }
            next = it.next();
        }
        return undefined;
    }

    async createUser(user: NewUser): Promise<User> {
        const newUser: any = {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            role: "student",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(newUser.id, newUser);
        const { password, ...rest } = newUser;
        return rest as User;
    }

    async createSecurityLog(_log: InsertSecurityLog): Promise<any> {
        // no-op in memory
        return { ok: true };
    }
}

export const memoryStorage = new MemoryStorage();
