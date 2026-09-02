import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDatabase, getDbStatus } from './db';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';

dotenv.config();

const app = express();
// No CapRover a porta padrão costuma ser 80 ou injetada via PORT
const PORT = process.env.PORT || 80;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

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
