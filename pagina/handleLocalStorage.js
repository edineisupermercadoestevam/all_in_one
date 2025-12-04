const inputDataInicial = document.querySelector("body > div.container > section.filters > div:nth-child(1) > input")
const inputDataFinal = document.querySelector("body > div.container > section.filters > div:nth-child(2) > input")

// localStorage
document.addEventListener("DOMContentLoaded", ()=> {
  carregarCamposLocalStorage();
})

function atualizarLocalStorage() {
  localStorage.setItem('dataInicial', inputDataInicial.value)
  localStorage.setItem('dataFinal', inputDataFinal.value)
}

inputDataInicial.addEventListener('change', atualizarLocalStorage);
inputDataFinal.addEventListener('change', atualizarLocalStorage);


function carregarCamposLocalStorage(){
  const dataInicial = localStorage.getItem('dataInicial');
  const dataFinal = localStorage.getItem('dataFinal');
  inputDataInicial.value = dataInicial
  inputDataFinal.value = dataFinal
}
