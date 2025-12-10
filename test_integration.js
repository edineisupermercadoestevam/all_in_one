const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    body: data,
                    headers: res.headers
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

async function runTests() {
    console.log('Iniciando testes de integração...');

    // Teste 1: Consulta válida
    try {
        console.log('Teste 1: Consulta com datas válidas...');
        const res = await makeRequest('/api/financeiro/resumo?dataInicial=2025-12-01&dataFinal=2025-12-31');
        
        if (res.statusCode === 200) {
            console.log('✅ Status 200 OK');
            const data = JSON.parse(res.body);
            if (Array.isArray(data)) {
                console.log('✅ Resposta é um array');
                if (data.length > 0) {
                    const item = data[0];
                    if ('valor_banco1' in item && 'valor_banco2' in item && 'diferenca' in item) {
                        console.log('✅ Campos obrigatórios presentes');
                    } else {
                        console.error('❌ Campos obrigatórios ausentes:', Object.keys(item));
                    }
                } else {
                    console.log('⚠️ Array vazio (nenhum dado encontrado para o período)');
                }
            } else {
                console.error('❌ Resposta não é um array');
            }
        } else {
            console.error(`❌ Falha: Status ${res.statusCode}`);
        }
    } catch (err) {
        console.error('❌ Erro na requisição:', err);
    }

    // Teste 2: Consulta sem parâmetros
    try {
        console.log('\nTeste 2: Consulta sem parâmetros...');
        const res = await makeRequest('/api/financeiro/resumo');
        if (res.statusCode === 400) {
            console.log('✅ Status 400 Bad Request (Esperado)');
        } else {
            console.error(`❌ Falha: Esperado 400, recebido ${res.statusCode}`);
        }
    } catch (err) {
        console.error('❌ Erro na requisição:', err);
    }
}

runTests();
