document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('api-form');
    const inputText = document.getElementById('inputText');
    const responseSection = document.getElementById('response-section');
    const apiResponse = document.getElementById('api-response');
    const developerMessage = document.getElementById('developerMessage');
    const userMessage = document.getElementById('userMessage');
    const model = document.getElementById('model');
    const apiKey = document.getElementById('apiKey');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        // Show spinner
        apiResponse.classList.remove('visible');
        apiResponse.innerHTML = '<span class="spinner"></span>';
        responseSection.style.display = 'block';
        form.querySelector('button').disabled = true;

        try {
            const payload = {
                developer_message: developerMessage.value,
                user_message: userMessage.value,
                model: model.value || undefined,
                api_key: apiKey.value
            };
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('API error: ' + response.status);
            }

            let result = '';
            if (response.body && response.body.getReader) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    result += decoder.decode(value, { stream: true });
                    apiResponse.textContent = result;
                }
            } else {
                result = await response.text();
                apiResponse.textContent = result;
            }
            // Animate response
            setTimeout(() => {
                apiResponse.classList.add('visible');
            }, 100);
        } catch (err) {
            apiResponse.textContent = 'Error: ' + err.message;
            setTimeout(() => {
                apiResponse.classList.add('visible');
            }, 100);
        } finally {
            form.querySelector('button').disabled = false;
        }
    });
});
