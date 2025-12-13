const inputInitialDate = document.querySelector("body > div.container > section.filters > div:nth-child(1) > input")
const inputFinalDate = document.querySelector("body > div.container > section.filters > div:nth-child(2) > input")

function checkInputs() {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();
  const ultimoDiaDoMesAtual = ultimoDiaDoMes(anoAtual, mesAtual)

  function ultimoDiaDoMes(ano, mes) {
    // mes: 1–12
    return new Date(ano, mes, 0).getDate();
  }



  inputInitialDate.value = `${anoAtual}-${mesAtual}-01`
  inputFinalDate.value = `${anoAtual}-${mesAtual}-${ultimoDiaDoMesAtual}`
}

if (inputInitialDate && inputInitialDate.value === "" || inputFinalDate && inputFinalDate.value === "") {
  checkInputs();
}
