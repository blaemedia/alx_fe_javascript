// ==============================
// SERVER SIMULATION & DATA SYNCING
// ==============================

// Mock server URL (using JSONPlaceholder for simulation)
const MOCK_SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
const SYNC_INTERVAL = 30000; // Sync every 30 seconds
const LAST_SYNC_KEY = 'lastQuoteSync';
const SERVER_QUOTES_KEY = 'serverQuotesBackup';
let syncIntervalId = null;

// Simulated server quotes (in real app, this would come from API)
let serverQuotes = [];

// Fetch quotes from server (mock implementation)
async function fetchQuotesFromServer() {
    console.log('Fetching quotes from server...');
    
    try {
        // In a real implementation, this would be:
        // const response = await fetch('https://api.example.com/quotes');
        // const data = await response.json();
        // return data;
        
        // For simulation, create mock response
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Return mock server data with some sample quotes
        const mockQuotes = [
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                category: "Motivation"
            },
            {
                text: "Life is what happens to you while you're busy making other plans.",
                author: "John Lennon",
                category: "Life"
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                category: "Inspiration"
            }
        ];
        
        // Add some random quotes for variety
        const additionalQuotes = [
            {
                text: "Be yourself; everyone else is already taken.",
                author: "Oscar Wilde",
                category: "Wisdom"
            },
            {
                text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
                author: "Albert Einstein",
                category: "Humor"
            }
        ];
        
        // Combine quotes and return
        const allQuotes = [...mockQuotes, ...additionalQuotes];
        
        console.log(`Fetched ${allQuotes.length} quotes from server`);
        return {
            success: true,
            quotes: allQuotes,
            timestamp: new Date().toISOString(),
            message: 'Quotes fetched successfully'
        };
        
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
        return {
            success: false,
            error: error.message,
            quotes: [],
            timestamp: new Date().toISOString(),
            message: 'Failed to fetch quotes'
        };
    }
}

// Initialize server simulation
function initServerSimulation() {
    console.log('Initializing server simulation...');
    
    // Load server quotes from localStorage if available
    const savedServerQuotes = localStorage.getItem(SERVER_QUOTES_KEY);
    if (savedServerQuotes) {
        try {
            serverQuotes = JSON.parse(savedServerQuotes);
            console.log(`Loaded ${serverQuotes.length} server quotes from backup`);
        } catch (error) {
            console.error('Error loading server quotes:', error);
        }
    }
    
    // Start periodic syncing
    startSyncInterval();
    
    // Perform initial sync
    simulateServerSync();
}

// Start periodic sync interval
function startSyncInterval() {
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
    }
    
    syncIntervalId = setInterval(() => {
        simulateServerSync();
    }, SYNC_INTERVAL);
    
    console.log(`Sync interval started (${SYNC_INTERVAL / 1000} seconds)`);
}

// Stop sync interval (for testing or when app closes)
function stopSyncInterval() {
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
        syncIntervalId = null;
        console.log('Sync interval stopped');
    }
}

// Simulate server sync operation
async function simulateServerSync() {
    try {
        console.log('Starting server sync simulation...');
        
        // Show sync status
        showSyncStatus('Syncing with server...', 'info');
        
        // Fetch quotes from server
        const serverResponse = await fetchQuotesFromServer();
        
        // Process server response
        await processServerResponse(serverResponse);
        
        // Update last sync time
        const now = new Date().toISOString();
        localStorage.setItem(LAST_SYNC_KEY, now);
        
        console.log('Server sync completed successfully');
        
    } catch (error) {
        console.error('Server sync failed:', error);
        showSyncStatus('Sync failed: ' + error.message, 'error');
    }
}

