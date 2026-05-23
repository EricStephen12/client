const { sql } = require('../server/db/index');

async function check() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Tables found in database:');
    console.log(tables.map(t => t.table_name));

    // Test a select query on users
    const userCount = await sql`SELECT count(*) FROM users`;
    console.log('User count:', userCount[0].count);

    // Test select query on lounge_sessions
    const loungeCount = await sql`SELECT count(*) FROM lounge_sessions`;
    console.log('Lounge sessions count:', loungeCount[0].count);
  } catch (err) {
    console.error('Database query error:', err.message);
  }
}

check();
