const { Pool } = require('pg');
const express = require('express');
const cors = require('cors'); // Recomendado se for chamar do frontend

// Configuração do Banco
const pool = new Pool({
  user: 'acesse',
  host: '192.168.0.200',
  database: 'banco002',
  password: 'acesse2006',
  port: 5434,
});

const app = express();
app.use(express.json());
app.use(cors()); // Habilita acesso externo (opcional)

// Adicione isso logo após criar o 'app'
app.get('/', (req, res) => {
  res.send('O servidor está funcionando! O problema pode ser na rota do banco.');
});

// ROTA: /api/financeiro/resumo
// Exemplo de uso: http://localhost:3000/api/financeiro/resumo?dataInicial=2025-12-01&dataFinal=2025-12-31
app.get('/api/financeiro/resumo', async (req, res) => {
  // 1. Pega as datas da URL (query params)
  const { dataInicial, dataFinal } = req.query;

  // 2. Validação simples
  if (!dataInicial || !dataFinal) {
    return res.status(400).json({ 
      erro: 'Parâmetros obrigatórios.', 
      exemplo: '/api/financeiro/resumo?dataInicial=2025-01-01&dataFinal=2025-01-31' 
    });
  }

  try {
    // 3. A Query SQL (Já ajustada com $1 e $2)
    // Note o uso de ($1 || ' 00:00:00') para lidar com a parte que exigia hora
    const querySQL = `
      SELECT 
        dados.codigo_lancamento, 
        dados.descricao, 
        sum(dados.valor_referencia) as valor_referencia, 
        dados.tipo 
      FROM ( 
        SELECT 1 as tipo, vcp.codigo_lancamento, la.descricao, svc.codigo_usuario, svc.data_documento AS data_referencia, SUM(vcp.valor_pagamento - vcp.valor_troco) AS valor_referencia 
        FROM saida_venda_consumidor svc 
        INNER JOIN venda_consumidor_pagamento vcp ON svc.numero_controle = vcp.numero_controle 
        INNER JOIN lancamento la ON vcp.codigo_lancamento = la.codigo 
        WHERE vcp.data_cancelamento IS NULL AND svc.flag_processamento = - 1 AND svc.data_cancelamento IS NULL 
        AND svc.data_documento between $1 AND $2 
        GROUP BY vcp.codigo_lancamento, la.descricao, svc.codigo_usuario, svc.data_documento 
        
        UNION ALL 
        
        SELECT 2 as tipo, 90000 AS codigo_lancamento, 'RECARGA/RECEBIMENTO DE FATURA' AS descricao, est.codigo_usuario, CAST(est.data_movimentacao AS DATE) as data_referencia, SUM(est.valor_documento) AS valor_referencia 
        FROM entrada_servicos_tef est 
        WHERE Cast(est.data_movimentacao AS DATE) between $1 AND $2 
        GROUP BY est.codigo_usuario, est.data_movimentacao 
        
        UNION ALL 
        
        SELECT 3 as tipo, 90001 AS codigo_lancamento, 'RECEBIMENTOS' AS descricao, lr.codigo_usuario, lr.data_lancamento AS data_referencia, SUM(lr.valor_lancamento) AS valor_referencia 
        FROM titulo_receber tr 
        INNER JOIN lancamento_receber lr ON tr.numero_controle = lr.numero_controle AND tr.numero_ordem = lr.numero_ordem 
        INNER JOIN lancamento la ON la.codigo = lr.codigo_lancamento 
        INNER JOIN documento_receber dr ON tr.numero_controle = dr.numero_controle 
        WHERE (case when dr.numero_controle_consumidor is NOT null then dr.numero_controle_consumidor not in ( SELECT svc.numero_controle FROM saida_venda_consumidor svc INNER JOIN venda_consumidor_pagamento vcp ON svc.numero_controle = vcp.numero_controle INNER JOIN lancamento la ON vcp.codigo_lancamento = la.codigo WHERE vcp.data_cancelamento IS NULL AND svc.flag_processamento = -1 AND svc.data_cancelamento IS NULL AND svc.data_documento between $1 AND $2) else 1=1 end) 
        AND la.alinea = 'C' 
        AND lr.data_lancamento between ($1 || ' 00:00:00') AND ($2 || ' 23:59:59') 
        GROUP BY lr.codigo_usuario, lr.codigo_lancamento, lr.data_lancamento 
        
        UNION ALL 
        
        SELECT 4 as tipo, 90002 AS codigo_lancamento, 'SUPRIMENTO' AS descricao, vcss.codigo_usuario, vcss.data_lancamento as data_referencia, SUM(vcss.valor) AS valor_referencia 
        FROM saida_venda_consumidor_sansup vcss 
        WHERE vcss.tipo_operacao = 'P' AND vcss.data_lancamento between $1 AND $2 
        GROUP BY vcss.codigo_usuario, vcss.data_lancamento 
        
        UNION ALL 
        
        SELECT 5 as tipo, 90003 AS codigo_lancamento, 'SANGRIA' AS descricao, vcss.codigo_usuario, vcss.data_lancamento AS data_referencia, SUM(vcss.valor) AS valor_referencia 
        FROM saida_venda_consumidor_sansup vcss 
        WHERE vcss.tipo_operacao = 'G' AND vcss.data_lancamento between $1 AND $2 
        GROUP BY vcss.codigo_usuario, vcss.data_lancamento 
        
        UNION ALL 
        
        SELECT 6 as tipo, 90004 AS codigo_lancamento, 'CANCELADOS' AS descricao, svc.codigo_usuario, svc.data_documento AS data_referencia, SUM(svc.valor_total_itens) AS valor_referencia 
        FROM saida_venda_consumidor svc 
        WHERE svc.data_cancelamento IS NOT NULL AND svc.data_documento between $1 AND $2 
        GROUP BY svc.codigo_usuario, svc.data_documento 
        
        UNION ALL 
        
        SELECT 7 as tipo, 90005 AS codigo_lancamento, 'DESCONTOS' AS descricao, svc.codigo_usuario, svc.data_documento AS data_referencia, SUM(svc.valor_desconto) AS valor_referencia 
        FROM saida_venda_consumidor svc 
        WHERE svc.data_cancelamento IS NULL AND svc.valor_desconto > 0 AND svc.data_documento between $1 AND $2 
        GROUP BY svc.codigo_usuario, svc.data_documento 
      ) AS dados 
      GROUP BY tipo, codigo_lancamento, descricao 
      ORDER BY tipo, descricao
    `;

    // 4. Executa passando os parâmetros
    const resultado = await pool.query(querySQL, [dataInicial, dataFinal]);

    // 5. Retorna o JSON direto
    res.json(resultado.rows);

  } catch (err) {
    console.error('❌ Erro na consulta:', err);
    res.status(500).json({ erro: 'Erro interno ao consultar banco de dados' });
  }
});

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});