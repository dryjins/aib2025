// app.js
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const apiKeyInput = document.getElementById('apiKey');
    const carBrandSelect = document.getElementById('carBrand');
    const carTypeSelect = document.getElementById('carType');
    const outputArea = document.getElementById('outputArea');

    generateBtn.addEventListener('click', handleGenerateClick);

    async function handleGenerateClick() {
        const apiKey = apiKeyInput.value.trim();
        const carBrand = carBrandSelect.value;
        const carType = carTypeSelect.value;

        // Validate inputs
        if (!apiKey) {
            showError('Please enter your Hugging Face API key');
            return;
        }

        if (!carBrand || !carType) {
            showError('Please select both car brand and type');
            return;
        }

        // Create descriptive prompt
        const prompt = createPrompt(carBrand, carType);
        
        // Generate image
        await generateImage(apiKey, prompt);
    }

    function createPrompt(brand, type) {
        const adjectives = ['futuristic', 'sleek', 'modern', 'elegant', 'powerful', 'luxurious'];
        const settings = ['on a scenic road', 'in a modern city', 'with dramatic lighting', 'in a professional photoshoot'];
        
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomSetting = settings[Math.floor(Math.random() * settings.length)];
        
        return `A photorealistic image of a ${randomAdjective} ${brand} ${type.toLowerCase()} ${randomSetting}, highly detailed, professional photography, 4k resolution`;
    }

    async function generateImage(apiKey, prompt) {
        // Show loading state
        showLoading();

        try {
            const response = await fetch(
                'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ inputs: prompt })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }

            const blob = await response.blob();
            
            if (blob.size === 0) {
                throw new Error('Received empty image from API');
            }

            displayImage(blob);

        } catch (error) {
            console.error('Error generating image:', error);
            
            let errorMessage = 'Failed to generate image. ';
            if (error.message.includes('401')) {
                errorMessage += 'Invalid API key. Please check your Hugging Face API token.';
            } else if (error.message.includes('429')) {
                errorMessage += 'API rate limit exceeded. Please try again later.';
            } else if (error.message.includes('503')) {
                errorMessage += 'Service temporarily unavailable. The model might be loading. Please try again in a minute.';
            } else {
                errorMessage += error.message || 'Please check your API key and try again.';
            }
            
            showError(errorMessage);
        }
    }

    function showLoading() {
        outputArea.innerHTML = '<div class="loading">🔄 Generating your car image... This may take 20-30 seconds.</div>';
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
    }

    function displayImage(blob) {
        const imageUrl = URL.createObjectURL(blob);
        
        outputArea.innerHTML = `
            <img id="generatedImage" src="${imageUrl}" alt="Generated car image" 
                 onload="URL.revokeObjectURL(this.src)">
            <p style="margin-top: 15px; color: #666;">Image generated successfully!</p>
        `;

        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Image';
    }

    function showError(message) {
        outputArea.innerHTML = `<div class="error">❌ ${message}</div>`;
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Image';
    }
});
