class APIHandler {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.cache = new Map(); // Simple caching mechanism
    }

    async fetchData(endpoint) {
        if (this.cache.has(endpoint)) {
            return this.cache.get(endpoint);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.cache.set(endpoint, data);
            return data;
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    async fetchWithRetry(endpoint, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                return await this.fetchData(endpoint);
            } catch (error) {
                if (i === retries - 1) throw error;
            }
        }
    }

    logError(error) {
        // Log error to an external service or to the console
        console.error('Error fetching data:', error);
        // Optionally, send error details to an external logging service here
    }
}

class DataProcessor {
    constructor(data) {
        this.data = data;
    }

    process() {
        // Example processing: filter and sort data
        return this.data
            .filter(item => item.active) // Assuming the data has an 'active' property
            .sort((a, b) => a.name.localeCompare(b.name)); // Assuming the data has a 'name' property
    }

    search(query) {
        return this.data.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    }

    display(data) {
        data.forEach(item => {
            console.log(`Name: ${item.name}, Active: ${item.active}`);
        });
    }
}

(async () => {
    const apiHandler = new APIHandler('https://jsonplaceholder.typicode.com');
    
    try {
        const data = await apiHandler.fetchWithRetry('/users');
        const dataProcessor = new DataProcessor(data);

        // Process and display data
        const processedData = dataProcessor.process();
        dataProcessor.display(processedData);

        // Search and display results
        const searchQuery = 'Ervin'; // Example search query
        const searchResults = dataProcessor.search(searchQuery);
        console.log(`Search results for "${searchQuery}":`);
        dataProcessor.display(searchResults);
    } catch (error) {
        console.error('Failed to process data:', error);
    }
})();
