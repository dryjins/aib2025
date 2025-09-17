class ReviewAnalyzer {
    constructor() {
        this.reviews = [];
        this.apiToken = '';
        this.initializeApp();
    }

    initializeApp() {
        this.loadTSVFile();
        this.setupEventListeners();
    }

    loadTSVFile() {
        // Using PapaParse to load and parse the TSV file
        Papa.parse('reviews_test.tsv', {
            download: true,
            header: true,
            delimiter: '\t',
            complete: (results) => {
                this.reviews = results.data.filter(review => review.text && review.text.trim() !== '');
                this.updateStatus('TSV file loaded successfully! Ready to analyze reviews.', 'success');
                document.getElementById('analyzeBtn').disabled = false;
            },
            error: (error) => {
                this.updateStatus('Error loading TSV file: ' + error.message, 'error');
            }
        });
    }

    setupEventListeners() {
        const apiTokenInput = document.getElementById('apiToken');
        const analyzeBtn = document.getElementById('analyzeBtn');

        apiTokenInput.addEventListener('input', () => {
            this.apiToken = apiTokenInput.value.trim();
            analyzeBtn.disabled = !this.apiToken || this.reviews.length === 0;
        });

        analyzeBtn.addEventListener('click', () => {
            this.analyzeRandomReview();
        });
    }

    getRandomReview() {
        if (this.reviews.length === 0) {
            throw new Error('No reviews available');
        }
        
        const randomIndex = Math.floor(Math.random() * this.reviews.length);
        const review = this.reviews[randomIndex];
        
        return {
            text: review.text,
            sentiment: review.sentiment,
            summary: review.summary,
            productId: review.productId
        };
    }

    async analyzeRandomReview() {
        try {
            this.updateStatus('Analyzing review...', 'loading');
            
            const review = this.getRandomReview();
            this.displayReview(review);
            
            const sentiment = await this.callHuggingFaceAPI(review.text);
            this.displaySentiment(sentiment);
            
            this.updateStatus('Analysis complete!', 'success');
            
        } catch (error) {
            this.updateStatus('Error: ' + error.message, 'error');
        }
    }

    async callHuggingFaceAPI(reviewText) {
        if (!this.apiToken) {
            throw new Error('API token is required');
        }

        const prompt = `Analyze the following product review and classify its sentiment as positive, negative, or neutral. 
        Only respond with one word: "positive", "negative", or "neutral".

        Review: "${reviewText}"

        Sentiment:`;

        const response = await fetch(
            'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-V3.1',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 10,
                        temperature: 0.1
                    }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data[0] || !data[0].generated_text) {
            throw new Error('Invalid response from API');
        }

        // Extract the sentiment from the response
        const generatedText = data[0].generated_text.toLowerCase();
        let sentiment = 'neutral';
        
        if (generatedText.includes('positive')) {
            sentiment = 'positive';
        } else if (generatedText.includes('negative')) {
            sentiment = 'negative';
        }

        return sentiment;
    }

    displayReview(review) {
        document.getElementById('reviewText').textContent = review.text;
        document.getElementById('result').style.display = 'block';
    }

    displaySentiment(sentiment) {
        const iconElement = document.getElementById('sentimentIcon');
        const textElement = document.getElementById('sentimentText');
        
        switch(sentiment) {
            case 'positive':
                iconElement.textContent = '👍';
                textElement.textContent = 'Positive Sentiment';
                textElement.style.color = '#2e7d32';
                break;
            case 'negative':
                iconElement.textContent = '👎';
                textElement.textContent = 'Negative Sentiment';
                textElement.style.color = '#d32f2f';
                break;
            case 'neutral':
                iconElement.textContent = '❓';
                textElement.textContent = 'Neutral Sentiment';
                textElement.style.color = '#666';
                break;
            default:
                iconElement.textContent = '❓';
                textElement.textContent = 'Unknown Sentiment';
                textElement.style.color = '#666';
        }
    }

    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('status');
        statusElement.innerHTML = '';
        
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        
        switch(type) {
            case 'error':
                messageDiv.className = 'error';
                break;
            case 'success':
                messageDiv.className = 'success';
                break;
            case 'loading':
                messageDiv.className = 'loading';
                break;
            default:
                messageDiv.className = 'info';
        }
        
        statusElement.appendChild(messageDiv);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ReviewAnalyzer();
});
