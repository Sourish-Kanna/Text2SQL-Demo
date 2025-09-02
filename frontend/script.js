document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('query-form');
    const input = document.getElementById('question-input');
    const submitButton = document.getElementById('submit-button');
    
    const resultsContainer = document.getElementById('results-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContent = document.getElementById('result-content');
    const errorContainer = document.getElementById('error-container');
    const runButtonContainer = document.getElementById('run-button-container');
    const tableContainer = document.getElementById('table-container');

    const sqlQueryOutput = document.getElementById('sql-query-output');
    const validationOutput = document.getElementById('validation-output');
    const errorMessage = document.getElementById('error-message');
    const queryOutputTable = document.getElementById('query-output-table');

    const GENERATE_API_URL = 'http://localhost:8000/generate-sql';
    const EXECUTE_API_URL = 'http://localhost:8000/execute-sql';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = input.value.trim();
        if (!question) return;

        // --- Reset UI from previous run ---
        submitButton.disabled = true;
        submitButton.textContent = 'Generating...';
        resultsContainer.classList.remove('hidden');
        resultContent.classList.add('hidden');
        errorContainer.classList.add('hidden');
        tableContainer.classList.add('hidden');
        runButtonContainer.innerHTML = ''; // Clear previous run button
        queryOutputTable.innerHTML = ''; // Clear previous table
        loadingSpinner.classList.remove('hidden');

        try {
            const response = await fetch(GENERATE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            handleValidationResponse(data);

        } catch (error) {
            showError(error.message);
        } finally {
            loadingSpinner.classList.add('hidden');
            submitButton.disabled = false;
            submitButton.textContent = 'Generate SQL';
        }
    });

    function handleValidationResponse(data) {
        sqlQueryOutput.textContent = data.sql_query;
        validationOutput.textContent = data.validation_result;
        resultContent.classList.remove('hidden');

        if (data.validation_result.toLowerCase().includes('successful')) {
            validationOutput.className = 'success';
            // Only show run button if validation is successful and it's a SELECT query
            if (data.sql_query.trim().toUpperCase().startsWith("SELECT")) {
                 createRunButton(data.sql_query);
            }
        } else {
            validationOutput.className = 'error';
        }
    }

    function createRunButton(query) {
        const runButton = document.createElement('button');
        runButton.textContent = 'Run Query';
        runButton.id = 'run-query-button';
        runButton.onclick = () => executeQuery(query, runButton);
        runButtonContainer.appendChild(runButton);
    }

    async function executeQuery(query, button) {
        button.disabled = true;
        button.textContent = 'Running...';
        loadingSpinner.classList.remove('hidden');
        tableContainer.classList.add('hidden');
        queryOutputTable.innerHTML = '';
        errorContainer.classList.add('hidden'); // Hide previous errors

        try {
            const response = await fetch(EXECUTE_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            displayTable(result.data);

        } catch (error) {
            showError(error.message);
        } finally {
            loadingSpinner.classList.add('hidden');
            button.disabled = false;
            button.textContent = 'Run Query';
        }
    }

    function displayTable(data) {
        if (!data || data.length === 0) {
            queryOutputTable.innerHTML = '<p>Query returned no results.</p>';
            tableContainer.classList.remove('hidden');
            return;
        }

        const table = document.createElement('table');
        table.className = 'results-table';
        
        // Create headers
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = Object.keys(data[0]);
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        data.forEach(rowData => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = rowData[header];
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        queryOutputTable.appendChild(table);
        tableContainer.classList.remove('hidden');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove('hidden');
    }
});

