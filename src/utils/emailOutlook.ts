import { StockRequest } from '../types';

/**
 * Converte caracteres especiais para entidades HTML seguras
 */
function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Gera o corpo HTML formatado do e-mail com design otimizado para o Microsoft Outlook
 */
export function buildRequestEmailHtml(request: StockRequest): string {
  const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
    URGENTE: { bg: '#ffe4e6', text: '#9f1239', label: '🔴 URGENTE' },
    ALTA: { bg: '#fef3c7', text: '#92400e', label: '🟠 ALTA' },
    NORMAL: { bg: '#e0f2fe', text: '#0369a1', label: '🔵 NORMAL' },
    BAIXA: { bg: '#dcfce7', text: '#15803d', label: '🟢 BAIXA' }
  };

  const priorityStyle = priorityColors[request.priority] || priorityColors.NORMAL;
  const destinationLabel = request.destination === 'REPOSICAO_ESTOQUE' 
    ? '📦 Reposição de Estoque (Almoxarifado)' 
    : '⚡ Uso Imediato / Aplicação Direta';

  const rowsHtml = request.items.map((item, index) => {
    const isEven = index % 2 === 0;
    const rowBg = isEven ? '#ffffff' : '#f8fafc';
    const brand = item.brand || item.supplierSuggested || '-';
    
    let linkHtml = '-';
    if (item.linkOrReference) {
      const link = item.linkOrReference.trim();
      if (link.startsWith('http://') || link.startsWith('https://')) {
        linkHtml = `<a href="${escapeHtml(link)}" target="_blank" style="color: #2563eb; font-weight: bold; text-decoration: underline;">Abrir Link</a>`;
      } else {
        linkHtml = `<span style="color: #475569; font-family: monospace;">${escapeHtml(link)}</span>`;
      }
    }

    const unitPrice = item.estimatedUnitPrice 
      ? `R$ ${item.estimatedUnitPrice.toFixed(2)}` 
      : '-';
    
    const totalPrice = item.totalEstimatedPrice 
      ? `R$ ${item.totalEstimatedPrice.toFixed(2)}` 
      : '-';

    return `
      <tr style="background-color: ${rowBg};">
        <td style="border: 1px solid #cbd5e1; padding: 10px 12px; text-align: center; font-weight: bold; color: #475569; font-size: 13px;">
          ${index + 1}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 13px; color: #0f172a; font-weight: 600;">
          ${escapeHtml(item.itemName)}
          ${item.isNewItem ? ' <span style="font-size: 10px; background-color: #f3e8ff; color: #6b21a8; padding: 2px 6px; border-radius: 4px; font-weight: bold;">NOVO</span>' : ''}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 13px; color: #334155;">
          ${escapeHtml(brand)}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 13px; text-align: center; font-weight: bold; color: #0f172a;">
          ${item.quantity} ${escapeHtml(item.unit)}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 12px; text-align: center;">
          ${linkHtml}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 13px; text-align: right; color: #334155;">
          ${unitPrice}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 10px 12px; font-size: 13px; text-align: right; font-weight: bold; color: #0f172a;">
          ${totalPrice}
        </td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Solicitação de Compra #${escapeHtml(request.code)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b;">
  <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    
    <!-- Cabeçalho -->
    <div style="background-color: #1e40af; background: linear-gradient(135deg, #1e40af, #2563eb); color: #ffffff; padding: 24px; text-align: left;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #bfdbfe; font-weight: bold; margin-bottom: 4px;">
              Sistema de Controle de Estoque
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
              Solicitação de Compra: #${escapeHtml(request.code)}
            </h1>
          </td>
          <td style="text-align: right; vertical-align: middle;">
            <span style="background-color: ${priorityStyle.bg}; color: ${priorityStyle.text}; font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 20px; display: inline-block;">
              ${priorityStyle.label}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Informações da Solicitação -->
    <div style="padding: 20px 24px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 4px 0; width: 50%;">
            <strong style="color: #475569;">Solicitante:</strong> 
            <span style="color: #0f172a; font-weight: 600;">${escapeHtml(request.requester)}</span>
          </td>
          <td style="padding: 4px 0; width: 50%;">
            <strong style="color: #475569;">Departamento:</strong> 
            <span style="color: #0f172a; font-weight: 600;">${escapeHtml(request.department)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">
            <strong style="color: #475569;">Finalidade:</strong> 
            <span style="color: #0f172a;">${destinationLabel}</span>
          </td>
          <td style="padding: 4px 0;">
            <strong style="color: #475569;">Data:</strong> 
            <span style="color: #0f172a;">${new Date(request.createdAt).toLocaleDateString('pt-BR')}</span>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding-top: 8px;">
            <strong style="color: #475569;">Justificativa / Motivo:</strong> 
            <div style="margin-top: 2px; color: #0f172a; font-style: italic; background-color: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1;">
              "${escapeHtml(request.reason)}"
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Tabela de Itens -->
    <div style="padding: 24px;">
      <h3 style="margin: 0 0 14px 0; font-size: 15px; color: #0f172a; font-weight: 700;">
        Itens Requisitados (${request.items.length})
      </h3>
      
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="border: 1px solid #0f172a; padding: 10px 12px; font-size: 12px; font-weight: 700; width: 40px; text-align: center;">#</th>
            <th style="border: 1px solid #0f172a; padding: 10px 12px; font-size: 12px; font-weight: 700;">Item / Descrição / Modelo</th>
            <th style="border: 1px solid #0f172a; padding: 10px 12px; font-size: 12px; font-weight: 700;">Marca / Fabricante</th>
            <th style="border: 1px solid #0f172a; padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: center; width: 80px;">Qtd</th>
            <th style="border: 1px solid #0f172a; padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: center; width: 110px;">Link / Ref</th>
            <th style="border: 1px solid #0f172a; padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: right; width: 90px;">Valor Unit.</th>
            <th style="border: 1px solid #0f172a; padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: right; width: 100px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="6" style="border: 1px solid #cbd5e1; padding: 12px; text-align: right; font-size: 14px; color: #1e293b;">
              Total Estimado da Compra:
            </td>
            <td style="border: 1px solid #cbd5e1; padding: 12px; text-align: right; font-size: 15px; color: #1e40af;">
              R$ ${request.totalEstimatedValue.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>

      ${request.notes ? `
        <div style="margin-top: 20px; padding: 12px 16px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px;">
          <strong style="color: #92400e; font-size: 12px; display: block; margin-bottom: 4px;">Observações Adicionais:</strong>
          <span style="color: #78350f; font-size: 13px;">${escapeHtml(request.notes)}</span>
        </div>
      ` : ''}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8;">
        Mensagem gerada automaticamente pelo Sistema de Estoque &bull; ${new Date().toLocaleString('pt-BR')}
      </div>
    </div>

  </div>
</body>
</html>
  `.trim();
}

/**
 * Gera versão texto simples para contingência e corpo do mailto
 */
export function buildRequestPlainText(request: StockRequest): string {
  const itemsText = request.items.map((i, idx) => {
    const brand = i.brand || i.supplierSuggested || 'N/D';
    const link = i.linkOrReference ? ` | Link: ${i.linkOrReference}` : '';
    const price = i.estimatedUnitPrice ? ` | Unit: R$ ${i.estimatedUnitPrice.toFixed(2)}` : '';
    return `${idx + 1}. [${i.quantity} ${i.unit}] ${i.itemName} (Marca: ${brand})${link}${price}`;
  }).join('\n');

  return `SOLICITAÇÃO DE COMPRA: #${request.code}
Prioridade: ${request.priority}
Finalidade: ${request.destination === 'REPOSICAO_ESTOQUE' ? 'Reposição de Estoque' : 'Uso Imediato'}
Solicitante: ${request.requester} (${request.department})
Data: ${new Date(request.createdAt).toLocaleDateString('pt-BR')}
Motivo: ${request.reason}

ITENS SOLICITADOS:
------------------------------------------------------------
${itemsText}
------------------------------------------------------------
Total Estimado: R$ ${request.totalEstimatedValue.toFixed(2)}
${request.notes ? `\nObservações: ${request.notes}` : ''}
`.trim();
}

/**
 * Copia o conteúdo formatado em HTML (com fallback em texto puro) para a Área de Transferência
 */
export async function copyRequestTableToClipboard(request: StockRequest): Promise<boolean> {
  try {
    const html = buildRequestEmailHtml(request);
    const text = buildRequestPlainText(request);

    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([text], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText
        })
      ]);
      return true;
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Falha ao copiar para o clipboard:', err);
    return false;
  }
}

