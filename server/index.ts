import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { initDatabase, getDbStatus } from './db';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { stockRouter } from './routes/stock';

dotenv.config();

const app = express();
// No CapRover a porta padrão é 80; em desenvolvimento local é 5000
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 80 : 5000);

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/stock', stockRouter);

// Status da API e do Banco
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: getDbStatus(),
  });
});

// Servir os arquivos estáticos do frontend compilado (SPA)
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Qualquer rota que não comece com /api retorna o index.html da SPA
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Inicialização do servidor
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Almoxarifado rodando na porta ${PORT}`);
    console.log(`👉 API disponível em: http://localhost:${PORT}/api/auth/status`);
  });
}

startServer();
