/**
 * DOM element selectors and references
 */

// Input elements
export const inputInitialDate = document.querySelector("body > div.container > section.filters > div:nth-child(1) > input");
export const inputFinalDate = document.querySelector("body > div.container > section.filters > div:nth-child(2) > input");
export const inputMetaMensal = document.querySelector("body > div.container > section:nth-child(4) > div.meta-group > input[type=text]");

// Button
export const btnConsultar = document.querySelector("body > div.container > section.filters > button");

// Table
export const getTableBody = () => document.querySelector('.table tbody');

// Header
export const getLastUpdateElement = () => document.querySelector("body > div.container > header > p");

// Summary elements
export const getSummaryValueElement = () => document.querySelector('.summary .value-negative, .summary .value-positive');
export const getSummaryStatusElement = () => document.querySelector('.summary .status-negative, .summary .status-positive');
