import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configuração do pool de conexões do PostgreSQL
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'controle_estoque',
      }
);

let isDbConnected = false;

export const getDbStatus = () => ({
  connected: isDbConnected,
  host: process.env.PGHOST || (connectionString ? 'via DATABASE_URL' : 'localhost'),
  database: process.env.PGDATABASE || 'controle_estoque',
});

// Inicialização automática das tabelas no PostgreSQL
export async function initDatabase() {
  try {
    const client = await pool.connect();
    isDbConnected = true;
    console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso!');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(sql);
      console.log('✅ Tabelas e índices do PostgreSQL verificados/criados com sucesso.');
    }

    client.release();
    return true;
  } catch (error: any) {
    isDbConnected = false;
    console.warn('⚠️ Não foi possível conectar ao PostgreSQL:', error.message);
    console.info('💡 O servidor continuará em execução. Verifique suas credenciais no arquivo .env.');
    return false;
  }
}
