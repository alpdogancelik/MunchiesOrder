import 'dotenv/config'
import { Pool } from 'pg'
import { buildPgConfig } from '../server/pgConfig'

async function main() {
    const cfg = buildPgConfig()
    if (!cfg) {
        console.error('No DB config. Set PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD or DATABASE_URL')
        process.exit(1)
    }
    console.log('CFG', 'connectionString' in (cfg as any) ? 'URL' : `${(cfg as any).host}:${(cfg as any).port}`, 'ssl' in (cfg as any) ? 'ssl-set' : 'ssl-missing')
    const pool = new Pool(cfg as any)
    try {
        const r = await pool.query('select now() as now, current_database() as db')
        console.log('DB_OK', r.rows[0])
    } catch (e: any) {
        console.error('DB_FAIL', e?.message || e)
        process.exit(2)
    } finally {
        await pool.end()
    }
}

main().catch((e) => { console.error('DB_ERROR', e?.message || e); process.exit(1) })
