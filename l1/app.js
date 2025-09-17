const API_TOKEN = "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";
const API_URL = "https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-V3.1";
let reviewsData = [];

document.addEventListener('DOMContentLoaded', async function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const resultsEl = document.getElementById('results');
    const reviewTextEl = document.getElementById('reviewText');
    const analysisResultEl = document.getElementById('analysisResult');
    const sentimentIconEl = document.getElementById('sentimentIcon');
    const sentimentLabelEl = document.getElementById('sentimentLabel');

    // Load and parse TSV data
    try {
        const response = await fetch('reviews_test.tsv');
        if (!response.ok) {
            throw new Error('Failed to load reviews data');
        }
        
        const tsvData = await response.text();
        const parsedData = Papa.parse(tsvData, {
            header: true,
            delimiter: '\t',
            skipEmptyLines: true
        });

        if (parsedData.errors.length > 0) {
            throw new Error('Error parsing TSV data: ' + parsedData.errors[0].message);
        }

        reviewsData = parsedData.data.filter(review => review.text && review.text.trim() !== '');
        
        if (reviewsData.length === 0) {
            throw new Error('No valid reviews found in the data');
        }

        analyzeBtn.disabled = false;
    } catch (error) {
        showError('Error loading data: ' + error.message);
        analyzeBtn.disabled = true;
        return;
    }

    analyzeBtn.addEventListener('click', async function() {
        // Reset previous results
        hideError();
        resultsEl.style.display = 'none';
        loadingEl.style.display = 'block';
        analyzeBtn.disabled = true;

        try {
            // Select random review
            const randomIndex = Math.floor(Math.random() * reviewsData.length);
            const randomReview = reviewsData[randomIndex];
            const reviewText = randomReview.text;

            // Display the review text
            reviewTextEl.textContent = reviewText;

            // Prepare prompt for the model
            const prompt = `Analyze the sentiment of this review as positive, negative, or neutral: ${reviewText}`;

            // Call Hugging Face API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 50,
                        temperature: 0.1
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            if (!data || !Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid response from API');
            }

            const analysisText = data[0].generated_text;
            analysisResultEl.textContent = analysisText;

            // Determine sentiment from response
            const sentiment = determineSentiment(analysisText);
            displaySentiment(sentiment);

            // Show results
            resultsEl.style.display = 'block';

        } catch (error) {
            showError('Analysis failed: ' + error.message);
        } finally {
            loadingEl.style.display = 'none';
            analyzeBtn.disabled = false;
        }
    });

    function determineSentiment(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('positive') || lowerText.includes('positive sentiment')) {
            return 'positive';
        } else if (lowerText.includes('negative') || lowerText.includes('negative sentiment')) {
            return 'negative';
        } else if (lowerText.includes('neutral') || lowerText.includes('neutral sentiment')) {
            return 'neutral';
        }
        
        // Fallback: check for keywords if explicit sentiment isn't mentioned
        if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('excellent') || 
            lowerText.includes('love') || lowerText.includes('recommend') || lowerText.includes('awesome')) {
            return 'positive';
        } else if (lowerText.includes('bad') || lowerText.includes('terrible') || lowerText.includes('awful') || 
                 lowerText.includes('hate') || lowerText.includes('disappoint') || lowerText.includes('poor')) {
            return 'negative';
        }
        
        return 'neutral';
    }

    function displaySentiment(sentiment) {
        let icon, label;
        
        switch(sentiment) {
            case 'positive':
                icon = '👍';
                label = 'Positive';
                break;
            case 'negative':
                icon = '👎';
                label = 'Negative';
                break;
            case 'neutral':
                icon = '❓';
                label = 'Neutral';
                break;
            default:
                icon = '❓';
                label = 'Unknown';
        }
        
        sentimentIconEl.textContent = icon;
        sentimentLabelEl.textContent = label;
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    function hideError() {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    }
});
