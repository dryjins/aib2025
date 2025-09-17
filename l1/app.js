class ReviewAnalyzer {
    constructor() {
        this.reviews = [];
        this.apiToken = '';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.handleAnalyzeClick();
        });
    }

    async handleAnalyzeClick() {
        this.apiToken = document.getElementById('apiToken').value.trim();
        
        if (!this.apiToken) {
            this.showError('Please enter your DeepSeek API token');
            return;
        }

        try {
            await this.loadReviews();
            const randomReview = this.getRandomReview();
            this.displayReview(randomReview);
            await this.analyzeSentiment(randomReview);
        } catch (error) {
            this.showError(error.message);
        }
    }

    loadReviews() {
        return new Promise((resolve, reject) => {
            if (this.reviews.length > 0) {
                resolve();
                return;
            }

            fetch('reviews_test.tsv')
                .then(response => response.text())
                .then(tsvData => {
                    Papa.parse(tsvData, {
                        header: true,
                        delimiter: '\t',
                        complete: (results) => {
                            this.reviews = results.data.filter(row => row.text && row.text.trim() !== '');
                            resolve();
                        },
                        error: (error) => {
                            reject(new Error('Failed to parse TSV file: ' + error.message));
                        }
                    });
                })
                .catch(error => {
                    reject(new Error('Failed to load TSV file: ' + error.message));
                });
        });
    }

    getRandomReview() {
        if (this.reviews.length === 0) {
            throw new Error('No reviews available');
        }
        
        const randomIndex = Math.floor(Math.random() * this.reviews.length);
        return this.reviews[randomIndex].text;
    }

    displayReview(review) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <p><strong>Selected Review:</strong></p>
            <p>${review}</p>
            <p class="loading">Analyzing sentiment...</p>
        `;
    }

    async analyzeSentiment(reviewText) {
        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiToken}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'Classify the sentiment of the following product review as positive, negative, or neutral. Respond with only one word: positive, negative, or neutral.'
                        },
                        {
                            role: 'user',
                            content: `Review: ${reviewText}`
                        }
                    ],
                    max_tokens: 10,
                    temperature: 0
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const sentiment = data.choices[0].message.content.trim().toLowerCase();
            this.displaySentiment(sentiment, reviewText);
        } catch (error) {
            this.showError('Failed to analyze sentiment: ' + error.message);
        }
    }

    displaySentiment(sentiment, reviewText) {
        const resultDiv = document.getElementById('result');
        let icon = '❓';
        
        if (sentiment.includes('positive')) {
            icon = '👍';
        } else if (sentiment.includes('negative')) {
            icon = '👎';
        }
        
        resultDiv.innerHTML = `
            <p><strong>Selected Review:</strong></p>
            <p>${reviewText}</p>
            <div class="sentiment-icon">
                <p><strong>Sentiment:</strong> ${sentiment} ${icon}</p>
            </div>
        `;
    }

    showError(message) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<p class="error">Error: ${message}</p>`;
    }
}

// Initialize the application
new ReviewAnalyzer();
