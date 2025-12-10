/**
 * API calls module
 */

/**
 * Fetch financial summary from the backend
 * @param {string} dataInicial - Start date (YYYY-MM-DD)
 * @param {string} dataFinal - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} The financial data
 * @throws {Error} If the request fails
 */
export async function fetchResumoFinanceiro(dataInicial, dataFinal) {
  const response = await fetch(`/api/financeiro/resumo?dataInicial=${dataInicial}&dataFinal=${dataFinal}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar dados');
  }

  return response.json();
}
