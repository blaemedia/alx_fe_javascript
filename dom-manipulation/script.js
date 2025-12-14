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
            updateCategoryFilters();
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
    currentFilter = "All";
    sessionData.currentFilter = "All";
    saveSessionToStorage();
    
    // Update UI
    updateCategoryFilters();
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
    updateCategoryFilters();
    updateCategoryDropdowns();
    updateStatistics();
    
    showDataMessage(`Added ${addedCount} sample quotes to your collection!`, "success");
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
}

window.createAddQuoteForm = createAddQuoteForm;
window.addQuote = addQuote;
// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);