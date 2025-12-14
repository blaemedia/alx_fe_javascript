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
            totalCategories: categories.length
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
    showRandomQuote();
    
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
    showRandomQuote();
}

// Update the showRandomQuote function to respect filtering
// You'll need to modify the existing showRandomQuote function
// Here's a version that supports filtering:
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteText.textContent = "No quotes available. Add some quotes first!";
        quoteAuthor.textContent = "";
        quoteCategory.textContent = "";
        return;
    }
    
    // Get filtered quotes based on current category filter
    let filteredQuotes = quotes;
    
    if (currentFilter && currentFilter !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
    }
    
    if (filteredQuotes.length === 0) {
        quoteText.textContent = `No quotes found in category "${currentFilter}". Try another category or add quotes to this category.`;
        quoteAuthor.textContent = "";
        quoteCategory.textContent = "";
        return;
    }
    
    // Get a random quote from filtered quotes
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Update the DOM elements
    quoteText.textContent = randomQuote.text;
    quoteAuthor.textContent = randomQuote.author;
    quoteCategory.textContent = randomQuote.category;
    
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
    showRandomQuote();
}

// ==============================
// EVENT LISTENERS SETUP
// ==============================

// Set up event listeners
function setupEventListeners() {
    // New quote button
    newQuoteBtn.addEventListener('click', showRandomQuote);
    
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
}

// Initialize categories when the app starts
function initCategories() {
    // Load categories from localStorage if available
    const savedCategories = localStorage.getItem('quoteCategories');
    if (savedCategories) {
        try {
            const parsedCategories = JSON.parse(savedCategories);
            if (Array.isArray(parsedCategories)) {
                // Merge with existing categories, avoiding duplicates
                parsedCategories.forEach(category => {
                    if (!categories.includes(category)) {
                        categories.push(category);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading categories from localStorage:', error);
        }
    }
    
    // Populate the category filter dropdown
    populateCategories();
}

// Update the init function to include category initialization
function init() {
    // ... existing initialization code ...
    
    // Initialize categories and filtering system
    initCategories();
    
    // ... rest of existing initialization code ...
}

// Make functions globally available
window.createAddQuoteForm = createAddQuoteForm;
window.addQuote = addQuote;
window.filterQuotes = filterQuotes;
window.populateCategories = populateCategories;

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);