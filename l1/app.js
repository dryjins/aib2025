// Global variables
let reviews = [];
let apiToken = '';

// DOM elements
const analyzeBtn = document.getElementById('analyze-btn');
const reviewText = document.getElementById('review-text');
const sentimentResult = document.getElementById('sentiment-result');
const loadingElement = document.querySelector('.loading');
const errorElement = document.getElementById('error-message');
const apiTokenInput = document.getElementById('api-token');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Load the TSV file
    loadReviews();
    
    // Set up event listeners
    analyzeBtn.addEventListener('click', analyzeRandomReview);
    apiTokenInput.addEventListener('change', saveApiToken);
    
    // Load saved API token if exists
    const savedToken = localStorage.getItem('hfApiToken');
    if (savedToken) {
        apiTokenInput.value = savedToken;
        apiToken = savedToken;
    }
});

// Load and parse the TSV file
function loadReviews() {
    // In a real implementation, you would fetch the TSV file
    // For this example, we'll use a simplified approach with a few sample reviews
    
    // Sample reviews data (in a real app, this would come from parsing the TSV)
    reviews = [
        "Wonderful product! I began to use it for my daughter who was about to turn a year old. She took it with no problems!",
        "I just cannot understand the high praise these chips have received. I ordered the variety pack and am very disappointed.",
        "This product is great tasting! I was eating the pepitas at half the price due to not finding USA made pumpkin seeds.",
        "Just a word of warning...This product is made in China where they may add a substance that can cause serious kidney problems in dogs.",
        "It is hard to stay out of these wonderful cookies! Just the right amount of chocolate chips and the texture is melt-in-your-mouth good!",
        "These bars are tasty. Recently, many brands of health bars have come out with chunks of fruits and nuts glued together with a sticky sweetener.",
        "The disposable K cups allow me to use my own coffee with the Keurig single cup coffee maker, better than others I have tried.",
        "My spouse found the syrups to be weak and artificial so that we disposed of the bulk of the shipment.",
        "I obtained a sample and when I opened the package the aroma was not inviting at all. Well, I brewed it up anyway.",
        "These chips are not bad to taste, but a little more money than I would pay for 1 bag of healthy chips."
    ];
    
    // In a real implementation, you would use PapaParse to parse the TSV file:
    /*
    Papa.parse('reviews_test.tsv', {
        download: true,
        header: true,
        delimiter: '\t',
        complete: function(results) {
            reviews = results.data.map(row => row.text);
            console.log('Loaded', reviews.length, 'reviews');
        }
    });
    */
}

// Save API token to localStorage
function saveApiToken() {
    apiToken = apiTokenInput.value.trim();
    if (apiToken) {
        localStorage.setItem('hfApiToken', apiToken);
    }
}

// Analyze a random review
function analyzeRandomReview() {
    // Validate API token
    if (!apiToken) {
        showError('Please enter your Hugging Face API token first.');
        return;
    }
    
    // Hide any previous errors
    hideError();
    
    // Get a random review
    if (reviews.length === 0) {
        showError('No reviews available. Please try again later.');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * reviews.length);
    const selectedReview = reviews[randomIndex];
    
    // Display the review
    reviewText.textContent = selectedReview;
    
    // Show loading state
    loadingElement.style.display = 'block';
    analyzeBtn.disabled = true;
    
    // Call Hugging Face API
    analyzeSentiment(selectedReview)
        .then(result => {
            displaySentiment(result);
            loadingElement.style.display = 'none';
            analyzeBtn.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Failed to analyze sentiment: ' + error.message);
            loadingElement.style.display = 'none';
            analyzeBtn.disabled = false;
        });
}

// Call Hugging Face API for sentiment analysis
async function analyzeSentiment(text) {
    const response = await fetch(
        'https://api-inference.huggingface.co/models/siebert/sentiment-roberta-large-english',
        {
            headers: { Authorization: `Bearer ${apiToken}` },
            method: 'POST',
            body: JSON.stringify({ inputs: text }),
        }
    );
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
}

// Display sentiment result
function displaySentiment(result) {
    // Default to neutral if we can't parse the result
    let sentiment = 'neutral';
    let score = 0.5;
    let label = 'NEUTRAL';
    
    // Parse the API response
    if (Array.isArray(result) && result.length > 0 && result[0].length > 0) {
        const sentimentData = result[0][0];
        label = sentimentData.label;
        score = sentimentData.score;
        
        // Determine sentiment based on label and score
        if (label === 'POSITIVE' && score > 0.5) {
            sentiment = 'positive';
        } else if (label === 'NEGATIVE' && score > 0.5) {
            sentiment = 'negative';
        } else {
            sentiment = 'neutral';
        }
    }
    
    // Update UI
    sentimentResult.innerHTML = `
        <i class="fas ${getSentimentIcon(sentiment)} icon"></i>
        <span>${sentiment.toUpperCase()} (${(score * 100).toFixed(1)}% confidence)</span>
    `;
    
    // Apply appropriate styling
    sentimentResult.className = 'sentiment-result';
    sentimentResult.classList.add(sentiment);
}

// Get appropriate icon for sentiment
function getSentimentIcon(sentiment) {
    switch(sentiment) {
        case 'positive':
            return 'fa-thumbs-up';
        case 'negative':
            return 'fa-thumbs-down';
        default:
            return 'fa-question-circle';
    }
}

// Show error message
function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Hide error message
function hideError() {
    errorElement.style.display = 'none';
}
