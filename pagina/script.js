dados = [
  {
    codigo_lancamento: 3,
    descricao: 'Cartão de crédito',
    valor_referencia: '18643.58',  
    tipo: 1
  },
  {
    codigo_lancamento: 5,
    descricao: 'Cartão de débito',
    valor_referencia: '13888.11',
    tipo: 1
  },
  {
    codigo_lancamento: 1,
    descricao: 'Dinheiro',
    valor_referencia: '11216.27',
    tipo: 1
  },
  {
    codigo_lancamento: 10,
    descricao: 'Pix',
    valor_referencia: '20879.39',
    tipo: 1
  },
  {
    codigo_lancamento: 90004,
    descricao: 'CANCELADOS',
    valor_referencia: '31.1000',
    tipo: 6
  },
  {
    codigo_lancamento: 90005,
    descricao: 'DESCONTOS',
    valor_referencia: '1.68',
    tipo: 7
  }
]

const inputInitialDate = document.querySelector("body > div.container > section.filters > div:nth-child(1) > input")
const inputFinalDate = document.querySelector("body > div.container > section.filters > div:nth-child(2) > input")
const inputMetaMensal = document.querySelector("body > div.container > section:nth-child(4) > div.meta-group > input[type=text]")

btnConsultar = document.querySelector("body > div.container > section.filters > button")

btnConsultar.addEventListener("click", (event)=>{
  event.preventDefault();
  console.log("clicou")
  console.log("Data Inicial: ", inputInitialDate.value)
  console.log("Data Final: ", inputFinalDate.value)
  atualizarTabela(inputInitialDate.value, inputFinalDate.value)
})

async function atualizarTabela(dataInicial, dataFinal) {
  try {
    // 1. Chamada ao backend
    const response = await fetch(`http://localhost:3000/api/financeiro/resumo?dataInicial=${dataInicial}&dataFinal=${dataFinal}`);
    
    if (!response.ok) throw new Error('Erro ao buscar dados');

    const dados = await response.json();

    // 2. Mapeia os tipos para ícones e nomes (ajuste conforme sua necessidade)
    const tiposMap = {
      1: { nome: 'Crédito', icone: 'credit' },
      2: { nome: 'Débito', icone: 'debit' },
      3: { nome: 'Dinheiro', icone: 'money' },
      4: { nome: 'Pix', icone: 'pix' },
      6: { nome: 'CANCELADOS', icone: 'cancel' },
      7: { nome: 'DESCONTOS', icone: 'discount' },
      // outros tipos podem ser adicionados aqui
    };

    // 3. Seleciona o tbody da tabela
    const tbody = document.querySelector('.table tbody');
    tbody.innerHTML = ''; // limpa linhas existentes

    // 4. Cria linhas dinamicamente
    dados.forEach(item => {
      const tipoInfo = tiposMap[item.tipo] || { nome: item.descricao, icone: '' };

      // Simula valores gerencial/fiscal (ajuste se tiver campos distintos)
      const valorGerencial = parseFloat(item.valor_referencia);
      const valorFiscal = valorGerencial; // aqui você pode substituir pelo valor correto se vier do backend
      const diferenca = valorGerencial - valorFiscal;

      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td class="type"><span class="icon ${tipoInfo.icone}"></span> ${tipoInfo.nome}</td>
        <td>${valorGerencial.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td>${valorFiscal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="${diferenca >= 0 ? 'pos' : 'neg'}">
          ${diferenca >= 0 ? '+' : ''}${diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Erro ao atualizar tabela:', err);
  }
}
