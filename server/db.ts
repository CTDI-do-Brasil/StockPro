import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Determinar configurações padrão para o ambiente CapRover / Produção / Local
const defaultHost = process.env.NODE_ENV === 'production' ? 'srv-captain--db-postgres' : 'localhost';
const defaultDatabase = 'StockPro';
const defaultUser = 'postgres';
const defaultPassword = 'postgres';

function getPoolConfig(forceNoSsl = false): PoolConfig {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const isInternal = connectionString.includes('srv-captain--') || connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    const ssl = (forceNoSsl || isInternal)
      ? false
      : (process.env.PGSSL === 'true' || connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false);

    return {
      connectionString,
      ssl,
      connectionTimeoutMillis: 6000,
    };
  }

  const host = process.env.PGHOST || defaultHost;
  const isInternal = host.includes('srv-captain--') || host === 'localhost' || host === '127.0.0.1';
  const ssl = (forceNoSsl || isInternal)
    ? false
    : (process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false);

  return {
    host,
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || defaultUser,
    password: process.env.PGPASSWORD || defaultPassword,
    database: process.env.PGDATABASE || defaultDatabase,
    ssl,
    connectionTimeoutMillis: 6000,
  };
}

export let pool = new Pool(getPoolConfig());

let isDbConnected = false;

export const getDbStatus = () => ({
  connected: isDbConnected,
  host: process.env.PGHOST || (process.env.DATABASE_URL ? 'via DATABASE_URL' : defaultHost),
  database: process.env.PGDATABASE || defaultDatabase,
});

// Inicialização automática das tabelas no PostgreSQL
export async function initDatabase(): Promise<boolean> {
  try {
    const client = await pool.connect();
    isDbConnected = true;
    console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso!');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(sql);
      try {
        await client.query('ALTER TABLE users ALTER COLUMN department TYPE VARCHAR(150)');
      } catch (e) {}
      console.log('✅ Tabelas e índices do PostgreSQL verificados/criados com sucesso.');
    }

    client.release();
    return true;
  } catch (error: any) {
    // Se o erro foi relacionado a SSL, tenta novamente sem SSL
    if (error.message && (error.message.includes('SSL') || error.message.includes('ssl'))) {
      console.warn('⚠️ Erro de SSL detectado no PostgreSQL, tentando reconectar sem SSL...');
      try {
        await pool.end().catch(() => {});
        pool = new Pool(getPoolConfig(true));
        const client = await pool.connect();
        isDbConnected = true;
        console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso (sem SSL)!');
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf-8');
          await client.query(sql);
          try {
            await client.query('ALTER TABLE users ALTER COLUMN department TYPE VARCHAR(150)');
          } catch (e) {}
        }
        client.release();
        return true;
      } catch (retryError: any) {
        console.warn('⚠️ Falha ao reconectar sem SSL:', retryError.message);
      }
    }

    isDbConnected = false;
    console.warn('⚠️ Não foi possível conectar ao PostgreSQL:', error.message);
    console.info('💡 O servidor funcionará com armazenamento persistente em arquivo local.');
    return false;
  }
}

// Tentar reconectar periodicamente caso o banco estivesse inicializando
setInterval(async () => {
  if (!isDbConnected) {
    try {
      const client = await pool.connect();
      isDbConnected = true;
      console.log('🔄 PostgreSQL reconectado automaticamente!');
      client.release();
    } catch {}
  }
}, 15000);
