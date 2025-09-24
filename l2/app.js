class ReviewAnalyzer {
    constructor() {
        this.reviews = [];
        this.currentReview = null;
        this.apiUrl = 'https://api-inference.huggingface.co/models/siebert/sentiment-roberta-large-english';
        
        this.initializeElements();
        this.bindEvents();
        this.loadReviews();
    }

    initializeElements() {
        this.tokenInput = document.getElementById('tokenInput');
        this.loadReviewBtn = document.getElementById('loadReview');
        this.analyzeSentimentBtn = document.getElementById('analyzeSentiment');
        this.countNounsBtn = document.getElementById('countNouns');
        this.reviewText = document.getElementById('reviewText');
        this.sentimentResult = document.getElementById('sentimentResult');
        this.sentimentDetails = document.getElementById('sentimentDetails');
        this.nounResult = document.getElementById('nounResult');
        this.nounDetails = document.getElementById('nounDetails');
    }

    bindEvents() {
        this.loadReviewBtn.addEventListener('click', () => this.loadRandomReview());
        this.analyzeSentimentBtn.addEventListener('click', () => this.analyzeSentiment());
        this.countNounsBtn.addEventListener('click', () => this.countNouns());
    }

    loadReviews() {
        Papa.parse('reviews_test.tsv', {
            download: true,
            header: true,
            delimiter: '\t',
            complete: (results) => {
                this.reviews = results.data.filter(review => review.text && review.text.trim() !== '');
                this.loadReviewBtn.disabled = false;
            },
            error: (error) => {
                this.showError('Failed to load reviews file: ' + error.message);
            }
        });
    }

    loadRandomReview() {
        if (this.reviews.length === 0) {
            this.showError('No reviews available');
            return;
        }

        const randomIndex = Math.floor(Math.random() * this.reviews.length);
        this.currentReview = this.reviews[randomIndex];
        this.reviewText.textContent = this.currentReview.text;
        
        this.resetResults();
        this.analyzeSentimentBtn.disabled = false;
        this.countNounsBtn.disabled = false;
    }

    resetResults() {
        this.sentimentResult.innerHTML = '<i class="fas fa-question-circle"></i>';
        this.sentimentDetails.innerHTML = '';
        this.nounResult.innerHTML = '<i class="fas fa-question-circle"></i>';
        this.nounDetails.innerHTML = '';
    }

    async analyzeSentiment() {
        if (!this.currentReview) return;

        this.setLoading(this.sentimentResult, 'Analyzing sentiment...');
        this.sentimentDetails.innerHTML = '';

        const prompt = "Classify as positive, negative, or neutral: ";
        const text = this.currentReview.text;

        try {
            const response = await this.callAPI(prompt + text);
            this.displaySentimentResult(response);
        } catch (error) {
            this.showError('Sentiment analysis failed: ' + error.message, this.sentimentDetails);
            this.sentimentResult.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        }
    }

    async countNouns() {
        if (!this.currentReview) return;

        this.setLoading(this.nounResult, 'Counting nouns...');
        this.nounDetails.innerHTML = '';

        const prompt = "Count nouns and classify as high (>15), medium (6-15), or low (<6): ";
        const text = this.currentReview.text;

        try {
            const response = await this.callAPI(prompt + text);
            this.displayNounResult(response);
        } catch (error) {
            this.showError('Noun counting failed: ' + error.message, this.nounDetails);
            this.nounResult.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        }
    }

    async callAPI(inputs) {
        const token = this.tokenInput.value.trim();
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ inputs })
        });

        if (!response.ok) {
            if (response.status === 503) {
                throw new Error('Model is loading, please try again in a few moments');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded, please try again later');
            } else if (response.status === 401) {
                throw new Error('Invalid or missing token');
            } else {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
        }

        return await response.json();
    }

    displaySentimentResult(data) {
        let result;
        if (Array.isArray(data) && data.length > 0) {
            result = data[0];
        } else if (data && data[0] && data[0][0]) {
            result = data[0][0];
        } else {
            throw new Error('Unexpected API response format');
        }

        const label = result.label.toLowerCase();
        const score = (result.score * 100).toFixed(1);

        let icon, color;
        if (label.includes('positive')) {
            icon = 'fa-thumbs-up';
            color = '#28a745';
        } else if (label.includes('negative')) {
            icon = 'fa-thumbs-down';
            color = '#dc3545';
        } else {
            icon = 'fa-question-circle';
            color = '#6c757d';
        }

        this.sentimentResult.innerHTML = `<i class="fas ${icon}" style="color: ${color};"></i>`;
        this.sentimentDetails.innerHTML = `
            <div class="success">
                <strong>${label.toUpperCase()}</strong><br>
                Confidence: ${score}%
            </div>
        `;
    }

    displayNounResult(data) {
        const responseText = Array.isArray(data) && data.length > 0 ? data[0].generated_text : data;
        const text = typeof responseText === 'string' ? responseText.toLowerCase() : '';

        let level, icon, color;
        if (text.includes('high')) {
            level = 'HIGH';
            icon = 'fa-arrow-up';
            color = '#dc3545';
        } else if (text.includes('medium')) {
            level = 'MEDIUM';
            icon = 'fa-minus';
            color = '#ffc107';
        } else if (text.includes('low')) {
            level = 'LOW';
            icon = 'fa-arrow-down';
            color = '#28a745';
        } else {
            level = 'UNKNOWN';
            icon = 'fa-question-circle';
            color = '#6c757d';
        }

        this.nounResult.innerHTML = `<i class="fas ${icon}" style="color: ${color};"></i>`;
        this.nounDetails.innerHTML = `
            <div class="success">
                <strong>${level}</strong><br>
                ${text}
            </div>
        `;
    }

    setLoading(element, message) {
        element.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
        if (element.nextElementSibling) {
            element.nextElementSibling.innerHTML = `<div class="loading">${message}</div>`;
        }
    }

    showError(message, element = null) {
        const errorHtml = `<div class="error">${message}</div>`;
        if (element) {
            element.innerHTML = errorHtml;
        } else {
            this.reviewText.innerHTML = errorHtml;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ReviewAnalyzer();
});
