import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {}) as Record<string, string>;
const API_BASE = (process.env.EXPO_PUBLIC_API_BASE as string | undefined) || extra.EXPO_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

async function ensureOk(res: Response) {
    if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
    }
}

export async function apiRequest(method: string, path: string, data?: any) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const res = await fetch(url, {
        method,
        headers: data ? { 'Content-Type': 'application/json' } : {},
        credentials: 'include',
        body: data ? JSON.stringify(data) : undefined,
    });
    await ensureOk(res);
    return res;
}

export async function apiGet<T = any>(path: string): Promise<T> {
    const res = await apiRequest('GET', path);
    return (await res.json()) as T;
}

export { API_BASE };
