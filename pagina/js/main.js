/**
 * Main entry point - Application initialization and event listeners
 */

import { inputInitialDate, inputFinalDate, inputMetaMensal, btnConsultar } from './dom.js';
import { saveFormToLocalStorage, loadFormFromLocalStorage, loadTableDataFromLocalStorage } from './storage.js';
import { atualizarTabela, restoreLastUpdate } from './ui.js';
import { metaMensal } from './dinheiro.js'

/**
 * Initialize the application
 */
function init() {
  // Load saved form values
  loadFormFromLocalStorage();

  // Load and display saved table data
  const dadosSalvos = loadTableDataFromLocalStorage();
  if (dadosSalvos) {
    atualizarTabela(null, null, dadosSalvos);
    restoreLastUpdate();
  }
}

/**
 * Handle form submission
 * @param {Event} event 
 */
function handleConsultar(event) {
  event.preventDefault();
  atualizarTabela(inputInitialDate.value, inputFinalDate.value);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init);

inputInitialDate.addEventListener('change', saveFormToLocalStorage);
inputFinalDate.addEventListener('change', saveFormToLocalStorage);
inputMetaMensal.addEventListener('change', saveFormToLocalStorage);

btnConsultar.addEventListener('click', (handleConsultar))
btnConsultar.addEventListener('click', () => {
  setInterval(() => {
    metaMensal()
  }, 750);
})
