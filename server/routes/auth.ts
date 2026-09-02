import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, getDbStatus } from '../db';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_estoque_ti_eng_manut_2026';

// Memória de fallback vazia
const fallbackUsers: any[] = [];

// Helper para gerar token JWT
function generateToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      department: user.department,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Helper para formatar usuário sem expor senha
function sanitizeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role,
    badge: user.badge || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
    isActive: user.is_active ?? true,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    lastLogin: user.last_login,
  };
}

// Status de conexão do PostgreSQL
authRouter.get('/status', (req: Request, res: Response) => {
  res.json({
    database: getDbStatus(),
    timestamp: new Date().toISOString(),
  });
});

// Middleware para verificar autenticação
export function authenticateToken(req: any, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token de autenticação não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
}

// POST: Registrar novo usuário
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, department, role, badge, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const dbStatus = getDbStatus();
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const userDept = department || 'TI';
    const userRole = role || 'OPERADOR';

    if (dbStatus.connected) {
      // Verificar se já existe e-mail no Postgres
      const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
      }

      const query = `
        INSERT INTO users (id, name, email, password_hash, department, role, badge, phone, created_at, updated_at, last_login)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW())
        RETURNING *
      `;
      const values = [userId, name.trim(), cleanEmail, passwordHash, userDept, userRole, badge || '', phone || ''];
      const result = await pool.query(query, values);
      const newUser = result.rows[0];

      // Gravar auditoria
      try {
        await pool.query(
          `INSERT INTO user_audit_logs (id, user_id, user_name, action, details, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [`log-${Date.now()}`, newUser.id, newUser.name, 'REGISTER', 'Novo usuário registrado no Postgres', req.ip]
        );
      } catch (e) {}

      const token = generateToken(newUser);
      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso no PostgreSQL!',
        user: sanitizeUser(newUser),
        token,
        databaseSource: 'PostgreSQL',
      });
    } else {
      // Fallback
      const existing = fallbackUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
      }

      const newUser = {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        password_hash: passwordHash,
        department: userDept,
        role: userRole,
        badge: badge || '',
        phone: phone || '',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };
      fallbackUsers.push(newUser);

      const token = generateToken(newUser);
      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        user: sanitizeUser(newUser),
        token,
        databaseSource: 'Memória (Postgres Offline)',
      });
    }
  } catch (error: any) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno ao registrar usuário: ' + error.message });
  }
});

// POST: Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e a senha.' });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({ error: 'Esta conta de usuário foi desativada pelo administrador.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e a senha.' });
      }

      // Atualizar last_login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
      user.last_login = new Date();

      // Gravar log de auditoria
      try {
        await pool.query(
          `INSERT INTO user_audit_logs (id, user_id, user_name, action, details, ip_address)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [`log-${Date.now()}`, user.id, user.name, 'LOGIN', 'Login bem-sucedido no Postgres', req.ip]
        );
      } catch (e) {}

      const token = generateToken(user);
      return res.json({
        message: 'Login realizado com sucesso no PostgreSQL!',
        user: sanitizeUser(user),
        token,
        databaseSource: 'PostgreSQL',
      });
    } else {
      // Fallback
      const user = fallbackUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e a senha.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e a senha.' });
      }

      user.last_login = new Date().toISOString();
      const token = generateToken(user);

      return res.json({
        message: 'Login realizado com sucesso!',
        user: sanitizeUser(user),
        token,
        databaseSource: 'Memória (Postgres Offline)',
      });
    }
  } catch (error: any) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno ao realizar login: ' + error.message });
  }
});

// GET: Obter dados do usuário logado atual (/me)
authRouter.get('/me', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      return res.json({ user: sanitizeUser(result.rows[0]) });
    } else {
      const user = fallbackUsers.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      return res.json({ user: sanitizeUser(user) });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao buscar perfil: ' + error.message });
  }
});

// PUT: Atualizar perfil do usuário logado
authRouter.put('/update-profile', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, department, role, badge, phone, avatar } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name),
             department = COALESCE($2, department),
             role = COALESCE($3, role),
             badge = COALESCE($4, badge),
             phone = COALESCE($5, phone),
             avatar = COALESCE($6, avatar),
             updated_at = NOW()
         WHERE id = $7
         RETURNING *`,
        [name, department, role, badge, phone, avatar, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const updatedUser = result.rows[0];
      const token = generateToken(updatedUser);

      return res.json({
        message: 'Perfil atualizado com sucesso no PostgreSQL!',
        user: sanitizeUser(updatedUser),
        token,
      });
    } else {
      const user = fallbackUsers.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (name) user.name = name;
      if (department) user.department = department;
      if (role) user.role = role;
      if (badge !== undefined) user.badge = badge;
      if (phone !== undefined) user.phone = phone;
      if (avatar !== undefined) user.avatar = avatar;
      user.updated_at = new Date().toISOString();

      const token = generateToken(user);

      return res.json({
        message: 'Perfil atualizado com sucesso!',
        user: sanitizeUser(user),
        token,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar perfil: ' + error.message });
  }
});
