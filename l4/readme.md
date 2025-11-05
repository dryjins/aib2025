**Role**
You are an expert senior frontend developer specializing in creating clean, responsive, mobile-first web applications with vanilla JavaScript. Your code should be easy to read, well-documented, and use modern web standards without any external libraries or frameworks.

**Context**
The goal is to build a simple MVP (Minimum Viable Product) that generates images of cars using the Hugging Face Inference API. This MVP will be a single-page web application deployed on GitHub Pages. The app will have a mobile-friendly user interface allowing users to select a car brand and type, and then generate an image based on their selections. The Hugging Face API key will be entered directly by the user into an input field for simplicity.

The specific Hugging Face API to be used is `stabilityai/stable-diffusion-xl-base-1.0` via the endpoint `https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0`. The API call requires a `POST` request with a JSON body containing an `inputs` string (e.g., `"A futuristic BMW sports car"`) and returns an image blob.

**Instruction**
Create two files: `index.html` and `app.js`.

**1. `index.html` File Requirements:**
   -   **Structure**: A single HTML file with a clean, mobile-first layout. Use a `<meta name="viewport" ...>` tag for responsiveness.
   -   **Styling**: Use an internal `<style>` tag for all CSS. Keep it minimal and modern. The layout should be a single column, easy to use on a phone.
   -   **API Key Input**: An `<input type="text">` field with `id="apiKey"` for the user to paste their Hugging Face API token.
   -   **Car Brand Selector**: A `<select>` dropdown with `id="carBrand"`. Options should include at least: "BMW", "Mercedes-Benz", "Audi", "Tesla", "Porsche".
   -   **Car Type Selector**: A `<select>` dropdown with `id="carType"`. Options should include at least: "Sedan", "Sports Car", "SUV", "Jeep", "Convertible".
   -   **Generate Button**: A `<button>` with `id="generateBtn"`. The text should be "Generate Image".
   -   **Output Area**: A `<div>` with `id="outputArea"`. This div will be used to display loading messages and the final generated image.

**2. `app.js` File Requirements:**
   -   **Event Listener**: Attach a `click` event listener to the "Generate Image" button (`#generateBtn`).
   -   **Input Handling**: Inside the event listener, retrieve the current values from the API key input, the car brand dropdown, and the car type dropdown.
   -   **Prompt Construction**: Concatenate the selected brand and type to form a descriptive string for the API. For example, if "BMW" and "Sports Car" are selected, the prompt string should be `"A photorealistic image of a futuristic BMW sports car"`. Be creative with the prompt to get good results.
   -   **API Call Function**: Create an `async` function, for example `generateImage(apiKey, prompt)`, that performs the `fetch` request to the Hugging Face API endpoint.
        -   The function must take the API key and the prompt string as arguments.
        -   It should use the `POST` method.
        -   The `headers` must include the `Authorization: Bearer ${apiKey}` and `Content-Type: application/json`.
        -   The `body` must be `JSON.stringify({ inputs: prompt })`.
   -   **Loading State**: Before making the API call, display a loading message (e.g., "Generating... this may take a minute.") inside the `#outputArea`.
   -   **Image Display**:
        -   The API returns an image `blob`. Use `await response.blob()` to get the data.
        -   Create a temporary URL for the blob using `URL.createObjectURL(blob)`.
        -   Create an `<img>` element, set its `src` to the object URL, and append it to the `#outputArea`, replacing the loading message.
   -   **Error Handling**: Wrap the `fetch` call in a `try...catch` block. If the API call fails (e.g., `!response.ok` or a network error), display a user-friendly error message in the `#outputArea`. This is important as the model might be loading.

**Output Format**
Provide the complete code in two separate, clearly labeled code blocks. Do not add any extra explanations before or after the code blocks.

```html
<!-- index.html -->
```

```javascript
// app.js
```
