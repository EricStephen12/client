import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

export const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1, // Keep it low for serverless environments
});
