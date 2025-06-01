/*
Test script to verify PostgreSQL database connection
Run this file to test if the database connection is working properly
Usage: node test_db_connection.js
*/

const pool = require('./db');

async function testConnection() {
    try {
        console.log('🔄 Testing database connection...');
        
        // Test basic connection
        const client = await pool.connect();
        console.log('✅ Database connection successful!');
        
        // Test a simple query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('📅 Current database time:', result.rows[0].current_time);
        
        // Test if our tables exist
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        
        const tablesResult = await client.query(tablesQuery);
        console.log('📊 Available tables:');
        tablesResult.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });
        
        // Test buffet_options table specifically
        const buffetQuery = 'SELECT COUNT(*) as count FROM buffet_options';
        const buffetResult = await client.query(buffetQuery);
        console.log(`🍽️  Buffet options in database: ${buffetResult.rows[0].count}`);
        
        client.release();
        console.log('✅ All database tests passed!');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('🔧 Please check:');
        console.error('   - Database server is running');
        console.error('   - Connection details in .env file are correct');
        console.error('   - Database and tables exist');
        console.error('   - User has proper permissions');
    } finally {
        await pool.end();
        process.exit(0);
    }
}

// Run the test
testConnection();
