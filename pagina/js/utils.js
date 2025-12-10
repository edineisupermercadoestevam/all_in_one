/**
 * Utility functions
 */

/**
 * Returns the current date and time formatted for Brazil
 * @returns {string} Date in format DD/MM/YYYY HH:MM:SS
 */
export function getDataHoraBrasil() {
  const agora = new Date();

  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();

  const hora = String(agora.getHours()).padStart(2, '0');
  const min = String(agora.getMinutes()).padStart(2, '0');
  const seg = String(agora.getSeconds()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
}

/**
 * Formats a number to Brazilian currency format
 * @param {number} value - The value to format
 * @returns {string} Formatted value
 */
export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
