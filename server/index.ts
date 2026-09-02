import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, getDbStatus } from './db';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Inicialização do servidor
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend do Almoxarifado rodando na porta ${PORT}`);
    console.log(`👉 API disponível em: http://localhost:${PORT}/api/auth/status`);
  });
}

startServer();
