const postgres = require('../server/node_modules/postgres');
const sql = postgres('postgresql://neondb_owner:npg_c8nlvarUh6EP@ep-falling-grass-ab31kora-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require');

async function check() {
    try {
        const res = await sql`SELECT 1 as res`;
        console.log('✅ DB works!', res);
        process.exit(0);
    } catch (e) {
        console.error('❌ DB error:', e.message);
        process.exit(1);
    }
}
check();
