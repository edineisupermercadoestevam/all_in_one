/**
 * UI functions module
 */

import {
  inputInitialDate,
  inputFinalDate,
  inputMetaMensal,
  btnConsultar,
  getTableBody,
  getLastUpdateElement,
  getSummaryValueElement,
  getSummaryStatusElement
} from './dom.js';
import { getDataHoraBrasil, formatCurrency } from './utils.js';
import { saveTableDataToLocalStorage, getLastUpdate } from './storage.js';
import { fetchResumoFinanceiro } from './api.js';

// Create loading overlay
const loadingOverlay = document.createElement('div');
loadingOverlay.className = 'loading-overlay';
loadingOverlay.innerHTML = `
  <div class="loading-content">
    <div class="loading-spinner"></div>
    <div class="loading-text">Carregando informações...</div>
  </div>
`;
document.body.appendChild(loadingOverlay);

/**
 * Show loading overlay and disable inputs
 */
export function showLoading() {
  loadingOverlay.classList.add('active');
  btnConsultar.disabled = true;
  inputInitialDate.disabled = true;
  inputFinalDate.disabled = true;
  inputMetaMensal.disabled = true;
}

/**
 * Hide loading overlay and enable inputs
 */
export function hideLoading() {
  loadingOverlay.classList.remove('active');
  btnConsultar.disabled = false;
  inputInitialDate.disabled = false;
  inputFinalDate.disabled = false;
  inputMetaMensal.disabled = false;
}

/**
 * Update the last update timestamp display
 * @param {string} timestamp - The timestamp to display
 */
export function updateLastUpdateDisplay(timestamp) {
  const element = getLastUpdateElement();
  if (element) {
    element.innerHTML = `Última atualização: ${timestamp}`;
  }
}

/**
 * Restore last update from localStorage
 */
export function restoreLastUpdate() {
  const ultimaAtualizacao = getLastUpdate();
  if (ultimaAtualizacao) {
    updateLastUpdateDisplay(ultimaAtualizacao);
  }
}

/**
 * Determine icon class based on description
 * @param {string} desc - The description in lowercase
 * @returns {{ iconClass: string, isCartaoPix: boolean }}
 */
function getIconInfo(desc) {
  if (desc.includes('crédito') || desc.includes('credito')) {
    return { iconClass: 'credit', isCartaoPix: true };
  }
  if (desc.includes('débito') || desc.includes('debito')) {
    return { iconClass: 'debit', isCartaoPix: true };
  }
  if (desc.includes('pix')) {
    return { iconClass: 'pix', isCartaoPix: true };
  }
  return { iconClass: 'money', isCartaoPix: false };
}

/**
 * Check if item should be filtered out
 * @param {string} desc - The description in lowercase
 * @returns {boolean}
 */
function shouldFilter(desc) {
  return desc.includes('recebimentos') ||
    desc.includes('promissória') ||
    desc.includes('promissoria') ||
    desc.includes('descontos') ||
    desc.includes('cancelados');
}

/**
 * Update summary elements with card/pix total
 * @param {number} totalDifCartoesPix - The total difference
 */
function updateSummary(totalDifCartoesPix) {
  const valorFormatado = formatCurrency(totalDifCartoesPix);
  const spanValue = getSummaryValueElement();
  const statusElement = getSummaryStatusElement();

  if (spanValue) {
    spanValue.textContent = (totalDifCartoesPix >= 0 ? '+' : '') + valorFormatado;
    spanValue.className = totalDifCartoesPix >= 0 ? 'value-positive' : 'value-negative';
  }

  if (statusElement) {
    statusElement.textContent = totalDifCartoesPix >= 0 ? 'Status: POSITIVO' : 'Status: NEGATIVO';
    statusElement.className = totalDifCartoesPix >= 0 ? 'status-positive' : 'status-negative';
  }
}

/**
 * Update the data table
 * @param {string|null} dataInicial - Start date
 * @param {string|null} dataFinal - End date
 * @param {Array|null} dadosLocalStorage - Data from localStorage (optional)
 */
export async function atualizarTabela(dataInicial, dataFinal, dadosLocalStorage = null) {
  try {
    let dados;

    if (dadosLocalStorage) {
      dados = dadosLocalStorage;
    } else {
      showLoading();
      dados = await fetchResumoFinanceiro(dataInicial, dataFinal);
      saveTableDataToLocalStorage(dados);
    }

    const tbody = getTableBody();
    tbody.innerHTML = '';

    let totalGerencial = 0;
    let totalFiscal = 0;
    let totalDiferenca = 0;
    let totalDifCartoesPix = 0;

    dados.forEach(item => {
      const desc = (item.descricao || '').toLowerCase();

      if (shouldFilter(desc)) return;

      const { iconClass, isCartaoPix } = getIconInfo(desc);
      const nome = item.descricao;

      const valorGerencial = parseFloat(item.valor_banco1 || 0);
      const valorFiscal = parseFloat(item.valor_banco2 || 0);
      const diferenca = parseFloat(item.diferenca || 0);

      totalGerencial += valorGerencial;
      totalFiscal += valorFiscal;
      totalDiferenca += diferenca;

      if (isCartaoPix) {
        totalDifCartoesPix += diferenca;
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="type"><span class="icon ${iconClass}"></span> ${nome}</td>
        <td>${formatCurrency(valorGerencial)}</td>
        <td>${formatCurrency(valorFiscal)}</td>
        <td class="diff-cell"><span class="${diferenca >= 0 ? 'pos' : 'neg'}">${diferenca >= 0 ? '+' : ''}${formatCurrency(diferenca)}</span></td>
      `;
      tbody.appendChild(tr);
    });

    // Total row
    const trTotal = document.createElement('tr');
    trTotal.className = 'total-row';
    trTotal.innerHTML = `
      <td>TOTAL:</td>
      <td>${formatCurrency(totalGerencial)}</td>
      <td>${formatCurrency(totalFiscal)}</td>
      <td class="diff-cell"><span class="${totalDiferenca >= 0 ? 'pos' : 'neg'}">${totalDiferenca >= 0 ? '+' : ''}${formatCurrency(totalDiferenca)}</span></td>
    `;
    tbody.appendChild(trTotal);

    updateSummary(totalDifCartoesPix);
    updateLastUpdateDisplay(getDataHoraBrasil());
    hideLoading();

  } catch (err) {
    console.error('Erro ao atualizar tabela:', err);
    hideLoading();
    alert('Erro ao carregar dados. Por favor, tente novamente.');
  }
}
