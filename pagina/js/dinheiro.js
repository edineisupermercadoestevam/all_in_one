const elementoInputDataInicial = document.querySelector("body > div.container > section.filters > div:nth-child(1) > input")
const elementoInputDataFinal = document.querySelector("body > div.container > section.filters > div:nth-child(2) > input")
const elementoInputMeta = document.querySelector("body > div.container > section:nth-child(4) > div.meta-group > input[type=text]")
const elementoDinheiro = document.querySelector("body > div.container > section:nth-child(3) > table > tbody > tr:nth-child(3) > td:nth-child(3)")
const elementoMetaDiaria = document.querySelector("body > div.container > section:nth-child(4) > div:nth-child(3) > p.value")
const elementoProgressMetaDiaria = document.querySelector("body > div.container > section:nth-child(4) > div:nth-child(3) > div > div")
const elementoMetaMensal = document.querySelector("body > div.container > section:nth-child(4) > div:nth-child(4) > p.value")
const elementoProgressMetaMensal = document.querySelector("body > div.container > section:nth-child(4) > div:nth-child(4) > div > div")
const elementoDiasRestantes = document.querySelector("body > div.container > section:nth-child(4) > div.summary > p:nth-child(1)")
const elementoDifencaParaMeta = document.querySelector("body > div.container > section:nth-child(4) > div.summary > p.big")

function diferencaDias(d1, d2) {
  const [ano1, mes1, dia1] = d1.split("-").map(Number);
  const [ano2, mes2, dia2] = d2.split("-").map(Number);

  const date1 = new Date(ano1, mes1 - 1, dia1); // <-- formato correto
  const date2 = new Date(ano2, mes2 - 1, dia2);

  const diffMs = date2.getTime() - date1.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

function dataAtualFormatada() {
  const hoje = new Date();

  const dia = String(hoje.getDate()).padStart(2, "0");
  const mes = String(hoje.getMonth() + 1).padStart(2, "0"); // meses começam em 0
  const ano = hoje.getFullYear();

  return `${ano}-${mes}-${dia}`;
}

function atualizarDiasRestantes() {
  const dataAtual = dataAtualFormatada()
  const diferencaEntreDias = diferencaDias(dataAtual, elementoInputDataFinal.value)

  elementoDiasRestantes.innerHTML = `<strong>Dias Restantes</strong><br>${diferencaEntreDias}`
}

function realToNumber(real) {
  if (!real) return NaN;
  return Number(real.toString().replaceAll(".", "").replaceAll(",", "."))
}

function numberToReal(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "";
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function valueOrText(element) {
  if (element.value) return element.value;
  return element.innerText;
}

function atualizarRestanteMeta(metaElemento, valorElemento, restanteElemento) {
  const meta = realToNumber(valueOrText(metaElemento))
  const valor = realToNumber(valueOrText(valorElemento))
  const restanteMeta = valor - meta
  restanteElemento.innerText = numberToReal(restanteMeta)
}

function atualizarProgressoMetaMensal() {
  const valorMeta = realToNumber(valueOrText(elementoInputMeta))
  const valorDinheiro = realToNumber(valueOrText(elementoDinheiro))
  const progressoMetaMensal = valorDinheiro / valorMeta
  elementoProgressMetaMensal.style.width = `${progressoMetaMensal * 100}%`
  const metaFormatada = numberToReal(realToNumber(valueOrText(document.querySelector("body > div.container > section:nth-child(4) > div.summary > p.value-negative.big"))) * -1)
  elementoMetaMensal.innerHTML = `${metaFormatada} / ${numberToReal(elementoInputMeta.value)}`
}

function atualizarProgressoMetaDiaria() {
  const dataInicial = elementoInputDataInicial.value
  const dataFinal = elementoInputDataFinal.value
  const hoje = new Date().getDate()
  const totalDiasMes = diferencaDias(dataInicial, dataFinal) + 1
  const valorDinheiroTexto = valueOrText(elementoDinheiro)
  const valorDinheiroNumero = realToNumber(valorDinheiroTexto)
  const valorMetaMensal = realToNumber(valueOrText(elementoInputMeta))
  const metaDiaria = valorMetaMensal / totalDiasMes
  const metaAteHojeNumero = metaDiaria * hoje
  const metaAteHojeTexto = numberToReal(metaAteHojeNumero)
  elementoMetaDiaria.innerHTML = `${valorDinheiroTexto} / ${metaAteHojeTexto}`
  const porcetagemProgressoMetaDiaria = valorDinheiroNumero / metaAteHojeNumero * 100
  elementoProgressMetaDiaria.style.width = `${porcetagemProgressoMetaDiaria}%`
}

atualizarDiasRestantes();
atualizarRestanteMeta(elementoInputMeta, elementoDinheiro, elementoDifencaParaMeta);
atualizarProgressoMetaMensal();
atualizarProgressoMetaDiaria()
