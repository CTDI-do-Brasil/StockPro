-- ==========================================================
-- SCHEMA DE BANCO DE DADOS: CONTROLE DE ESTOQUE (POSTGRESQL)
-- ==========================================================

-- Extensão para geração de UUID caso necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL DEFAULT 'TI', -- 'TI', 'ENGENHARIA', 'MANUTENCAO'
    role VARCHAR(50) NOT NULL DEFAULT 'OPERADOR', -- 'ADMIN', 'GERENTE', 'TECNICO', 'OPERADOR'
    badge VARCHAR(50),                             -- Matrícula / Registro funcional
    phone VARCHAR(50),
    avatar VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Tabela de Logs de Auditoria de Acesso e Operações do Usuário
CREATE TABLE IF NOT EXISTS user_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL, -- 'LOGIN', 'LOGOUT', 'REGISTER', 'UPDATE_PROFILE', 'RESET_PASSWORD'
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON user_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON user_audit_logs(created_at);