// Process server response
async function processServerResponse(response) {
    if (!response.success) {
        throw new Error('Server response indicated failure');
    }
    
    const serverData = response.quotes || [];
    let conflictsResolved = 0;
    let newQuotesAdded = 0;
    let conflictsFound = [];
    
    // Compare server quotes with local quotes
    serverData.forEach(serverQuote => {
        // Find matching local quote by text and author
        const localIndex = quotes.findIndex(localQuote => 
            localQuote.text === serverQuote.text && 
            localQuote.author === serverQuote.author
        );
        
        if (localIndex === -1) {
            // Quote doesn't exist locally, add it
            quotes.push(serverQuote);
            newQuotesAdded++;
            
            // Add category if new
            if (!categories.includes(serverQuote.category)) {
                categories.push(serverQuote.category);
            }
        } else {
            // Quote exists, check for conflicts
            const localQuote = quotes[localIndex];
            const hasConflict = localQuote.category !== serverQuote.category;
            
            if (hasConflict) {
                conflictsFound.push({
                    local: localQuote,
                    server: serverQuote,
                    index: localIndex
                });
                
                // Apply conflict resolution: server data takes precedence
                quotes[localIndex] = serverQuote;
                conflictsResolved++;
            }
        }
    });
    
    // Save updated data to localStorage
    saveToLocalStorage();
    
    // Update UI
    populateCategories();
    updateCategoryDropdowns();
    updateStatistics();
    
    // Show sync results
    let statusMessage = `Sync completed. Added ${newQuotesAdded} new quotes.`;
    if (conflictsResolved > 0) {
        statusMessage += ` Resolved ${conflictsResolved} conflicts.`;
        showConflictNotification(conflictsFound);
    }
    
    showSyncStatus(statusMessage, 'success');
    
    // Update display if needed
    if (newQuotesAdded > 0 || conflictsResolved > 0) {
        displayRandomQuote();
    }
    
    // Save server quotes backup
    localStorage.setItem(SERVER_QUOTES_KEY, JSON.stringify(serverData));
}

// Show sync status
function showSyncStatus(message, type = 'info') {
    const statusElement = document.getElementById('syncStatus') || createSyncStatusElement();
    
    statusElement.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    statusElement.className = `sync-status sync-${type}`;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            if (statusElement.textContent.includes(message)) {
                statusElement.textContent = '';
                statusElement.className = 'sync-status';
            }
        }, 5000);
    }
}

// Create sync status element if it doesn't exist
function createSyncStatusElement() {
    const statusElement = document.createElement('div');
    statusElement.id = 'syncStatus';
    statusElement.className = 'sync-status';
    
    // Add to page
    const container = document.querySelector('.sync-container') || document.body;
    container.appendChild(statusElement);
    
    return statusElement;
}

// Show conflict notification
function showConflictNotification(conflicts) {
    const notification = document.createElement('div');
    notification.className = 'conflict-notification';
    notification.innerHTML = `
        <div class="conflict-header">
            <h3>Data Conflicts Detected</h3>
            <button class="close-btn">&times;</button>
        </div>
        <div class="conflict-body">
            <p>${conflicts.length} conflict(s) were found and automatically resolved.</p>
            <div class="conflict-list">
                ${conflicts.map((conflict, index) => `
                    <div class="conflict-item">
                        <p><strong>Quote:</strong> "${conflict.local.text}"</p>
                        <p><strong>Local Category:</strong> ${conflict.local.category}</p>
                        <p><strong>Server Category:</strong> ${conflict.server.category}</p>
                        <p><em>Using server category (${conflict.server.category})</em></p>
                    </div>
                `).join('')}
            </div>
            <div class="conflict-actions">
                <button class="btn" onclick="showConflictResolver(${JSON.stringify(conflicts)})">
                    Review Conflicts
                </button>
                <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
                    Dismiss
                </button>
            </div>
        </div>
    `;
    
    // Add close button functionality
    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.remove();
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 10000);
}

