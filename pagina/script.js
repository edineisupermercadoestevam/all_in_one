function getDataHoraBrasil() {
  const agora = new Date();

  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();

  const hora = String(agora.getHours()).padStart(2, '0');
  const min = String(agora.getMinutes()).padStart(2, '0');
  const seg = String(agora.getSeconds()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
}


const inputInitialDate = document.querySelector("body > div.container > section.filters > div:nth-child(1) > input")
const inputFinalDate = document.querySelector("body > div.container > section.filters > div:nth-child(2) > input")
const inputMetaMensal = document.querySelector("body > div.container > section:nth-child(4) > div.meta-group > input[type=text]")

btnConsultar = document.querySelector("body > div.container > section.filters > button")

// Criar overlay de loading dinamicamente
const loadingOverlay = document.createElement('div');
loadingOverlay.className = 'loading-overlay';
loadingOverlay.innerHTML = `
  <div class="loading-content">
    <div class="loading-spinner"></div>
    <div class="loading-text">Carregando informações...</div>
  </div>
`;
document.body.appendChild(loadingOverlay);

// Funções para controle do estado de loading
function showLoading() {
  loadingOverlay.classList.add('active');
  btnConsultar.disabled = true;
  inputInitialDate.disabled = true;
  inputFinalDate.disabled = true;
  inputMetaMensal.disabled = true;
}

function hideLoading() {
  loadingOverlay.classList.remove('active');
  btnConsultar.disabled = false;
  inputInitialDate.disabled = false;
  inputFinalDate.disabled = false;
  inputMetaMensal.disabled = false;
}

// Função para salvar valores no localStorage
function saveToLocalStorage() {
  localStorage.setItem('initialDate', inputInitialDate.value);
  localStorage.setItem('finalDate', inputFinalDate.value);
  localStorage.setItem('metaMensal', inputMetaMensal.value);
}

// Função para carregar valores do localStorage
function loadFromLocalStorage() {
  const initialDate = localStorage.getItem('initialDate');
  const finalDate = localStorage.getItem('finalDate');
  const metaMensal = localStorage.getItem('metaMensal');

  if (initialDate) inputInitialDate.value = initialDate;
  if (finalDate) inputFinalDate.value = finalDate;
  if (metaMensal) inputMetaMensal.value = metaMensal;
}

// Função para carregar dados do localStorage
function carregarDadosLocalStorage() {
  const dadosSalvos = localStorage.getItem('tabelaDados');
  return dadosSalvos ? JSON.parse(dadosSalvos) : null;
}

// Função para exibir dados do localStorage na tabela
function exibirDadosLocalStorage() {
  const dados = carregarDadosLocalStorage();
  if (dados) {
    atualizarTabela(null, null, dados);
    // Restaurar a última atualização salva
    const ultimaAtualizacao = localStorage.getItem('ultimaAtualizacao');
    if (ultimaAtualizacao) {
      document.querySelector("body > div.container > header > p").innerHTML = `Última atualização: ${ultimaAtualizacao}`;
    }
  }
}

// Carregar valores quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  exibirDadosLocalStorage();
});

// Adicionar event listeners para salvar quando os valores mudarem
inputInitialDate.addEventListener('change', saveToLocalStorage);
inputFinalDate.addEventListener('change', saveToLocalStorage);
inputMetaMensal.addEventListener('change', saveToLocalStorage);

btnConsultar.addEventListener("click", (event) => {
  event.preventDefault();
  atualizarTabela(inputInitialDate.value, inputFinalDate.value)
})

async function atualizarTabela(dataInicial, dataFinal, dadosLocalStorage = null) {
  try {
    let dados;

    if (dadosLocalStorage) {
      dados = dadosLocalStorage;
    } else {
      // Mostrar loading apenas quando for buscar da API
      showLoading();

      // 1. Chamada ao backend
      const response = await fetch(`/api/financeiro/resumo?dataInicial=${dataInicial}&dataFinal=${dataFinal}`);

      if (!response.ok) throw new Error('Erro ao buscar dados');

      dados = await response.json();

      // Salvar dados no localStorage
      localStorage.setItem('tabelaDados', JSON.stringify(dados));
      // Salvar a data/hora da última atualização
      localStorage.setItem('ultimaAtualizacao', getDataHoraBrasil());
    }

    // 2. Mapeia os tipos para ícones e nomes (ajuste conforme sua necessidade)
    const tiposMap = {
      1: { nome: 'Crédito', icone: 'credit' },
      2: { nome: 'Débito', icone: 'debit' },
      3: { nome: 'Dinheiro', icone: 'money' },
      4: { nome: 'Pix', icone: 'pix' },
      // 6: { nome: 'CANCELADOS', icone: 'cancel' },
      // 7: { nome: 'DESCONTOS', icone: 'discount' },
      // outros tipos podem ser adicionados aqui
    };

    // 3. Seleciona o tbody da tabela
    const tbody = document.querySelector('.table tbody');
    tbody.innerHTML = ''; // limpa linhas existentes

    // 4. Cria linhas dinamicamente
    let totalGerencial = 0;
    let totalFiscal = 0;
    let totalDiferenca = 0;

    dados.forEach(item => {
      const desc = (item.descricao || '').toLowerCase();

      // Filtro: Ignorar RECEBIMENTOS, Promissória, descontos e CANCELADOS
      if (desc.includes('recebimentos') ||
        desc.includes('promissória') ||
        desc.includes('promissoria') ||
        desc.includes('descontos') ||
        desc.includes('cancelados')) {
        return;
      }

      // Tenta determinar o ícone com base na descrição ou tipo
      let iconClass = 'money';

      if (desc.includes('crédito') || desc.includes('credito')) iconClass = 'credit';
      else if (desc.includes('débito') || desc.includes('debito')) iconClass = 'debit';
      else if (desc.includes('pix')) iconClass = 'pix';
      else if (desc.includes('dinheiro')) iconClass = 'money';

      const nome = item.descricao;

      const valorGerencial = parseFloat(item.valor_banco1 || 0);
      const valorFiscal = parseFloat(item.valor_banco2 || 0);
      const diferenca = parseFloat(item.diferenca || 0);

      // Acumula os totais
      totalGerencial += valorGerencial;
      totalFiscal += valorFiscal;
      totalDiferenca += diferenca;

      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="type"><span class="icon ${iconClass}"></span> ${nome}</td>
        <td>${valorGerencial.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${valorFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="${diferenca >= 0 ? 'pos' : 'neg'}">
          ${diferenca >= 0 ? '+' : ''}${diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Adiciona a linha de totais
    const trTotal = document.createElement('tr');
    trTotal.style.fontWeight = 'bold';
    trTotal.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // Leve destaque

    trTotal.innerHTML = `
      <td class="type" style="text-align: right;">TOTAL:</td>
      <td>${totalGerencial.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td>${totalFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td class="${totalDiferenca >= 0 ? 'pos' : 'neg'}">
        ${totalDiferenca >= 0 ? '+' : ''}${totalDiferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    `;
    tbody.appendChild(trTotal);

    document.querySelector("body > div.container > header > p").innerHTML = `Última atualização: ${getDataHoraBrasil()}`;

    // Esconder loading após sucesso
    hideLoading();

  } catch (err) {
    console.error('Erro ao atualizar tabela:', err);
    // Esconder loading após erro
    hideLoading();
    // Mostrar mensagem de erro para o usuário
    alert('Erro ao carregar dados. Por favor, tente novamente.');
  }
}
