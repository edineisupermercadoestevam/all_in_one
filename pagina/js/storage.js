/**
 * LocalStorage operations
 */

import { inputInitialDate, inputFinalDate, inputMetaMensal } from './dom.js';
import { getDataHoraBrasil } from './utils.js';

/**
 * Save form values to localStorage
 */
export function saveFormToLocalStorage() {
  localStorage.setItem('initialDate', inputInitialDate.value);
  localStorage.setItem('finalDate', inputFinalDate.value);
  localStorage.setItem('metaMensal', inputMetaMensal.value);
}

/**
 * Load form values from localStorage
 */
export function loadFormFromLocalStorage() {
  const initialDate = localStorage.getItem('initialDate');
  const finalDate = localStorage.getItem('finalDate');
  const metaMensal = localStorage.getItem('metaMensal');

  if (initialDate) inputInitialDate.value = initialDate;
  if (finalDate) inputFinalDate.value = finalDate;
  if (metaMensal) inputMetaMensal.value = metaMensal;
}

/**
 * Load table data from localStorage
 * @returns {Array|null} The saved data or null if not found
 */
export function loadTableDataFromLocalStorage() {
  const dadosSalvos = localStorage.getItem('tabelaDados');
  return dadosSalvos ? JSON.parse(dadosSalvos) : null;
}

/**
 * Save table data to localStorage
 * @param {Array} dados - The data to save
 */
export function saveTableDataToLocalStorage(dados) {
  localStorage.setItem('tabelaDados', JSON.stringify(dados));
  localStorage.setItem('ultimaAtualizacao', getDataHoraBrasil());
}

/**
 * Get the last update timestamp from localStorage
 * @returns {string|null} The timestamp or null
 */
export function getLastUpdate() {
  return localStorage.getItem('ultimaAtualizacao');
}
