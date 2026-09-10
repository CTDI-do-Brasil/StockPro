import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pool, getDbStatus } from '../db';
import { authenticateToken, fallbackUsers, normalizeDepartments, saveFallbackUsers } from './auth';

export const usersRouter = Router();

function formatUser(u: any) {
  const depts = normalizeDepartments(u.department, u.departments);
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    department: depts.primary,
    departments: depts.list,
    role: u.role,
    badge: u.badge || '',
    phone: u.phone || '',
    avatar: u.avatar || '',
    isActive: u.is_active ?? (u.isActive ?? true),
    createdAt: u.created_at || u.createdAt,
    updatedAt: u.updated_at || u.updatedAt,
    lastLogin: u.last_login || u.lastLogin,
  };
}

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
        users: result.rows.map(formatUser),
        source: 'PostgreSQL'
      });
    } else {
      // Retornar usuários em memória caso o PostgreSQL esteja offline
      return res.json({
        users: fallbackUsers.map(formatUser),
        source: 'Memória (Offline)'
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar usuários: ' + error.message });
  }
});

// POST: Criar novo usuário (Admin/Gestão)
usersRouter.post('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const { name, email, password, department, departments, role, badge, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha inicial são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const dbStatus = getDbStatus();
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const parsedDepts = normalizeDepartments(department, departments);
    const userDept = parsedDepts.joined;
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
        user: formatUser(u)
      });
    } else {
      // Fallback em memória (Offline)
      const existing = fallbackUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'Já existe um usuário com este e-mail.' });
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
        avatar: '',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      fallbackUsers.push(newUser);
      saveFallbackUsers();

      return res.status(201).json({
        message: 'Usuário criado com sucesso!',
        user: formatUser(newUser)
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao criar usuário: ' + error.message });
  }
});

// PUT: Ajustar / Atualizar dados do usuário
usersRouter.put('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { name, email, department, departments, role, badge, phone, isActive } = req.body;
    const dbStatus = getDbStatus();

    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const parsedDepts = normalizeDepartments(department, departments);
    const userDept = parsedDepts.joined;
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
        user: formatUser(u)
      });
    } else {
      // Fallback em memória (Offline)
      const userIndex = fallbackUsers.findIndex(u => u.id === targetUserId);
      if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const duplicate = fallbackUsers.find(u => u.email.toLowerCase() === cleanEmail && u.id !== targetUserId);
      if (duplicate) {
        return res.status(400).json({ error: 'Este e-mail já está sendo utilizado por outro usuário.' });
      }

      const u = fallbackUsers[userIndex];
      u.name = name.trim();
      u.email = cleanEmail;
      u.department = userDept;
      u.role = userRole;
      u.badge = badge || '';
      u.phone = phone || '';
      if (isActive !== undefined) u.is_active = Boolean(isActive);
      u.updated_at = new Date().toISOString();
      saveFallbackUsers();

      return res.json({
        message: 'Dados do usuário atualizados com sucesso!',
        user: formatUser(u)
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao atualizar usuário: ' + error.message });
  }
});

// PATCH: Alternar status ativo/inativo
usersRouter.patch('/:id/toggle-status', authenticateToken, async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { isActive } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      const result = await pool.query(
        'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, is_active',
        [isActive, targetUserId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      return res.json({ message: `Status do usuário atualizado para ${isActive ? 'Ativo' : 'Inativo'}.` });
    } else {
      const user = fallbackUsers.find(u => u.id === targetUserId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      user.is_active = isActive !== undefined ? Boolean(isActive) : !user.is_active;
      user.updated_at = new Date().toISOString();
      saveFallbackUsers();
      return res.json({ message: `Status do usuário atualizado para ${user.is_active ? 'Ativo' : 'Inativo'}.` });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao alterar status: ' + error.message });
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

    const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

    if (dbStatus.connected) {
      const result = await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email',
        [passwordHash, targetUserId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.json({ message: `Senha do usuário ${result.rows[0].name} redefinida com sucesso!` });
    } else {
      const user = fallbackUsers.find(u => u.id === targetUserId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      user.password_hash = passwordHash;
      user.updated_at = new Date().toISOString();
      saveFallbackUsers();
      return res.json({ message: `Senha do usuário ${user.name} redefinida com sucesso!` });
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
      const index = fallbackUsers.findIndex(u => u.id === targetUserId);
      if (index === -1) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      const deleted = fallbackUsers.splice(index, 1)[0];
      saveFallbackUsers();
      return res.json({ message: `Usuário ${deleted.name} excluído com sucesso.` });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao excluir usuário: ' + error.message });
  }
});
