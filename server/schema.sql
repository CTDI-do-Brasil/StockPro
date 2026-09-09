-- ==========================================================
-- SCHEMA DE BANCO DE DADOS: CONTROLE DE ESTOQUE (POSTGRESQL)
-- Banco: StockPro
-- ==========================================================

-- Extensão para geração de UUID caso necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabela de Usuários
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

-- 2. Tabela de Logs de Auditoria de Usuários
CREATE TABLE IF NOT EXISTS user_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150),
    action VARCHAR(100) NOT NULL, -- 'LOGIN', 'LOGOUT', 'REGISTER', 'UPDATE_PROFILE', 'RESET_PASSWORD'
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Categorias e Subcategorias
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(50) NOT NULL, -- 'TI', 'ENGENHARIA', 'MANUTENCAO'
    subcategories JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Locais Físicos do Almoxarifado
CREATE TABLE IF NOT EXISTS warehouse_locations (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(50) NOT NULL DEFAULT 'GERAL',
    type VARCHAR(50) NOT NULL, -- 'Almoxarifado', 'Oficina', 'Sala Técnica', 'Bancada', 'Armário'
    capacity_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    cnpj VARCHAR(50),
    contact VARCHAR(150),
    email VARCHAR(150),
    phone VARCHAR(50),
    departments JSONB DEFAULT '[]'::jsonb,
    categories JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Itens de Estoque
CREATE TABLE IF NOT EXISTS stock_items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL, -- 'TI', 'ENGENHARIA', 'MANUTENCAO'
    category VARCHAR(150) NOT NULL,
    subcategory VARCHAR(150),
    description TEXT,
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    min_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    max_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    suggested_purchase_qty NUMERIC(12, 2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'un',
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    location JSONB DEFAULT '{}'::jsonb,
    supplier VARCHAR(200),
    manufacturer VARCHAR(200),
    part_number VARCHAR(100),
    serial_numbers JSONB DEFAULT '[]'::jsonb,
    is_equipment BOOLEAN NOT NULL DEFAULT FALSE,
    active_loans_count INT DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    reference_link TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(50) PRIMARY KEY,
    item_id VARCHAR(50) REFERENCES stock_items(id) ON DELETE CASCADE,
    item_sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'ENTRADA', 'SAIDA', 'AJUSTE', 'CAUTELA_RETIRADA', 'CAUTELA_DEVOLUCAO', 'BAIXA_MANUTENCAO'
    quantity NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    requester VARCHAR(150) NOT NULL,
    work_order_id VARCHAR(50),
    cost_center VARCHAR(100),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    responsible_user VARCHAR(150) NOT NULL,
    serial_number VARCHAR(100),
    notes TEXT
);

-- 8. Tabela de Cautelas / Empréstimos de Equipamentos
CREATE TABLE IF NOT EXISTS equipment_loans (
    id VARCHAR(50) PRIMARY KEY,
    item_id VARCHAR(50) REFERENCES stock_items(id) ON DELETE SET NULL,
    item_sku VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100),
    department VARCHAR(50) NOT NULL,
    borrower_name VARCHAR(150) NOT NULL,
    borrower_badge VARCHAR(50) NOT NULL,
    borrower_dept VARCHAR(100) NOT NULL,
    borrow_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'ATIVO', -- 'ATIVO', 'DEVOLVIDO', 'ATRASADO'
    condition_on_borrow TEXT NOT NULL,
    condition_on_return TEXT,
    work_order_id VARCHAR(50),
    notes TEXT
);

-- 9. Tabela de Ordens de Serviço (Manutenção, TI e Engenharia)
CREATE TABLE IF NOT EXISTS work_orders (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL,
    equipment_or_system VARCHAR(255) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIA', -- 'BAIXA', 'MEDIA', 'ALTA', 'CRITICA'
    status VARCHAR(50) NOT NULL DEFAULT 'ABERTA', -- 'ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA'
    requester VARCHAR(150) NOT NULL,
    assigned_technician VARCHAR(150) NOT NULL,
    items_requested JSONB DEFAULT '[]'::jsonb,
    total_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    solution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela de Solicitações de Compras (Uso Imediato vs Reposição)
CREATE TABLE IF NOT EXISTS stock_requests (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    destination VARCHAR(50) NOT NULL, -- 'USO_IMEDIATO', 'REPOSICAO_ESTOQUE'
    department VARCHAR(50) NOT NULL,
    requester VARCHAR(150) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL', -- 'BAIXA', 'NORMAL', 'ALTA', 'URGENTE'
    status VARCHAR(50) NOT NULL DEFAULT 'SOLICITADO', -- 'SOLICITADO', 'EM_COTACAO', 'COMPRADO', 'RECEBIDO', 'CANCELADO'
    reason TEXT NOT NULL,
    cost_center VARCHAR(100),
    items JSONB DEFAULT '[]'::jsonb,
    total_estimated_value NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    purchased_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    received_by VARCHAR(150),
    invoice_number VARCHAR(100),
    notes TEXT
);

-- ==========================================================
-- ÍNDICES DE PERFORMANCE E CONSULTA
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON user_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON user_audit_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_items_sku ON stock_items(sku);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON stock_items(barcode);
CREATE INDEX IF NOT EXISTS idx_items_department ON stock_items(department);
CREATE INDEX IF NOT EXISTS idx_items_category ON stock_items(category);

CREATE INDEX IF NOT EXISTS idx_movements_item_id ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_dept ON stock_movements(department);
CREATE INDEX IF NOT EXISTS idx_movements_type ON stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_movements_date ON stock_movements(date);

CREATE INDEX IF NOT EXISTS idx_loans_item_id ON equipment_loans(item_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON equipment_loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_dept ON equipment_loans(department);

CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_dept ON work_orders(department);

CREATE INDEX IF NOT EXISTS idx_requests_code ON stock_requests(code);
CREATE INDEX IF NOT EXISTS idx_requests_status ON stock_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_dept ON stock_requests(department);
