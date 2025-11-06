import type { PoolConfig } from 'pg'

// Build a pg PoolConfig from environment variables without requiring a single DATABASE_URL
// Priority:
// 1) Explicit PG* vars (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD)
// 2) SUPABASE_* helpers (SUPABASE_HOST/POOLER_HOST etc.) – optional naming convenience
// 3) Fallback to DATABASE_URL for backward compatibility

function toInt(v: string | undefined, def: number): number {
    const n = v ? parseInt(v, 10) : NaN
    return Number.isFinite(n) ? n : def
}

function isSupabaseHost(host?: string): boolean {
    if (!host) return false
    return host.includes('supabase.co') || host.includes('pooler.supabase.com')
}

export function buildPgConfig(): PoolConfig | { connectionString: string } | undefined {
    const host = process.env.PGHOST || process.env.SUPABASE_HOST || process.env.SUPABASE_POOLER_HOST
    const portStr = process.env.PGPORT || process.env.SUPABASE_PORT || (host?.includes('pooler.supabase.com') ? '6543' : undefined)
    const database = process.env.PGDATABASE || process.env.SUPABASE_DB || 'postgres'
    const user = process.env.PGUSER || process.env.SUPABASE_USER || 'postgres'
    const password = process.env.PGPASSWORD || process.env.SUPABASE_PASSWORD

    if (host && password) {
        const needsSSL = process.env.PGSSLMODE === 'require' || isSupabaseHost(host)
        const cfg: PoolConfig = {
            host,
            port: toInt(portStr, 5432),
            database,
            user,
            password,
            ssl: needsSSL ? { rejectUnauthorized: false } as any : undefined,
        }
        return cfg
    }

    // Back-compat for environments that still provide DATABASE_URL
    const url = process.env.DATABASE_URL
    if (url) {
        const needsSSL = process.env.PGSSLMODE === 'require' || url.includes('supabase.co')
        return { connectionString: url + '', ...(needsSSL ? { ssl: { rejectUnauthorized: false } as any } : {}) } as any
    }

    return undefined
}

export function hasDatabaseConfig(): boolean {
    return !!buildPgConfig()
}

export function sslRequiredFor(cfg: PoolConfig | { connectionString: string } | undefined): boolean {
    if (!cfg) return false
    if ('connectionString' in cfg) {
        return (process.env.PGSSLMODE === 'require') || (cfg.connectionString || '').includes('supabase.co')
    }
    return !!cfg.host && (process.env.PGSSLMODE === 'require' || isSupabaseHost(cfg.host))
}
