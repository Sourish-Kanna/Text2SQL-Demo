document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('query-form');
    const input = document.getElementById('question-input');
    const submitButton = document.getElementById('submit-button');
    
    const resultsContainer = document.getElementById('results-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContent = document.getElementById('result-content');
    const errorContainer = document.getElementById('error-container');

    const sqlQueryOutput = document.getElementById('sql-query-output');
    const validationOutput = document.getElementById('validation-output');
    const errorMessage = document.getElementById('error-message');

    // The backend API is running on port 8000
    const API_URL = 'http://localhost:8000/generate-sql';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = input.value.trim();
        if (!question) return;

        // --- Show loading state ---
        submitButton.disabled = true;
        submitButton.textContent = 'Generating...';
        resultsContainer.classList.remove('hidden');
        resultContent.classList.add('hidden');
        errorContainer.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // --- Show success state ---
            sqlQueryOutput.textContent = data.sql_query;
            validationOutput.textContent = data.validation_result;

            if (data.validation_result.toLowerCase().includes('failed')) {
                validationOutput.className = 'error';
            } else {
                validationOutput.className = 'success';
            }
            
            resultContent.classList.remove('hidden');

        } catch (error) {
            // --- Show error state ---
            errorMessage.textContent = error.message;
            errorContainer.classList.remove('hidden');
        } finally {
            // --- Reset UI ---
            loadingSpinner.classList.add('hidden');
            submitButton.disabled = false;
            submitButton.textContent = 'Generate SQL';
        }
    });
});