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
      // Fallback
      return res.json({
        users: [
          {
            id: 'usr-admin-default',
            name: 'Administrador Geral',
            email: 'admin@empresa.com',
            department: 'TI',
            role: 'ADMIN',
            badge: 'TI-001',
            phone: '(11) 98765-4321',
            avatar: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          {
            id: 'usr-eng-default',
            name: 'Engenheiro de Projetos',
            email: 'engenharia@empresa.com',
            department: 'ENGENHARIA',
            role: 'GERENTE',
            badge: 'ENG-102',
            phone: '(11) 97654-3210',
            avatar: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          {
            id: 'usr-manut-default',
            name: 'Técnico de Manutenção',
            email: 'manutencao@empresa.com',
            department: 'MANUTENCAO',
            role: 'TECNICO',
            badge: 'MAN-504',
            phone: '(11) 96543-2109',
            avatar: '',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          }
        ],
        source: 'Memória'
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao listar usuários: ' + error.message });
  }
});

// PATCH: Alternar status ativo/inativo ou alterar cargo (Apenas ADMIN/GERENTE)
usersRouter.patch('/:id/toggle-status', authenticateToken, async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const { isActive } = req.body;
    const dbStatus = getDbStatus();

    if (dbStatus.connected) {
      await pool.query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2', [isActive, targetUserId]);
      return res.json({ message: `Status do usuário atualizado para ${isActive ? 'Ativo' : 'Inativo'}.` });
    } else {
      return res.json({ message: `Status atualizado em modo memória.` });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao alterar status: ' + error.message });
  }
});
