// Testar banco do acesse
const { Pool } = require('pg')
const express = require('express')
const path = require('path')

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

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

async function testConnection() {
  try {
    const query = `
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
      AND svc.data_documento BETWEEN '2025-12-01' AND '2025-12-31'
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
          BETWEEN '2025-12-01' AND '2025-12-31'
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
                          AND svc.data_documento BETWEEN '2025-12-01' AND '2025-12-31'
                  )
              ELSE 1 = 1
          END
      )
      AND la.alinea = 'C'
      AND lr.data_lancamento BETWEEN 
          '2025-12-01 00:00:00' AND '2025-12-31 23:59:59'
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
      AND vcss.data_lancamento BETWEEN '2025-12-01' AND '2025-12-31'
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
      AND vcss.data_lancamento BETWEEN '2025-12-01' AND '2025-12-31'
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
      AND svc.data_documento BETWEEN '2025-12-01' AND '2025-12-31'
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
      AND svc.data_documento BETWEEN '2025-12-01' AND '2025-12-31'
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
`
    const res = await pool.query();
  // Imprime os nomes das tabelas
  console.log(res.rows);

  // res.rows.forEach(row => {
  //   console.log(`${JSON.stringify(row, null, 2)}`); // Converte o objeto para JSON formatado
  } catch (err) {
    console.error('❌ Erro ao conectar com o banco:', err);
  } finally {
    await pool.end();
  }
}

testConnection()
