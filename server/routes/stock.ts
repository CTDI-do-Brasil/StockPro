import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db';

export const stockRouter = Router();

// ==========================================
// 1. BOOTSTRAP / SINCRONIZAÇÃO GERAL
// ==========================================
stockRouter.get('/bootstrap', async (req: Request, res: Response) => {
  try {
    const dbStatus = getDbStatus();

    if (!dbStatus.connected) {
      return res.json({
        connected: false,
        source: 'local',
        data: null,
      });
    }

    // Consulta todas as tabelas em paralelo
    const [
      itemsRes,
      movementsRes,
      loansRes,
      workOrdersRes,
      requestsRes,
      suppliersRes,
      locationsRes,
      categoriesRes
    ] = await Promise.all([
      pool.query(`SELECT * FROM stock_items ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM stock_movements ORDER BY date DESC LIMIT 500`),
      pool.query(`SELECT * FROM equipment_loans ORDER BY borrow_date DESC`),
      pool.query(`SELECT * FROM work_orders ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM stock_requests ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM suppliers ORDER BY name ASC`),
      pool.query(`SELECT * FROM warehouse_locations ORDER BY name ASC`),
      pool.query(`SELECT * FROM categories ORDER BY name ASC`),
    ]);

    const formattedItems = itemsRes.rows.map(row => ({
      id: row.id,
      sku: row.sku,
      barcode: row.barcode || '',
      name: row.name,
      department: row.department,
      category: row.category,
      subcategory: row.subcategory || '',
      description: row.description || '',
      quantity: Number(row.quantity),
      minQuantity: Number(row.min_quantity),
      maxQuantity: Number(row.max_quantity),
      suggestedPurchaseQty: Number(row.suggested_purchase_qty || 0),
      unit: row.unit,
      unitPrice: Number(row.unit_price),
      location: typeof row.location === 'object' && row.location ? row.location : { warehouse: '', aisleRack: '', shelfBin: '' },
      supplier: row.supplier || '',
      manufacturer: row.manufacturer || '',
      partNumber: row.part_number || '',
      serialNumbers: Array.isArray(row.serial_numbers) ? row.serial_numbers : [],
      isEquipment: Boolean(row.is_equipment),
      activeLoansCount: Number(row.active_loans_count || 0),
      tags: Array.isArray(row.tags) ? row.tags : [],
      notes: row.notes || '',
      referenceLink: row.reference_link || '',
      specs: typeof row.specs === 'object' && row.specs ? row.specs : {},
      createdAt: row.created_at,
      lastUpdated: row.last_updated,
    }));

    const formattedMovements = movementsRes.rows.map(row => ({
      id: row.id,
      itemId: row.item_id,
      itemSku: row.item_sku,
      itemName: row.item_name,
      department: row.department,
      type: row.type,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unit_price),
      totalValue: Number(row.total_value),
      reason: row.reason,
      requester: row.requester,
      workOrderId: row.work_order_id || undefined,
      costCenter: row.cost_center || undefined,
      date: row.date,
      responsibleUser: row.responsible_user,
      serialNumber: row.serial_number || undefined,
      notes: row.notes || undefined,
    }));

    const formattedLoans = loansRes.rows.map(row => ({
      id: row.id,
      itemId: row.item_id,
      itemSku: row.item_sku,
      itemName: row.item_name,
      serialNumber: row.serial_number || undefined,
      department: row.department,
      borrowerName: row.borrower_name,
      borrowerBadge: row.borrower_badge,
      borrowerDept: row.borrower_dept,
      borrowDate: row.borrow_date,
      expectedReturnDate: row.expected_return_date,
      actualReturnDate: row.actual_return_date || undefined,
      status: row.status,
      conditionOnBorrow: row.condition_on_borrow,
      conditionOnReturn: row.condition_on_return || undefined,
      workOrderId: row.work_order_id || undefined,
      notes: row.notes || undefined,
    }));

    const formattedWorkOrders = workOrdersRes.rows.map(row => ({
      id: row.id,
      title: row.title,
      department: row.department,
      equipmentOrSystem: row.equipment_or_system,
      priority: row.priority,
      status: row.status,
      requester: row.requester,
      assignedTechnician: row.assigned_technician,
      itemsRequested: Array.isArray(row.items_requested) ? row.items_requested : [],
      totalCost: Number(row.total_cost || 0),
      description: row.description,
      solutionNotes: row.solution_notes || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const formattedRequests = requestsRes.rows.map(row => ({
      id: row.id,
      code: row.code,
      destination: row.destination,
      department: row.department,
      requester: row.requester,
      priority: row.priority,
      status: row.status,
      reason: row.reason,
      costCenter: row.cost_center || undefined,
      items: Array.isArray(row.items) ? row.items : [],
      totalEstimatedValue: Number(row.total_estimated_value || 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      purchasedAt: row.purchased_at || undefined,
      receivedAt: row.received_at || undefined,
      receivedBy: row.received_by || undefined,
      invoiceNumber: row.invoice_number || undefined,
      notes: row.notes || undefined,
    }));

    const formattedSuppliers = suppliersRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      cnpj: row.cnpj || '',
      contact: row.contact || '',
      email: row.email || '',
      phone: row.phone || '',
      departments: Array.isArray(row.departments) ? row.departments : [],
      categories: Array.isArray(row.categories) ? row.categories : [],
      rating: Number(row.rating || 5),
      notes: row.notes || '',
    }));

    const formattedLocations = locationsRes.rows.map(row => ({
      id: row.id,
      code: row.code,
      name: row.name,
      department: row.department,
      type: row.type,
      capacityNotes: row.capacity_notes || '',
    }));

    const formattedCategories = categoriesRes.rows.map(row => ({
      id: row.id,
      name: row.name,
      department: row.department,
      subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
      description: row.description || '',
    }));

    return res.json({
      connected: true,
      source: 'PostgreSQL (StockPro)',
      data: {
        items: formattedItems,
        movements: formattedMovements,
        loans: formattedLoans,
        workOrders: formattedWorkOrders,
        requests: formattedRequests,
        suppliers: formattedSuppliers,
        locations: formattedLocations,
        categories: formattedCategories,
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados do PostgreSQL:', error);
    return res.status(500).json({ error: 'Erro ao carregar dados do banco: ' + error.message });
  }
});

// ==========================================
// 2. SINCRONIZAÇÃO EM MASSA (IMPORT / SEED)
// ==========================================
stockRouter.post('/sync-all', async (req: Request, res: Response) => {
  try {
    const { items, movements, loans, workOrders, requests, suppliers, locations, categories } = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Categorias
      if (Array.isArray(categories)) {
        for (const cat of categories) {
          await client.query(`
            INSERT INTO categories (id, name, department, subcategories, description)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              department = EXCLUDED.department,
              subcategories = EXCLUDED.subcategories,
              description = EXCLUDED.description
          `, [cat.id, cat.name, cat.department, JSON.stringify(cat.subcategories || []), cat.description || null]);
        }
      }

      // Locais
      if (Array.isArray(locations)) {
        for (const loc of locations) {
          await client.query(`
            INSERT INTO warehouse_locations (id, code, name, department, type, capacity_notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              code = EXCLUDED.code,
              name = EXCLUDED.name,
              department = EXCLUDED.department,
              type = EXCLUDED.type,
              capacity_notes = EXCLUDED.capacity_notes
          `, [loc.id, loc.code, loc.name, loc.department || 'GERAL', loc.type, loc.capacityNotes || null]);
        }
      }

      // Fornecedores
      if (Array.isArray(suppliers)) {
        for (const sup of suppliers) {
          await client.query(`
            INSERT INTO suppliers (id, name, cnpj, contact, email, phone, departments, categories, rating, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              cnpj = EXCLUDED.cnpj,
              contact = EXCLUDED.contact,
              email = EXCLUDED.email,
              phone = EXCLUDED.phone,
              departments = EXCLUDED.departments,
              categories = EXCLUDED.categories,
              rating = EXCLUDED.rating,
              notes = EXCLUDED.notes
          `, [
            sup.id,
            sup.name,
            sup.cnpj || null,
            sup.contact || null,
            sup.email || null,
            sup.phone || null,
            JSON.stringify(sup.departments || []),
            JSON.stringify(sup.categories || []),
            sup.rating || 5.0,
            sup.notes || null,
          ]);
        }
      }

      // Itens de Estoque
      if (Array.isArray(items)) {
        for (const item of items) {
          await client.query(`
            INSERT INTO stock_items (
              id, sku, barcode, name, department, category, subcategory, description,
              quantity, min_quantity, max_quantity, suggested_purchase_qty, unit, unit_price,
              location, supplier, manufacturer, part_number, serial_numbers, is_equipment,
              active_loans_count, tags, notes, reference_link, specs, created_at, last_updated
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
            ON CONFLICT (id) DO UPDATE SET
              sku = EXCLUDED.sku,
              barcode = EXCLUDED.barcode,
              name = EXCLUDED.name,
              department = EXCLUDED.department,
              category = EXCLUDED.category,
              subcategory = EXCLUDED.subcategory,
              description = EXCLUDED.description,
              quantity = EXCLUDED.quantity,
              min_quantity = EXCLUDED.min_quantity,
              max_quantity = EXCLUDED.max_quantity,
              suggested_purchase_qty = EXCLUDED.suggested_purchase_qty,
              unit = EXCLUDED.unit,
              unit_price = EXCLUDED.unit_price,
              location = EXCLUDED.location,
              supplier = EXCLUDED.supplier,
              manufacturer = EXCLUDED.manufacturer,
              part_number = EXCLUDED.part_number,
              serial_numbers = EXCLUDED.serial_numbers,
              is_equipment = EXCLUDED.is_equipment,
              active_loans_count = EXCLUDED.active_loans_count,
              tags = EXCLUDED.tags,
              notes = EXCLUDED.notes,
              reference_link = EXCLUDED.reference_link,
              specs = EXCLUDED.specs,
              last_updated = EXCLUDED.last_updated
          `, [
            item.id,
            item.sku,
            item.barcode || null,
            item.name,
            item.department,
            item.category,
            item.subcategory || null,
            item.description || null,
            item.quantity || 0,
            item.minQuantity || 0,
            item.maxQuantity || 0,
            item.suggestedPurchaseQty || 0,
            item.unit || 'un',
            item.unitPrice || 0,
            JSON.stringify(item.location || {}),
            item.supplier || null,
            item.manufacturer || null,
            item.partNumber || null,
            JSON.stringify(item.serialNumbers || []),
            Boolean(item.isEquipment),
            item.activeLoansCount || 0,
            JSON.stringify(item.tags || []),
            item.notes || null,
            item.referenceLink || null,
            JSON.stringify(item.specs || {}),
            item.createdAt || new Date().toISOString(),
            item.lastUpdated || new Date().toISOString(),
          ]);
        }
      }

      // Movimentações
      if (Array.isArray(movements)) {
        for (const mov of movements) {
          await client.query(`
            INSERT INTO stock_movements (
              id, item_id, item_sku, item_name, department, type,
              quantity, unit_price, total_value, reason, requester,
              work_order_id, cost_center, date, responsible_user, serial_number, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO NOTHING
          `, [
            mov.id,
            mov.itemId,
            mov.itemSku,
            mov.itemName,
            mov.department,
            mov.type,
            mov.quantity,
            mov.unitPrice || 0,
            mov.totalValue || 0,
            mov.reason,
            mov.requester,
            mov.workOrderId || null,
            mov.costCenter || null,
            mov.date || new Date().toISOString(),
            mov.responsibleUser,
            mov.serialNumber || null,
            mov.notes || null,
          ]);
        }
      }

      // Cautelas
      if (Array.isArray(loans)) {
        for (const loan of loans) {
          await client.query(`
            INSERT INTO equipment_loans (
              id, item_id, item_sku, item_name, serial_number, department,
              borrower_name, borrower_badge, borrower_dept, borrow_date,
              expected_return_date, actual_return_date, status, condition_on_borrow,
              condition_on_return, work_order_id, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            ON CONFLICT (id) DO UPDATE SET
              status = EXCLUDED.status,
              actual_return_date = EXCLUDED.actual_return_date,
              condition_on_return = EXCLUDED.condition_on_return,
              notes = EXCLUDED.notes
          `, [
            loan.id,
            loan.itemId,
            loan.itemSku,
            loan.itemName,
            loan.serialNumber || null,
            loan.department,
            loan.borrowerName,
            loan.borrowerBadge,
            loan.borrowerDept,
            loan.borrowDate,
            loan.expectedReturnDate,
            loan.actualReturnDate || null,
            loan.status,
            loan.conditionOnBorrow,
            loan.conditionOnReturn || null,
            loan.workOrderId || null,
            loan.notes || null,
          ]);
        }
      }

      // Ordens de Serviço
      if (Array.isArray(workOrders)) {
        for (const wo of workOrders) {
          await client.query(`
            INSERT INTO work_orders (
              id, title, department, equipment_or_system, priority, status,
              requester, assigned_technician, items_requested, total_cost,
              description, solution_notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              department = EXCLUDED.department,
              equipment_or_system = EXCLUDED.equipment_or_system,
              priority = EXCLUDED.priority,
              status = EXCLUDED.status,
              assigned_technician = EXCLUDED.assigned_technician,
              items_requested = EXCLUDED.items_requested,
              total_cost = EXCLUDED.total_cost,
              description = EXCLUDED.description,
              solution_notes = EXCLUDED.solution_notes,
              updated_at = EXCLUDED.updated_at
          `, [
            wo.id,
            wo.title,
            wo.department,
            wo.equipmentOrSystem,
            wo.priority,
            wo.status,
            wo.requester,
            wo.assignedTechnician,
            JSON.stringify(wo.itemsRequested || []),
            wo.totalCost || 0,
            wo.description,
            wo.solutionNotes || null,
            wo.createdAt,
            wo.updatedAt,
          ]);
        }
      }

      // Requisições
      if (Array.isArray(requests)) {
        for (const reqItem of requests) {
          await client.query(`
            INSERT INTO stock_requests (
              id, code, destination, department, requester, priority, status,
              reason, cost_center, items, total_estimated_value, created_at,
              updated_at, purchased_at, received_at, received_by, invoice_number, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (id) DO UPDATE SET
              destination = EXCLUDED.destination,
              department = EXCLUDED.department,
              priority = EXCLUDED.priority,
              status = EXCLUDED.status,
              reason = EXCLUDED.reason,
              cost_center = EXCLUDED.cost_center,
              items = EXCLUDED.items,
              total_estimated_value = EXCLUDED.total_estimated_value,
              updated_at = EXCLUDED.updated_at,
              purchased_at = EXCLUDED.purchased_at,
              received_at = EXCLUDED.received_at,
              received_by = EXCLUDED.received_by,
              invoice_number = EXCLUDED.invoice_number,
              notes = EXCLUDED.notes
          `, [
            reqItem.id,
            reqItem.code,
            reqItem.destination,
            reqItem.department,
            reqItem.requester,
            reqItem.priority,
            reqItem.status,
            reqItem.reason,
            reqItem.costCenter || null,
            JSON.stringify(reqItem.items || []),
            reqItem.totalEstimatedValue || 0,
            reqItem.createdAt,
            reqItem.updatedAt,
            reqItem.purchasedAt || null,
            reqItem.receivedAt || null,
            reqItem.receivedBy || null,
            reqItem.invoiceNumber || null,
            reqItem.notes || null,
          ]);
        }
      }

      await client.query('COMMIT');
      return res.json({ success: true, message: 'Dados sincronizados com sucesso no PostgreSQL!' });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Erro no sync-all:', error);
    return res.status(500).json({ error: 'Erro ao sincronizar dados: ' + error.message });
  }
});

// ==========================================
// 3. OPERAÇÕES ESPECÍFICAS (ITENS, MOV, CAUTELAS)
// ==========================================

// Item: Criar ou Atualizar
stockRouter.post('/items', async (req: Request, res: Response) => {
  try {
    const item = req.body;
    await pool.query(`
      INSERT INTO stock_items (
        id, sku, barcode, name, department, category, subcategory, description,
        quantity, min_quantity, max_quantity, suggested_purchase_qty, unit, unit_price,
        location, supplier, manufacturer, part_number, serial_numbers, is_equipment,
        active_loans_count, tags, notes, reference_link, specs, created_at, last_updated
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      ON CONFLICT (id) DO UPDATE SET
        sku = EXCLUDED.sku,
        barcode = EXCLUDED.barcode,
        name = EXCLUDED.name,
        department = EXCLUDED.department,
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        description = EXCLUDED.description,
        quantity = EXCLUDED.quantity,
        min_quantity = EXCLUDED.min_quantity,
        max_quantity = EXCLUDED.max_quantity,
        suggested_purchase_qty = EXCLUDED.suggested_purchase_qty,
        unit = EXCLUDED.unit,
        unit_price = EXCLUDED.unit_price,
        location = EXCLUDED.location,
        supplier = EXCLUDED.supplier,
        manufacturer = EXCLUDED.manufacturer,
        part_number = EXCLUDED.part_number,
        serial_numbers = EXCLUDED.serial_numbers,
        is_equipment = EXCLUDED.is_equipment,
        active_loans_count = EXCLUDED.active_loans_count,
        tags = EXCLUDED.tags,
        notes = EXCLUDED.notes,
        reference_link = EXCLUDED.reference_link,
        specs = EXCLUDED.specs,
        last_updated = EXCLUDED.last_updated
    `, [
      item.id,
      item.sku,
      item.barcode || null,
      item.name,
      item.department,
      item.category,
      item.subcategory || null,
      item.description || null,
      item.quantity || 0,
      item.minQuantity || 0,
      item.maxQuantity || 0,
      item.suggestedPurchaseQty || 0,
      item.unit || 'un',
      item.unitPrice || 0,
      JSON.stringify(item.location || {}),
      item.supplier || null,
      item.manufacturer || null,
      item.partNumber || null,
      JSON.stringify(item.serialNumbers || []),
      Boolean(item.isEquipment),
      item.activeLoansCount || 0,
      JSON.stringify(item.tags || []),
      item.notes || null,
      item.referenceLink || null,
      JSON.stringify(item.specs || {}),
      item.createdAt || new Date().toISOString(),
      item.lastUpdated || new Date().toISOString(),
    ]);

    return res.json({ success: true, item });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Item: Deletar
stockRouter.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM stock_items WHERE id = $1`, [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Movimentação: Registrar
stockRouter.post('/movements', async (req: Request, res: Response) => {
  try {
    const mov = req.body;
    await pool.query(`
      INSERT INTO stock_movements (
        id, item_id, item_sku, item_name, department, type,
        quantity, unit_price, total_value, reason, requester,
        work_order_id, cost_center, date, responsible_user, serial_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      mov.id,
      mov.itemId,
      mov.itemSku,
      mov.itemName,
      mov.department,
      mov.type,
      mov.quantity,
      mov.unitPrice || 0,
      mov.totalValue || 0,
      mov.reason,
      mov.requester,
      mov.workOrderId || null,
      mov.costCenter || null,
      mov.date || new Date().toISOString(),
      mov.responsibleUser,
      mov.serialNumber || null,
      mov.notes || null,
    ]);

    return res.json({ success: true, movement: mov });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Cautela: Criar ou Devolver
stockRouter.post('/loans', async (req: Request, res: Response) => {
  try {
    const loan = req.body;
    await pool.query(`
      INSERT INTO equipment_loans (
        id, item_id, item_sku, item_name, serial_number, department,
        borrower_name, borrower_badge, borrower_dept, borrow_date,
        expected_return_date, actual_return_date, status, condition_on_borrow,
        condition_on_return, work_order_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        actual_return_date = EXCLUDED.actual_return_date,
        condition_on_return = EXCLUDED.condition_on_return,
        notes = EXCLUDED.notes
    `, [
      loan.id,
      loan.itemId,
      loan.itemSku,
      loan.itemName,
      loan.serialNumber || null,
      loan.department,
      loan.borrowerName,
      loan.borrowerBadge,
      loan.borrowerDept,
      loan.borrowDate,
      loan.expectedReturnDate,
      loan.actualReturnDate || null,
      loan.status,
      loan.conditionOnBorrow,
      loan.conditionOnReturn || null,
      loan.workOrderId || null,
      loan.notes || null,
    ]);

    return res.json({ success: true, loan });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Ordem de Serviço: Criar ou Atualizar
stockRouter.post('/work-orders', async (req: Request, res: Response) => {
  try {
    const wo = req.body;
    await pool.query(`
      INSERT INTO work_orders (
        id, title, department, equipment_or_system, priority, status,
        requester, assigned_technician, items_requested, total_cost,
        description, solution_notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        department = EXCLUDED.department,
        equipment_or_system = EXCLUDED.equipment_or_system,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        assigned_technician = EXCLUDED.assigned_technician,
        items_requested = EXCLUDED.items_requested,
        total_cost = EXCLUDED.total_cost,
        description = EXCLUDED.description,
        solution_notes = EXCLUDED.solution_notes,
        updated_at = EXCLUDED.updated_at
    `, [
      wo.id,
      wo.title,
      wo.department,
      wo.equipmentOrSystem,
      wo.priority,
      wo.status,
      wo.requester,
      wo.assignedTechnician,
      JSON.stringify(wo.itemsRequested || []),
      wo.totalCost || 0,
      wo.description,
      wo.solutionNotes || null,
      wo.createdAt,
      wo.updatedAt,
    ]);

    return res.json({ success: true, workOrder: wo });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Ordem de Serviço: Deletar
stockRouter.delete('/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM work_orders WHERE id = $1`, [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Requisição de Compra: Criar ou Atualizar
stockRouter.post('/requests', async (req: Request, res: Response) => {
  try {
    const reqItem = req.body;
    await pool.query(`
      INSERT INTO stock_requests (
        id, code, destination, department, requester, priority, status,
        reason, cost_center, items, total_estimated_value, created_at,
        updated_at, purchased_at, received_at, received_by, invoice_number, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        destination = EXCLUDED.destination,
        department = EXCLUDED.department,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        reason = EXCLUDED.reason,
        cost_center = EXCLUDED.cost_center,
        items = EXCLUDED.items,
        total_estimated_value = EXCLUDED.total_estimated_value,
        updated_at = EXCLUDED.updated_at,
        purchased_at = EXCLUDED.purchased_at,
        received_at = EXCLUDED.received_at,
        received_by = EXCLUDED.received_by,
        invoice_number = EXCLUDED.invoice_number,
        notes = EXCLUDED.notes
    `, [
      reqItem.id,
      reqItem.code,
      reqItem.destination,
      reqItem.department,
      reqItem.requester,
      reqItem.priority,
      reqItem.status,
      reqItem.reason,
      reqItem.costCenter || null,
      JSON.stringify(reqItem.items || []),
      reqItem.totalEstimatedValue || 0,
      reqItem.createdAt,
      reqItem.updatedAt,
      reqItem.purchasedAt || null,
      reqItem.receivedAt || null,
      reqItem.receivedBy || null,
      reqItem.invoiceNumber || null,
      reqItem.notes || null,
    ]);

    return res.json({ success: true, request: reqItem });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Requisição: Deletar
stockRouter.delete('/requests/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM stock_requests WHERE id = $1`, [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Categoria: Criar ou Atualizar
stockRouter.post('/categories', async (req: Request, res: Response) => {
  try {
    const cat = req.body;
    await pool.query(`
      INSERT INTO categories (id, name, department, subcategories, description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        department = EXCLUDED.department,
        subcategories = EXCLUDED.subcategories,
        description = EXCLUDED.description
    `, [cat.id, cat.name, cat.department, JSON.stringify(cat.subcategories || []), cat.description || null]);
    return res.json({ success: true, category: cat });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Categoria: Deletar
stockRouter.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Fornecedor: Criar ou Atualizar
stockRouter.post('/suppliers', async (req: Request, res: Response) => {
  try {
    const sup = req.body;
    await pool.query(`
      INSERT INTO suppliers (id, name, cnpj, contact, email, phone, departments, categories, rating, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        cnpj = EXCLUDED.cnpj,
        contact = EXCLUDED.contact,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        departments = EXCLUDED.departments,
        categories = EXCLUDED.categories,
        rating = EXCLUDED.rating,
        notes = EXCLUDED.notes
    `, [
      sup.id,
      sup.name,
      sup.cnpj || null,
      sup.contact || null,
      sup.email || null,
      sup.phone || null,
      JSON.stringify(sup.departments || []),
      JSON.stringify(sup.categories || []),
      sup.rating || 5.0,
      sup.notes || null,
    ]);
    return res.json({ success: true, supplier: sup });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Fornecedor: Deletar
stockRouter.delete('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM suppliers WHERE id = $1`, [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Local: Criar ou Atualizar
stockRouter.post('/locations', async (req: Request, res: Response) => {
  try {
    const loc = req.body;
    await pool.query(`
      INSERT INTO warehouse_locations (id, code, name, department, type, capacity_notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        department = EXCLUDED.department,
        type = EXCLUDED.type,
        capacity_notes = EXCLUDED.capacity_notes
    `, [loc.id, loc.code, loc.name, loc.department || 'GERAL', loc.type, loc.capacityNotes || null]);
    return res.json({ success: true, location: loc });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Local: Deletar
stockRouter.delete('/locations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM warehouse_locations WHERE id = $1`, [id]);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

