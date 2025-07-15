// Importo mysql
const mysql = require("mysql2");

// Validar que existan las variables críticas de seguridad
const validateRequiredEnvVars = () => {
    const requiredVars = ['DATABASE_HOST', 'DATABASE_USER', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.error('❌ Variables de entorno faltantes:', missing);
        throw new Error(`Variables de entorno requeridas: ${missing.join(', ')}`);
    }
};

// Configuración única para Clever Cloud MySQL (desarrollo y producción)
const connection = mysql.createPool({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: { rejectUnauthorized: false },
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10
});

// Validar variables y usar la conexión
validateRequiredEnvVars();

const entorno = process.env.NODE_ENV === 'production' ? 'PRODUCCIÓN' : 'DESARROLLO';
console.log(`🔗 Conectando a: ${entorno} (Clever Cloud MySQL)`);
console.log(`📊 Variables de entorno validadas: ✅`);

module.exports = {
    conection: connection
};