// Manual conflict resolver
function showConflictResolver(conflicts) {
    const resolver = document.createElement('div');
    resolver.className = 'conflict-resolver-modal';
    resolver.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Resolve Data Conflicts</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <p>Review and resolve conflicts between local and server data:</p>
                <div class="conflict-resolver-list">
                    ${conflicts.map((conflict, index) => `
                        <div class="conflict-resolver-item" data-index="${index}">
                            <h4>Conflict ${index + 1}</h4>
                            <p><strong>Quote:</strong> "${conflict.local.text}"</p>
                            <p><strong>Author:</strong> ${conflict.local.author}</p>
                            <div class="conflict-option">
                                <input type="radio" name="conflict-${index}" value="local" id="local-${index}">
                                <label for="local-${index}">
                                    <strong>Local Version:</strong> Category - ${conflict.local.category}
                                </label>
                            </div>
                            <div class="conflict-option">
                                <input type="radio" name="conflict-${index}" value="server" id="server-${index}" checked>
                                <label for="server-${index}">
                                    <strong>Server Version:</strong> Category - ${conflict.server.category}
                                </label>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="applyConflictResolution()">Apply Resolution</button>
                <button class="btn btn-secondary" onclick="document.querySelector('.conflict-resolver-modal').remove()">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    // Add close button functionality
    resolver.querySelector('.close-btn').addEventListener('click', () => {
        resolver.remove();
    });
    
    // Add to page
    document.body.appendChild(resolver);
}

// Apply manual conflict resolution
function applyConflictResolution() {
    const resolverItems = document.querySelectorAll('.conflict-resolver-item');
    let changesMade = false;
    
    resolverItems.forEach(item => {
        const index = parseInt(item.dataset.index);
        const localChoice = item.querySelector('input[value="local"]').checked;
        
        if (localChoice) {
            // User chose to keep local version
            // Note: In this simulation, we don't update the server
            // In a real app, you would send the local version back to the server
            console.log(`User chose to keep local version for conflict ${index}`);
            changesMade = true;
        }
    });
    
    if (changesMade) {
        showSyncStatus('Conflict resolution applied. Local changes saved.', 'success');
    }
    
    // Remove the resolver
    document.querySelector('.conflict-resolver-modal').remove();
}

// Manually trigger sync
function manualSync() {
    showSyncStatus('Manual sync initiated...', 'info');
    simulateServerSync();
}

// ==============================
// JSON IMPORT/EXPORT FUNCTIONS
// ==============================

// Export quotes to JSON file
function exportToJsonFile() {
    if (quotes.length === 0) {
        showDataMessage("No quotes to export. Add some quotes first!", "error");
        return;
    }
    
    try {
        // Create the data object to export
        const exportData = {
            quotes: quotes,
            categories: categories,
            exportDate: new Date().toISOString(),
            totalQuotes: quotes.length,
            totalCategories: categories.length,
            lastSync: localStorage.getItem(LAST_SYNC_KEY) || 'Never'
        };
        
        // Convert to JSON string with proper formatting
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Create a Blob with the JSON data
        const blob = new Blob([jsonString], { type: 'application/json' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quotes_${new Date().toISOString().split('T')[0]}.json`;
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showDataMessage(`Exported ${quotes.length} quotes to JSON file successfully!`, "success");
        console.log('Exported data:', exportData);
        
    } catch (error) {
        console.error('Error exporting quotes:', error);
        showDataMessage('Error exporting quotes. Please try again.', "error");
    }
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        showDataMessage('Please select a valid JSON file.', 'error');
        // Reset the file input
        event.target.value = '';
        return;
    }
    
    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            let importedQuotes = [];
            
            // Handle different JSON formats
            if (Array.isArray(importedData)) {
                // If the file is a simple array of quotes
                importedQuotes = importedData;
            } else if (importedData.quotes && Array.isArray(importedData.quotes)) {
                // If the file has the expected structure
                importedQuotes = importedData.quotes;
                
                // Also import categories if available
                if (importedData.categories && Array.isArray(importedData.categories)) {
                    importedData.categories.forEach(category => {
                        if (!categories.includes(category)) {
                            categories.push(category);
                        }
                    });
                }
            } else {
                throw new Error('Invalid JSON format');
            }
            
            // Validate each quote
            const validQuotes = importedQuotes.filter(quote => 
                quote && 
                typeof quote === 'object' && 
                quote.text && 
                typeof quote.text === 'string' &&
                quote.category && 
                typeof quote.category === 'string'
            );
            
            if (validQuotes.length === 0) {
                throw new Error('No valid quotes found in the file');
            }
            
            // Add the imported quotes to the existing quotes
            const previousCount = quotes.length;
            quotes.push(...validQuotes);
            
            // Extract and add any new categories
            validQuotes.forEach(quote => {
                if (!categories.includes(quote.category)) {
                    categories.push(quote.category);
                }
            });
            
            // Save to local storage
            saveToLocalStorage();
            
            // Update UI
            populateCategories();
            updateCategoryDropdowns();
            updateStatistics();
            
            // Trigger sync after import
            setTimeout(() => {
                simulateServerSync();
            }, 2000);
            
            // Show success message
            showDataMessage(`Successfully imported ${validQuotes.length} quotes! Total quotes: ${quotes.length}`, "success");
            
            // Reset the file input
            event.target.value = '';
            
            // Show the imported quotes count
            const importedCount = quotes.length - previousCount;
            console.log(`Imported ${importedCount} new quotes`);
            
        } catch (error) {
            console.error('Error importing JSON:', error);
            showDataMessage(`Error importing quotes: ${error.message}`, "error");
            event.target.value = '';
        }
    };
    
    fileReader.onerror = function() {
        showDataMessage('Error reading the file. Please try again.', "error");
        event.target.value = '';
    };
    
    fileReader.readAsText(file);
}

