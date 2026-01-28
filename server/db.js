const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'chat_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

// Función para probar conexión
async function testConnection() {
    let client;
    try {
        client = await pool.connect();
        console.log('✅ Conectado a PostgreSQL');
        
        // Opcional: verificar la base de datos
        const result = await client.query('SELECT current_database() as db, version()');
        console.log(`📊 Base de datos: ${result.rows[0].db}`);
        
        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        console.log('🔧 Configuración usada:');
        console.log('  Host:', process.env.DB_HOST || 'localhost');
        console.log('  Puerto:', process.env.DB_PORT || 5432);
        console.log('  BD:', process.env.DB_NAME || 'chat_app');
        console.log('  Usuario:', process.env.DB_USER || 'postgres');
        console.log('  Contraseña:', process.env.DB_PASSWORD ? '***' : '(vacía)');
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
    testConnection // Exportar para poder llamarla desde otros lugares
};