// React Native-friendly fetch helpers
export async function safeJson<T = any>(res: Response): Promise<T> {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
        return res.json() as Promise<T>;
    }
    const text = await res.text();
    const snippet = text.trim().slice(0, 200);
    throw new Error(
        snippet.startsWith('<!DOCTYPE') || snippet.startsWith('<html')
            ? 'Server returned HTML instead of JSON. Check API origin/URL.'
            : snippet || res.statusText || 'Unexpected non-JSON response'
    );
}
