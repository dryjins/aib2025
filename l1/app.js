// Global variables
let reviews = [];
const tsvUrl = 'https://raw.githubusercontent.com/your-repo/main/reviews_test.tsv'; // Replace with your actual URL

// DOM elements
const apiTokenInput = document.getElementById('api-token');
const analyzeBtn = document.getElementById('analyze-btn');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const resultElement = document.getElementById('result');
const sentimentLabel = document.getElementById('sentiment-label');
const reviewText = document.getElementById('review-text');

// Load TSV data when the page loads
document.addEventListener('DOMContentLoaded', loadTsvData);

// Event listener for the analyze button
analyzeBtn.addEventListener('click', analyzeRandomReview);

// Function to load TSV data
async function loadTsvData() {
    try {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Loading reviews...';
        
        const response = await fetch(tsvUrl);
        if (!response.ok) {
            throw new Error(`Failed to load TSV file: ${response.status}`);
        }
        
        const tsvData = await response.text();
        reviews = parseTsv(tsvData);
        
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Random Review';
    } catch (error) {
        showError(`Error loading reviews: ${error.message}`);
        analyzeBtn.textContent = 'Failed to load reviews';
    }
}

// Function to parse TSV data
function parseTsv(tsvData) {
    const lines = tsvData.split('\n');
    const headers = lines[0].split('\t');
    const textIndex = headers.indexOf('text');
    
    if (textIndex === -1) {
        throw new Error('TSV file does not contain a "text" column');
    }
    
    const reviews = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const columns = line.split('\t');
            if (columns.length > textIndex) {
                reviews.push(columns[textIndex]);
            }
        }
    }
    
    return reviews;
}

// Function to analyze a random review
async function analyzeRandomReview() {
    // Hide previous results and errors
    hideError();
    hideResult();
    
    // Validate API token
    const apiToken = apiTokenInput.value.trim();
    if (!apiToken) {
        showError('Please enter your Hugging Face API token');
        return;
    }
    
    // Validate that reviews are loaded
    if (reviews.length === 0) {
        showError('No reviews loaded. Please try again later.');
        return;
    }
    
    // Show loading state
    showLoading();
    analyzeBtn.disabled = true;
    
    try {
        // Select a random review
        const randomIndex = Math.floor(Math.random() * reviews.length);
        const selectedReview = reviews[randomIndex];
        
        // Call Hugging Face API
        const sentiment = await analyzeSentiment(selectedReview, apiToken);
        
        // Display results
        displayResult(sentiment, selectedReview);
    } catch (error) {
        showError(`Analysis failed: ${error.message}`);
    } finally {
        // Hide loading state and re-enable button
        hideLoading();
        analyzeBtn.disabled = false;
    }
}

// Function to call Hugging Face API
async function analyzeSentiment(reviewText, apiToken) {
    const apiUrl = 'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-V3.1';
    
    const prompt = `Analyze the sentiment of the following product review as 'positive', 'negative', or 'neutral':
    
    Review: "${reviewText}"
    
    Sentiment:`;
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                max_new_tokens: 10,
                return_full_text: false
            }
        })
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid API token');
        } else if (response.status === 503) {
            throw new Error('Model is loading, please try again in a few moments');
        } else {
            throw new Error(`API request failed with status ${response.status}`);
        }
    }
    
    const data = await response.json();
    
    // Extract the generated text
    if (!data || !data[0] || !data[0].generated_text) {
        throw new Error('Invalid response from API');
    }
    
    const generatedText = data[0].generated_text.toLowerCase().trim();
    
    // Extract sentiment from the response
    if (generatedText.includes('positive')) {
        return 'positive';
    } else if (generatedText.includes('negative')) {
        return 'negative';
    } else if (generatedText.includes('neutral')) {
        return 'neutral';
    } else {
        // If the model didn't return a clear sentiment, try to parse it
        const sentimentMatch = generatedText.match(/(positive|negative|neutral)/);
        if (sentimentMatch) {
            return sentimentMatch[0];
        } else {
            throw new Error('Could not determine sentiment from API response');
        }
    }
}

// Function to display results
function displayResult(sentiment, review) {
    // Set appropriate class and icon based on sentiment
    resultElement.className = 'result';
    
    let icon, label;
    switch(sentiment) {
        case 'positive':
            resultElement.classList.add('positive');
            icon = '👍';
            label = 'Positive Sentiment';
            break;
        case 'negative':
            resultElement.classList.add('negative');
            icon = '👎';
            label = 'Negative Sentiment';
            break;
        case 'neutral':
            resultElement.classList.add('neutral');
            icon = '❓';
            label = 'Neutral Sentiment';
            break;
        default:
            icon = '❓';
            label = 'Unknown Sentiment';
    }
    
    // Update the UI
    sentimentLabel.innerHTML = `<span class="icon">${icon}</span> ${label}`;
    reviewText.textContent = review;
    
    // Show the result
    resultElement.style.display = 'block';
}

// UI helper functions
function showLoading() {
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    errorElement.style.display = 'none';
}

function hideResult() {
    resultElement.style.display = 'none';
}
