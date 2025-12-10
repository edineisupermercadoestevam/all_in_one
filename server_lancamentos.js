const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors()); 

// Serve static files from 'pagina' directory
app.use(express.static(path.join(__dirname, 'pagina')));

const banco001 = new Pool({
  user: 'acesse',
  host: '192.168.0.200',
  database: 'banco001',
  password: 'acesse2006',
  port: 5434,
});

const banco002 = new Pool({
    user: 'acesse',
    host: '192.168.0.200',
    database: 'banco002',
    password: 'acesse2006',
    port: 5434,
});

const querySQL = `
    SELECT 
  dados.codigo_lancamento,
  dados.descricao,
  SUM(dados.valor_referencia) AS valor_referencia,
  dados.tipo
FROM (
  /* 1 - PAGAMENTOS VENDA CONSUMIDOR */
  SELECT 
      1 AS tipo,
      vcp.codigo_lancamento,
      la.descricao,
      svc.codigo_usuario,
      svc.data_documento AS data_referencia,
      SUM(vcp.valor_pagamento - vcp.valor_troco) AS valor_referencia
  FROM saida_venda_consumidor svc
  INNER JOIN venda_consumidor_pagamento vcp 
      ON svc.numero_controle = vcp.numero_controle
  INNER JOIN lancamento la 
      ON vcp.codigo_lancamento = la.codigo
  WHERE 
      vcp.data_cancelamento IS NULL
      AND svc.flag_processamento = -1
      AND svc.data_cancelamento IS NULL
      AND svc.data_documento BETWEEN $1 AND $2
  GROUP BY 
      vcp.codigo_lancamento,
      la.descricao,
      svc.codigo_usuario,
      svc.data_documento

  UNION ALL

  /* 2 - RECARGA / FATURA */
  SELECT 
      2 AS tipo,
      90000 AS codigo_lancamento,
      'RECARGA/RECEBIMENTO DE FATURA' AS descricao,
      est.codigo_usuario,
      CAST(est.data_movimentacao AS DATE) AS data_referencia,
      SUM(est.valor_documento) AS valor_referencia
  FROM entrada_servicos_tef est
  WHERE 
      CAST(est.data_movimentacao AS DATE)
          BETWEEN $1 AND $2
  GROUP BY 
      est.codigo_usuario,
      est.data_movimentacao

  UNION ALL

  /* 3 - RECEBIMENTOS */
  SELECT 
      3 AS tipo,
      90001 AS codigo_lancamento,
      'RECEBIMENTOS' AS descricao,
      lr.codigo_usuario,
      lr.data_lancamento AS data_referencia,
      SUM(lr.valor_lancamento) AS valor_referencia
  FROM titulo_receber tr
  INNER JOIN lancamento_receber lr 
      ON tr.numero_controle = lr.numero_controle
      AND tr.numero_ordem = lr.numero_ordem
  INNER JOIN lancamento la 
      ON la.codigo = lr.codigo_lancamento
  INNER JOIN documento_receber dr 
      ON tr.numero_controle = dr.numero_controle
  WHERE 
      (
          CASE 
              WHEN dr.numero_controle_consumidor IS NOT NULL THEN
                  dr.numero_controle_consumidor NOT IN (
                      SELECT svc.numero_controle
                      FROM saida_venda_consumidor svc
                      INNER JOIN venda_consumidor_pagamento vcp 
                          ON svc.numero_controle = vcp.numero_controle
                      INNER JOIN lancamento la 
                          ON vcp.codigo_lancamento = la.codigo
                      WHERE 
                          vcp.data_cancelamento IS NULL
                          AND svc.flag_processamento = -1
                          AND svc.data_cancelamento IS NULL
                          AND svc.data_documento BETWEEN $1 AND $2
                  )
              ELSE 1 = 1
          END
      )
      AND la.alinea = 'C'
      AND lr.data_lancamento BETWEEN 
          $3 AND $4
  GROUP BY 
      lr.codigo_usuario,
      lr.codigo_lancamento,
      lr.data_lancamento

  UNION ALL

  /* 4 - SUPRIMENTO */
  SELECT 
      4 AS tipo,
      90002 AS codigo_lancamento,
      'SUPRIMENTO' AS descricao,
      vcss.codigo_usuario,
      vcss.data_lancamento AS data_referencia,
      SUM(vcss.valor) AS valor_referencia
  FROM saida_venda_consumidor_sansup vcss
  WHERE 
      vcss.tipo_operacao = 'P'
      AND vcss.data_lancamento BETWEEN $1 AND $2
  GROUP BY 
      vcss.codigo_usuario,
      vcss.data_lancamento

  UNION ALL

  /* 5 - SANGRIA */
  SELECT 
      5 AS tipo,
      90003 AS codigo_lancamento,
      'SANGRIA' AS descricao,
      vcss.codigo_usuario,
      vcss.data_lancamento AS data_referencia,
      SUM(vcss.valor) AS valor_referencia
  FROM saida_venda_consumidor_sansup vcss
  WHERE 
      vcss.tipo_operacao = 'G'
      AND vcss.data_lancamento BETWEEN $1 AND $2
  GROUP BY 
      vcss.codigo_usuario,
      vcss.data_lancamento

  UNION ALL

  /* 6 - CANCELADOS */
  SELECT 
      6 AS tipo,
      90004 AS codigo_lancamento,
      'CANCELADOS' AS descricao,
      svc.codigo_usuario,
      svc.data_documento AS data_referencia,
      SUM(svc.valor_total_itens) AS valor_referencia
  FROM saida_venda_consumidor svc
  WHERE 
      svc.data_cancelamento IS NOT NULL
      AND svc.data_documento BETWEEN $1 AND $2
  GROUP BY 
      svc.codigo_usuario,
      svc.data_documento

  UNION ALL

  /* 7 - DESCONTOS */
  SELECT 
      7 AS tipo,
      90005 AS codigo_lancamento,
      'DESCONTOS' AS descricao,
      svc.codigo_usuario,
      svc.data_documento AS data_referencia,
      SUM(svc.valor_desconto) AS valor_referencia
  FROM saida_venda_consumidor svc
  WHERE 
      svc.data_cancelamento IS NULL
      AND svc.valor_desconto > 0
      AND svc.data_documento BETWEEN $1 AND $2
  GROUP BY 
      svc.codigo_usuario,
      svc.data_documento
) AS dados
GROUP BY 
  tipo, 
  codigo_lancamento,
  descricao
ORDER BY 
  tipo, 
  descricao;
`;

