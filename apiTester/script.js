document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('apiForm');
    const apiUrl = document.getElementById('apiUrl');
    const apiMethod = document.getElementById('apiMethod');
    const apiKey = document.getElementById('apiKey');
    const apiBody = document.getElementById('apiBody');
    const clearBtn = document.getElementById('clearBtn');

    // Tabs
    const tabs = document.querySelectorAll('.tab');
    const responseContents = document.querySelectorAll('.response-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // Atualizar estado ativo das tabs
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Atualizar estado ativo do conteúdo
            responseContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Formulário de envio
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const url = apiUrl.value.trim();
        const method = apiMethod.value.toUpperCase();
        const apiKeyValue = apiKey.value.trim();
        const bodyData = apiBody.value.trim();

        // Validar URL
        if (!url) {
            alert('Por favor, insira uma URL válida');
            apiUrl.focus();
            return;
        }

        // Exibir status de carregamento
        updateResponse('status', 'Enviando requisição... 🚀');

        try {
            const headers = new Headers();

            // Adicionar API Key se fornecida
            if (apiKeyValue) {
                headers.append('X-API-Key', apiKeyValue);
            }

            // Configurar corpo da requisição
            let requestBody = null;
            if (method === 'POST' || method === 'PUT') {
                if (bodyData) {
                    headers.append('Content-Type', 'application/json');
                    try {
                        requestBody = JSON.parse(bodyData);
                    } catch (e) {
                        // Se não for JSON válido, enviar como string
                        requestBody = bodyData;
                    }
                }
            }

            // Configurar opções da requisição
            const options = {
                method: method,
                headers: headers
            };

            if (requestBody) {
                options.body = method === 'POST' || method === 'PUT'
                    ? JSON.stringify(requestBody)
                    : requestBody;
            }

            // Fazer a requisição
            const response = await fetch(url, options);

            // Atualizar status
            const statusClass = `status-${response.status}`;
            const statusColor = document.createElement('span');
            statusColor.className = `status-indicator ${statusClass}`;

            const statusText = `${statusColor.outerHTML} ${response.status} ${response.statusText}`;
            updateResponse('status', statusText);

            // Obter cabeçalhos de resposta
            const headersText = [];
            response.headers.forEach((value, key) => {
                headersText.push(`${key}: ${value}`);
            });
            updateResponse('headers', headersText.join('\n'));

            // Obter corpo da resposta
            const contentType = response.headers.get('Content-Type');
            let responseBody;

            // Tentar interpretar como JSON, caso contrário mostrar como texto
            try {
                if (contentType && contentType.includes('application/json')) {
                    responseBody = await response.json();
                    responseBody = JSON.stringify(responseBody, null, 2);
                } else {
                    responseBody = await response.text();
                }
            } catch (e) {
                responseBody = await response.text();
            }

            // Atualizar corpo
            updateResponse('body', responseBody);

            // Atualizar raw
            const rawResponse = {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: responseBody
            };
            updateResponse('raw', JSON.stringify(rawResponse, null, 2));

        } catch (error) {
            updateResponse('status', `❌ Erro: ${error.message}`);
            updateResponse('headers', '');
            updateResponse('body', `Ocorreu um erro ao fazer a requisição: ${error.message}`);
            updateResponse('raw', JSON.stringify({ error: error.message }, null, 2));
        }
    });

    // Limpar formulário
    clearBtn.addEventListener('click', function () {
        form.reset();
        updateResponse('status', 'Selecione um método e digite uma URL para começar');
        updateResponse('headers', '');
        updateResponse('body', '');
        updateResponse('raw', '');
        apiUrl.focus();
    });

    // Atualizar respostas
    function updateResponse(type, content) {
        document.getElementById(`${type}Text`).textContent = content || '';
    }

    // Exemplo inicial
    apiUrl.value = 'https://jsonplaceholder.typicode.com/posts';
    apiMethod.value = 'GET';
    apiBody.value = JSON.stringify({
        title: 'Novo Post',
        body: 'Conteúdo do post...',
        userId: 1
    }, null, 2);
});