// Clear all quotes
function clearAllQuotes() {
    if (quotes.length === 0) {
        showDataMessage("No quotes to clear.", "error");
        return;
    }
    
    if (!confirm(`Are you sure you want to delete ALL ${quotes.length} quotes? This action cannot be undone.`)) {
        return;
    }
    
    // Keep only the default quotes
    quotes = getDefaultQuotes();
    categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Save to local storage
    saveToLocalStorage();
    
    // Reset current filter
    currentFilter = "all";
    sessionData.currentFilter = "all";
    saveSessionToStorage();
    
    // Update UI
    populateCategories();
    updateCategoryDropdowns();
    updateStatistics();
    displayRandomQuote();
    
    showDataMessage("All quotes cleared. Default quotes restored.", "success");
}

// Load sample quotes
function loadSampleQuotes() {
    const sampleQuotes = getDefaultQuotes();
    const previousCount = quotes.length;
    
    // Add sample quotes (avoiding duplicates)
    sampleQuotes.forEach(sampleQuote => {
        const isDuplicate = quotes.some(existingQuote => 
            existingQuote.text === sampleQuote.text && 
            existingQuote.author === sampleQuote.author
        );
        
        if (!isDuplicate) {
            quotes.push(sampleQuote);
            
            // Add category if new
            if (!categories.includes(sampleQuote.category)) {
                categories.push(sampleQuote.category);
            }
        }
    });
    
    const addedCount = quotes.length - previousCount;
    
    if (addedCount === 0) {
        showDataMessage("All sample quotes are already in your collection.", "info");
        return;
    }
    
    // Save to local storage
    saveToLocalStorage();
    
    // Update UI
    populateCategories();
    updateCategoryDropdowns();
    updateStatistics();
    
    showDataMessage(`Added ${addedCount} sample quotes to your collection!`, "success");
}

// ==============================
// DYNAMIC CATEGORY FILTERING SYSTEM
// ==============================

// Populate categories dynamically in the filter dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (!categoryFilter) {
        console.error('categoryFilter element not found');
        return;
    }
    
    // Clear existing options except "All Categories"
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Sort categories alphabetically
    const sortedCategories = [...categories].sort();
    
    // Add category options
    sortedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore last selected filter from storage
    const savedFilter = sessionData.currentFilter || localStorage.getItem('lastCategoryFilter') || 'all';
    
    // Set the saved filter if it exists
    if (savedFilter && Array.from(categoryFilter.options).some(opt => opt.value === savedFilter)) {
        categoryFilter.value = savedFilter;
    } else {
        categoryFilter.value = 'all';
    }
    
    // Apply the filter
    filterQuotes();
}

// Filter quotes based on selected category
function filterQuotes() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    
    // Save the selected filter
    currentFilter = selectedCategory;
    sessionData.currentFilter = selectedCategory;
    saveSessionToStorage();
    
    // Also save to localStorage for persistence across sessions
    localStorage.setItem('lastCategoryFilter', selectedCategory);
    
    // Show a random quote from the filtered category
    displayRandomQuote();
}

// Update the displayRandomQuote function to respect filtering
function displayRandomQuote() {
    const quoteElement = document.getElementById('quoteDisplay') || document.querySelector('.quote-display') || document.getElementById('quoteContainer');
    
    if (!quoteElement) {
        console.error('Quote display element not found');
        return;
    }
    
    if (quotes.length === 0) {
        quoteElement.innerHTML = "No quotes available. Add some quotes first!";
        return;
    }
    
    // Get filtered quotes based on current category filter
    let filteredQuotes = quotes;
    
    if (currentFilter && currentFilter !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
    }
    
    if (filteredQuotes.length === 0) {
        quoteElement.innerHTML = `No quotes found in category "${currentFilter}". Try another category or add quotes to this category.`;
        return;
    }
    
    // Get a random quote from filtered quotes
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Update the DOM elements using innerHTML
    quoteElement.innerHTML = `
        <div class="quote-text">${randomQuote.text}</div>
        <div class="quote-author">${randomQuote.author}</div>
        <div class="quote-category">${randomQuote.category}</div>
    `;
    
    // Update statistics to show filtered count
    updateStatistics();
    
    // Check if this quote is in favorites
    const isFavorite = favorites.some(fav => 
        fav.text === randomQuote.text && 
        fav.author === randomQuote.author
    );
    
    // Update favorite button state
    addToFavoritesBtn.textContent = isFavorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites";
    addToFavoritesBtn.classList.toggle('favorited', isFavorite);
    
    // Store the current quote for reference
    currentQuote = randomQuote;
}

// Update statistics to show filtered count
function updateStatistics() {
    const totalCount = quotes.length;
    const favoritesCount = favorites.length;
    
    // Calculate filtered count
    let filteredCount = totalCount;
    if (currentFilter && currentFilter !== 'all') {
        filteredCount = quotes.filter(quote => quote.category === currentFilter).length;
    }
    
    // Update the statistics display
    statisticsDisplay.textContent = `Total Quotes: ${totalCount} | Favorites: ${favoritesCount} | Showing: ${filteredCount} ${currentFilter !== 'all' ? `(Filtered: ${currentFilter})` : ''}`;
}

