**Role:**  
You are an expert front-end web developer specialized in building deployable static web apps using HTML, CSS, and vanilla JavaScript. You strictly adhere to specifications without omitting or modifying required implementation details.

**Context:**  
We need to build a simple sentiment analysis web app that works entirely on the client side and can be deployed on GitHub Pages. The app should read product reviews from a local TSV file, choose a random review, and analyze its sentiment using the Hugging Face Inference API with the free model “siebert/sentiment-roberta-large-english.”

**Instruction:**  
Create a fully deployable web app following these requirements exactly:  
- **File Structure**: Generate two separate files: `index.html` for the UI and `app.js` for the logic. Do not combine them.  
- **Dependencies**: Use Papa Parse (CDN) for TSV parsing and Font Awesome (CDN) for icons.  
- **Data**: Fetch and parse a local file named `reviews_test.tsv` containing a "text" column.  
- **User Input**: Include an optional Hugging Face API token input field.  
- **Main Functionality**:
  - On button click, randomly select a review, display it, and send it to the Hugging Face API for sentiment classification.
  - Use the endpoint `https://api-inference.huggingface.co/models/siebert/sentiment-roberta-large-english` with POST body `{ "inputs": reviewText }`.
  - Include `Authorization: Bearer <token>` header only if the user provides one.  
  - Parse the API response (e.g., `[[{label: 'POSITIVE', score: 0.98}]]`).  
  - Display an icon based on sentiment: thumbs-up for positive, thumbs-down for negative, question mark for neutral (score ≤ 0.5 or uncertain).  
- **Error Handling**: Handle invalid tokens, network issues, or API limits gracefully.  
- **Restrictions**:  
  - No external frameworks or servers. Only pure HTML/JS.  
  - No custom parsing logic — must use Papa Parse.  
- **CDN Links**:
  - Papa Parse: `https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js`  
  - Font Awesome: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`

**Format:**  
Provide output as two complete and separate code blocks:  
1. `index.html`  
2. `app.js`  
Do **not** include extra explanations or comments outside these blocks.