app.get('/api/financeiro/resumo', async (req, res) => {
    const { dataInicial, dataFinal } = req.query;
    
    console.log(`Recebendo requisição para intervalo: ${dataInicial} a ${dataFinal}`);

    if (!dataInicial || !dataFinal) {
        return res.status(400).json({ error: 'Data inicial e final são obrigatórias' });
    }

    const dataInicialTimestamp = `${dataInicial} 00:00:00`;
    const dataFinalTimestamp = `${dataFinal} 23:59:59`;
    
    // Parâmetros para a query: 
    // $1 = data (YYYY-MM-DD)
    // $2 = data (YYYY-MM-DD)
    // $3 = timestamp inicial
    // $4 = timestamp final
    const params = [dataInicial, dataFinal, dataInicialTimestamp, dataFinalTimestamp];

    try {
        console.log('Iniciando consultas aos bancos...');
        const [res1, res2] = await Promise.all([
            banco001.query(querySQL, params),
            banco002.query(querySQL, params)
        ]);
        console.log('Consultas finalizadas.');

        // Processar os dados para mesclar
        // Mapear por chave composta: tipo + codigo_lancamento
        const map = new Map();

        // Processa Banco 1 (Gerencial)
        res1.rows.forEach(row => {
            const key = `${row.tipo}-${row.codigo_lancamento}`;
            map.set(key, {
                tipo: row.tipo,
                codigo_lancamento: row.codigo_lancamento,
                descricao: row.descricao,
                valor_banco1: parseFloat(row.valor_referencia) || 0,
                valor_banco2: 0
            });
        });

        // Processa Banco 2 (Fiscal)
        res2.rows.forEach(row => {
            const key = `${row.tipo}-${row.codigo_lancamento}`;
            if (map.has(key)) {
                map.get(key).valor_banco2 = parseFloat(row.valor_referencia) || 0;
            } else {
                map.set(key, {
                    tipo: row.tipo,
                    codigo_lancamento: row.codigo_lancamento,
                    descricao: row.descricao,
                    valor_banco1: 0,
                    valor_banco2: parseFloat(row.valor_referencia) || 0
                });
            }
        });

        const result = Array.from(map.values()).map(item => ({
            ...item,
            // Diferença = Gerencial (Banco 1) - Fiscal (Banco 2)
            diferenca: item.valor_banco1 - item.valor_banco2
        }));
        
        // Ordenar por tipo
        result.sort((a, b) => a.tipo - b.tipo);

        res.json(result);

    } catch (err) {
        console.error('❌ Erro na consulta:', err);
        res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Acesse http://localhost:${port}/index.html para ver a interface.`);
});
