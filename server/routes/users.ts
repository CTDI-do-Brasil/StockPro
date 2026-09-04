import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool, getDbStatus } from '../db';
import { authenticateToken } from './auth';

export const usersRouter = Router();

// GET: Listar todos os usuários cadastrados
usersRouter.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const result = await pool.query(
        `SELECT id, name, email, department, role, badge, phone, avatar, is_active, created_at, updated_at, last_login 
         FROM users ORDER BY created_at DESC`
      );
      return res.json({
        users: result.rows.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          department: u.department,
          role: u.role,
          badge: u.badge || '',
          phone: u.phone || '',
          avatar: u.avatar || '',
          isActive: u.is_active,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
          lastLogin: u.last_login,
        })),
        source: 'PostgreSQL'
      });
    } else {
      // Fallback vazio
      return res.json({
        users: [],
        source: 'Memória'
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar usuários: ' + error.message });
  }
});

// POST: Criar novo usuário (Admin/Gestão)
usersRouter.post('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const { name, email, password, department, role, badge, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha inicial são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const dbStatus = getDbStatus();
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const userDept = ['TI', 'ENGENHARIA', 'MANUTENCAO'].includes(department) ? department : 'TI';
    const userRole = ['ADMIN', 'GERENTE', 'TECNICO', 'OPERADOR'].includes(role) ? role : 'OPERADOR';

    if (dbStatus.connected) {
      const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Já existe um usuário com este e-mail.' });
      }

      const query = `
        INSERT INTO users (id, name, email, password_hash, department, role, badge, phone, is_active, created_at, updated_at, last_login)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW(), NOW())
        RETURNING id, name, email, department, role, badge, phone, avatar, is_active, created_at, updated_at, last_login
      `;
      const values = [userId, name.trim(), cleanEmail, passwordHash, userDept, userRole, badge || '', phone || ''];
      const result = await pool.query(query, values);
      const u = result.rows[0];

      return res.status(201).json({
        message: 'Usuário criado com sucesso!',
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          department: u.department,
          role: u.role,
          badge: u.badge || '',
          phone: u.phone || '',
          avatar: u.avatar || '',
          isActive: u.is_active,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
          lastLogin: u.last_login
        }
      });
    } else {
      return res.status(503).json({ error: 'Banco de dados PostgreSQL indisponível para criação de usuário.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message });
  }
});

// PUT: Ajustar / Atualizar dados do usuário
usersRouter.put('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { name, email, department, role, badge, phone, isActive } = req.body;
    const dbStatus = getDbStatus();

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userDept = ['TI', 'ENGENHARIA', 'MANUTENCAO'].includes(department) ? department : 'TI';
    const userRole = ['ADMIN', 'GERENTE', 'TECNICO', 'OPERADOR'].includes(role) ? role : 'OPERADOR';

    if (dbStatus.connected) {
      // Verificar unicidade de email com outro usuário
      const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2', [cleanEmail, targetUserId]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Este e-mail já está sendo utilizado por outro usuário.' });
      }

      const query = `
        UPDATE users 
        SET name = $1, email = $2, department = $3, role = $4, badge = $5, phone = $6, is_active = COALESCE($7, is_active), updated_at = NOW()
        WHERE id = $8
        RETURNING id, name, email, department, role, badge, phone, avatar, is_active, created_at, updated_at, last_login
      `;
      const values = [name.trim(), cleanEmail, userDept, userRole, badge || '', phone || '', isActive, targetUserId];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const u = result.rows[0];
      return res.json({
        message: 'Dados do usuário atualizados com sucesso!',
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          department: u.department,
          role: u.role,
          badge: u.badge || '',
          phone: u.phone || '',
          avatar: u.avatar || '',
          isActive: u.is_active,
          createdAt: u.created_at,
          updatedAt: u.updated_at,
          lastLogin: u.last_login
        }
      });
    } else {
      return res.status(503).json({ error: 'Banco de dados PostgreSQL indisponível.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
  }
});

// PATCH: Redefinir senha de um usuário
usersRouter.patch('/:id/reset-password', authenticateToken, async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { newPassword } = req.body;
    const dbStatus = getDbStatus();

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'A nova senha deve conter pelo menos 4 caracteres.' });
    }

    if (dbStatus.connected) {
      const passwordHash = await bcrypt.hash(newPassword.trim(), 10);
      const result = await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email',
        [passwordHash, targetUserId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.json({ message: `Senha do usuário ${result.rows[0].name} redefinida com sucesso!` });
    } else {
      return res.status(503).json({ error: 'Banco de dados PostgreSQL indisponível.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao redefinir senha: ' + error.message });
  }
});

// DELETE: Excluir usuário
usersRouter.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [targetUserId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      return res.json({ message: `Usuário ${result.rows[0].name} excluído com sucesso.` });
    } else {
      return res.status(503).json({ error: 'Banco de dados PostgreSQL indisponível.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao excluir usuário: ' + error.message });
  }
});
