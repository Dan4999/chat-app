const { Pool } = require('pg');
require('dotenv').config();

// USAR DATABASE_URL DE RENDER SI EXISTE
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL no está definida');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString.includes('render.com') ? { rejectUnauthorized: false } : false
});

// Función para probar conexión
async function testConnection() {
    let client;
    try {
        client = await pool.connect();
        console.log('✅ Conectado a PostgreSQL (Render)');
        
        const result = await client.query('SELECT current_database() as db');
        console.log(`📊 Base de datos: ${result.rows[0].db}`);
        
        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        return false;
    } finally {
        if (client) client.release();
    }
}

// Ejecutar prueba de conexión inmediatamente
testConnection();

pool.on('error', (err) => {
    console.error('💥 Error inesperado en PostgreSQL:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    testConnection
};