// ==============================
// UPDATED ADD QUOTE FUNCTION
// ==============================

// Update the addQuote function to handle new categories
function addQuote() {
    const quoteInput = document.getElementById('newQuoteText');
    const authorInput = document.getElementById('newQuoteAuthor');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    if (!quoteInput || !authorInput || !categoryInput) {
        showDataMessage("Add quote form not properly initialized.", "error");
        return;
    }
    
    const quoteText = quoteInput.value.trim();
    const quoteAuthor = authorInput.value.trim();
    const quoteCategory = categoryInput.value.trim();
    
    // Validation
    if (!quoteText) {
        showDataMessage("Please enter a quote.", "error");
        return;
    }
    
    if (!quoteAuthor) {
        showDataMessage("Please enter an author.", "error");
        return;
    }
    
    if (!quoteCategory) {
        showDataMessage("Please enter a category.", "error");
        return;
    }
    
    // Check for duplicates
    const isDuplicate = quotes.some(quote => 
        quote.text.toLowerCase() === quoteText.toLowerCase() && 
        quote.author.toLowerCase() === quoteAuthor.toLowerCase()
    );
    
    if (isDuplicate) {
        showDataMessage("This quote already exists in your collection.", "error");
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text: quoteText,
        author: quoteAuthor,
        category: quoteCategory
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Add category if it's new
    if (!categories.includes(quoteCategory)) {
        categories.push(quoteCategory);
        
        // Save categories to localStorage
        localStorage.setItem('quoteCategories', JSON.stringify(categories));
        
        // Update category filters and dropdowns
        populateCategories();
        updateCategoryDropdowns();
    }
    
    // Save to local storage
    saveToLocalStorage();
    
    // Update statistics
    updateStatistics();
    
    // Show success message
    showDataMessage(`Quote added successfully to "${quoteCategory}" category!`, "success");
    
    // Clear form inputs
    quoteInput.value = '';
    authorInput.value = '';
    categoryInput.value = '';
    
    // Close the modal or hide the form
    const addQuoteForm = document.getElementById('addQuoteForm');
    if (addQuoteForm) {
        addQuoteForm.style.display = 'none';
    }
    
    // Refresh the quote display
    displayRandomQuote();
}

// ==============================
// EVENT LISTENERS SETUP
// ==============================

// Set up event listeners
function setupEventListeners() {
    // New quote button
    newQuoteBtn.addEventListener('click', displayRandomQuote);
    
    // Add quote form button
    addQuoteFormBtn.addEventListener('click', createAddQuoteForm);
    
    // Delete category button
    deleteCategoryBtn.addEventListener('click', deleteCategoryFunc);
    
    // Add to favorites button
    addToFavoritesBtn.addEventListener('click', addToFavorites);
    
    // Clear favorites button
    clearFavoritesBtn.addEventListener('click', clearFavorites);
    
    // Export quotes button
    exportQuotesBtn.addEventListener('click', exportToJsonFile);
    
    // Import file input
    importFile.addEventListener('change', importFromJsonFile);
    
    // Clear all quotes button
    clearAllQuotesBtn.addEventListener('click', clearAllQuotes);
    
    // Load sample quotes button
    loadSampleQuotesBtn.addEventListener('click', loadSampleQuotes);
    
    // Category filter change event
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterQuotes);
    }
    
    // Manual sync button (if exists)
    const manualSyncBtn = document.getElementById('manualSyncBtn');
    if (manualSyncBtn) {
        manualSyncBtn.addEventListener('click', manualSync);
    }
}

// Initialize server simulation when the app starts
function initServer() {
    initServerSimulation();
}

// Update the init function to include server initialization
function init() {
    // ... existing initialization code ...
    
    // Initialize categories and filtering system
    populateCategories();
    
    // Initialize server simulation and data syncing
    initServer();
    
    // ... rest of existing initialization code ...
}

// Make functions globally available
window.createAddQuoteForm = createAddQuoteForm;
window.addQuote = addQuote;
window.filterQuotes = filterQuotes;
window.populateCategories = populateCategories;
window.displayRandomQuote = displayRandomQuote;
window.manualSync = manualSync;
window.applyConflictResolution = applyConflictResolution;
window.showConflictResolver = showConflictResolver;
window.fetchQuotesFromServer = fetchQuotesFromServer; // Add this line

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);