/**
 * Cria e dispara o download de um arquivo .eml (MIME) pré-formatado.
 * Quando o usuário clica no arquivo .eml, o Microsoft Outlook abre nativamente
 * uma janela de rascunho de nova mensagem (X-Unsent: 1) com a tabela HTML 100% pronta!
 */
export function downloadOutlookEml(request: StockRequest, recipientEmail?: string): void {
  const subject = `Solicitação de Compra #${request.code} - ${request.reason}`;
  const htmlBody = buildRequestEmailHtml(request);
  
  // Codificação do assunto em Base64 RFC 2047 para caracteres acentuados (UTF-8)
  const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const emlContent = [
    `To: ${recipientEmail || ''}`,
    `Subject: ${encodedSubject}`,
    `X-Unsent: 1`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    htmlBody
  ].join('\r\n');

  const blob = new Blob([emlContent], { type: 'message/rfc822' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `Solicitacao_${request.code}.eml`;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Dispara a abertura do Outlook via mailto: (abre a janela do cliente padrão de e-mail)
 */
export function openOutlookMailto(request: StockRequest, recipientEmail?: string): void {
  const subject = encodeURIComponent(`Solicitação de Compra #${request.code} - ${request.reason}`);
  const body = encodeURIComponent(buildRequestPlainText(request));
  const to = encodeURIComponent(recipientEmail || '');
  
  const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
  window.open(mailtoUrl, '_self');
}

/**
 * Ação principal: Dispara o arquivo .eml para abertura direta no Outlook com tabela HTML
 * e copia a tabela para a área de transferência para redundância (Ctrl+V).
 */
export async function openRequestInOutlook(
  request: StockRequest, 
  recipientEmail?: string
): Promise<{ success: boolean; copied: boolean }> {
  // 1. Copia tabela rica em HTML para a área de transferência
  const copied = await copyRequestTableToClipboard(request);

  // 2. Dispara a criação do arquivo .eml com X-Unsent: 1 (abre rascunho nativo no Outlook com tabela completa)
  downloadOutlookEml(request, recipientEmail);

  return { success: true, copied };
}
