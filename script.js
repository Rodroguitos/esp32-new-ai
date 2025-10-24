document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send-button');
    const promptInput = document.getElementById('prompt-input');
    const responseText = document.getElementById('response-text');
    const assistantGif = document.getElementById('assistant-gif');

    // URLs dos GIFs (elas apontam para os arquivos que estão no LittleFS)
    const IDLE_GIF = '/idle.gif';
    const THINKING_GIF = '/thinking.gif';
    
    // Rota da API no ESP32
    const API_ENDPOINT = '/ask'; 

    sendButton.addEventListener('click', sendPrompt);
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendPrompt();
        }
    });

    async function sendPrompt() {
        const prompt = promptInput.value.trim();
        if (prompt === "") return;

        // 1. Bloqueia a UI e muda para o GIF de "pensamento"
        sendButton.disabled = true;
        responseText.textContent = "Aguarde, processando...";
        assistantGif.src = THINKING_GIF;

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                // Envia o prompt no formato 'prompt=sua pergunta'
                body: `prompt=${encodeURIComponent(prompt)}`
            });

            const data = await response.json();

            // 2. Processa a resposta do ESP32
            if (response.ok && data.response) {
                // Sucesso: Exibe a resposta da IA
                responseText.textContent = data.response;
            } else {
                // Erro: Exibe a mensagem de erro da IA ou do servidor
                responseText.textContent = `ERRO: ${data.error || 'Falha na comunicação com o ESP32.'}`;
                console.error("API Error Data:", data);
            }
        } catch (error) {
            // 3. Exibe erro de rede (se o ESP32 estiver offline, por exemplo)
            responseText.textContent = "ERRO DE CONEXÃO: Verifique se o ESP32 está ligado e conectado ao Wi-Fi.";
            console.error("Network Error:", error);
        } finally {
            // 4. Libera a UI e volta para o GIF de "ocioso"
            sendButton.disabled = false;
            assistantGif.src = IDLE_GIF;
            promptInput.value = ''; // Limpa o campo de entrada
        }
    }
});