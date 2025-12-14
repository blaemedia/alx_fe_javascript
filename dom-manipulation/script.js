// Quote data structure - loaded from local storage
let quotes = [];
let categories = [];
let favorites = [];

// Session data
let sessionData = {
    quotesViewed: 0,
    lastViewedQuote: null,
    sessionStartTime: null,
    currentFilter: "All"
};

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteFormBtn = document.getElementById('addQuoteFormBtn');
const addQuoteFormContainer = document.getElementById('addQuoteFormContainer');
const deleteCategory = document.getElementById('deleteCategory');
const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
const addToFavoritesBtn = document.getElementById('addToFavorites');
const clearFavoritesBtn = document.getElementById('clearFavorites');
const favoritesList = document.getElementById('favoritesList');
const totalQuotesEl = document.getElementById('totalQuotes');
const totalCategoriesEl = document.getElementById('totalCategories');
const quotesShownEl = document.getElementById('quotesShown');
const sessionQuotesEl = document.getElementById('sessionQuotes');
const lastViewedQuoteEl = document.getElementById('lastViewedQuote');
const sessionStartTimeEl = document.getElementById('sessionStartTime');
const exportQuotesBtn = document.getElementById('exportQuotesBtn');
const importFile = document.getElementById('importFile');
const clearAllQuotesBtn = document.getElementById('clearAllQuotesBtn');
const loadSampleQuotesBtn = document.getElementById('loadSampleQuotesBtn');
const dataMessage = document.getElementById('dataMessage');

// Initialize the application
function init() {
    // Load data from local storage
    loadFromLocalStorage();
    
    // Initialize session storage
    initSessionStorage();
    
    // Display first quote
    showRandomQuote();
    
    // Populate category filters
    updateCategoryFilters();
    
    // Populate category dropdowns
    updateCategoryDropdowns();
    
    // Update statistics
    updateStatistics();
    
    // Display favorites
    displayFavorites();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update session info display
    updateSessionInfo();
}

// ==============================
// LOCAL STORAGE FUNCTIONS
// ==============================

// Save quotes and categories to local storage
function saveToLocalStorage() {
    try {
        localStorage.setItem('quoteGenerator_quotes', JSON.stringify(quotes));
        localStorage.setItem('quoteGenerator_categories', JSON.stringify(categories));
        localStorage.setItem('quoteGenerator_favorites', JSON.stringify(favorites));
        console.log('Data saved to local storage');
    } catch (error) {
        console.error('Error saving to local storage:', error);
        showDataMessage('Error saving data to local storage. Quotes may not persist.', 'error');
    }
}

// Load quotes and categories from local storage
function loadFromLocalStorage() {
    try {
        // Load quotes
        const savedQuotes = localStorage.getItem('quoteGenerator_quotes');
        if (savedQuotes && savedQuotes !== 'undefined') {
            quotes = JSON.parse(savedQuotes);
        } else {
            // Load default quotes if none saved
            quotes = getDefaultQuotes();
            saveToLocalStorage();
        }
        
        // Load categories
        const savedCategories = localStorage.getItem('quoteGenerator_categories');
        if (savedCategories && savedCategories !== 'undefined') {
            categories = JSON.parse(savedCategories);
        } else {
            // Extract categories from quotes
            categories = [...new Set(quotes.map(quote => quote.category))];
            saveToLocalStorage();
        }
        
        // Load favorites
        const savedFavorites = localStorage.getItem('quoteGenerator_favorites');
        if (savedFavorites && savedFavorites !== 'undefined') {
            favorites = JSON.parse(savedFavorites);
        }
        
        console.log('Data loaded from local storage');
        showDataMessage('Data loaded from local storage', 'success');
    } catch (error) {
        console.error('Error loading from local storage:', error);
        quotes = getDefaultQuotes();
        categories = [...new Set(quotes.map(quote => quote.category))];
        favorites = [];
        showDataMessage('Error loading saved data. Using default quotes.', 'error');
    }
}

// Get default quotes if no local storage data exists
function getDefaultQuotes() {
    return [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
        { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon", category: "Life" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Inspiration" },
        { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", category: "Wisdom" },
        { text: "Whoever is happy will make others happy too.", author: "Anne Frank", category: "Happiness" },
        { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi", category: "Change" },
        { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa", category: "Love" },
        { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt", category: "Courage" },
        { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", category: "Inspiration" },
        { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", category: "Individuality" }
    ];
}

// ==============================
// SESSION STORAGE FUNCTIONS
// ==============================

// Initialize session storage
function initSessionStorage() {
    try {
        // Load session data from session storage
        const savedSessionData = sessionStorage.getItem('quoteGenerator_session');
        if (savedSessionData && savedSessionData !== 'undefined') {
            sessionData = JSON.parse(savedSessionData);
        } else {
            // Initialize new session
            sessionData = {
                quotesViewed: 0,
                lastViewedQuote: null,
                sessionStartTime: new Date().toISOString(),
                currentFilter: "All"
            };
        }
        
        // Update current filter from session data
        if (sessionData.currentFilter) {
            currentFilter = sessionData.currentFilter;
        }
        
        console.log('Session data loaded');
    } catch (error) {
        console.error('Error loading session data:', error);
        // Initialize fresh session data
        sessionData = {
            quotesViewed: 0,
            lastViewedQuote: null,
            sessionStartTime: new Date().toISOString(),
            currentFilter: "All"
        };
    }
}

// Save session data to session storage
function saveSessionToStorage() {
    try {
        sessionStorage.setItem('quoteGenerator_session', JSON.stringify(sessionData));
    } catch (error) {
        console.error('Error saving session data:', error);
    }
}

// Update session info display
function updateSessionInfo() {
    if (sessionData.lastViewedQuote) {
        const shortQuote = sessionData.lastViewedQuote.text.length > 50 
            ? sessionData.lastViewedQuote.text.substring(0, 50) + '...' 
            : sessionData.lastViewedQuote.text;
        lastViewedQuoteEl.textContent = `Last viewed quote: "${shortQuote}"`;
    }
    
    if (sessionData.sessionStartTime) {
        const startTime = new Date(sessionData.sessionStartTime);
        const formattedTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sessionStartTimeEl.textContent = `Session started: ${formattedTime}`;
    }
    
    sessionQuotesEl.textContent = sessionData.quotesViewed;
}

// ==============================
// CORE APPLICATION FUNCTIONS
// ==============================

// Show a random quote
function showRandomQuote() {
    let filteredQuotes = quotes;
    
    // Apply category filter if not "All"
    if (currentFilter !== "All") {
        filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
    }
    
    // Check if there are quotes to show
    if (filteredQuotes.length === 0) {
        quoteText.textContent = "No quotes available for this category. Add some quotes!";
        quoteAuthor.textContent = "";
        quoteCategory.textContent = "";
        return;
    }
    
    // Get a random quote from filtered quotes
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Update the DOM
    quoteText.textContent = `"${randomQuote.text}"`;
    
    if (randomQuote.author) {
        quoteAuthor.textContent = `— ${randomQuote.author}`;
    } else {
        quoteAuthor.textContent = "";
    }
    
    quoteCategory.textContent = randomQuote.category;
    
    // Update session data
    sessionData.quotesViewed++;
    sessionData.lastViewedQuote = randomQuote;
    saveSessionToStorage();
    
    // Update statistics
    updateStatistics();
    updateSessionInfo();
}

// Update category filters in the UI
function updateCategoryFilters() {
    // Clear existing buttons
    categoryFilter.innerHTML = '';
    
    // Create "All" button
    const allButton = document.createElement('button');
    allButton.textContent = 'All';
    allButton.className = `category-btn ${currentFilter === "All" ? "active" : ""}`;
    allButton.addEventListener('click', () => {
        currentFilter = "All";
        sessionData.currentFilter = "All";
        saveSessionToStorage();
        updateCategoryFilters();
        showRandomQuote();
    });
    categoryFilter.appendChild(allButton);
    
    // Create buttons for each category
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.className = `category-btn ${currentFilter === category ? "active" : ""}`;
        button.addEventListener('click', () => {
            currentFilter = category;
            sessionData.currentFilter = category;
            saveSessionToStorage();
            updateCategoryFilters();
            showRandomQuote();
        });
        categoryFilter.appendChild(button);
    });
}

// Update category dropdowns
function updateCategoryDropdowns() {
    // Clear existing options except the first one
    while (deleteCategory.options.length > 1) {
        deleteCategory.remove(1);
    }
    
    // Add categories to delete dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        deleteCategory.appendChild(option);
    });
}

// Create the add quote form dynamically
function createAddQuoteForm() {
    // Clear the form container
    addQuoteFormContainer.innerHTML = '';
    
    // Create the form element
    const form = document.createElement('form');
    form.id = 'addQuoteForm';
    form.style.marginTop = '20px';
    
    // Create quote text input
    const quoteTextGroup = document.createElement('div');
    quoteTextGroup.className = 'form-group';
    
    const quoteTextLabel = document.createElement('label');
    quoteTextLabel.textContent = 'Quote Text';
    quoteTextLabel.setAttribute('for', 'newQuoteText');
    
    const quoteTextInput = document.createElement('textarea');
    quoteTextInput.id = 'newQuoteText';
    quoteTextInput.placeholder = 'Enter a new quote';
    quoteTextInput.required = true;
    
    quoteTextGroup.appendChild(quoteTextLabel);
    quoteTextGroup.appendChild(quoteTextInput);
    
    // Create author input
    const authorGroup = document.createElement('div');
    authorGroup.className = 'form-group';
    
    const authorLabel = document.createElement('label');
    authorLabel.textContent = 'Author (Optional)';
    authorLabel.setAttribute('for', 'newQuoteAuthor');
    
    const authorInput = document.createElement('input');
    authorInput.id = 'newQuoteAuthor';
    authorInput.type = 'text';
    authorInput.placeholder = 'Enter author name';
    
    authorGroup.appendChild(authorLabel);
    authorGroup.appendChild(authorInput);
    
    // Create category selection
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'form-group';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Category';
    categoryLabel.setAttribute('for', 'newQuoteCategory');
    
    const categorySelect = document.createElement('select');
    categorySelect.id = 'newQuoteCategory';
    
    // Create default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a category';
    categorySelect.appendChild(defaultOption);
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    categoryGroup.appendChild(categoryLabel);
    categoryGroup.appendChild(categorySelect);
    
    // Create new category input
    const newCategoryGroup = document.createElement('div');
    newCategoryGroup.className = 'form-group';
    
    const newCategoryLabel = document.createElement('label');
    newCategoryLabel.textContent = 'Or Add New Category';
    newCategoryLabel.setAttribute('for', 'newCategoryInput');
    
    const newCategoryInput = document.createElement('input');
    newCategoryInput.id = 'newCategoryInput';
    newCategoryInput.type = 'text';
    newCategoryInput.placeholder = 'Enter new category name';
    
    newCategoryGroup.appendChild(newCategoryLabel);
    newCategoryGroup.appendChild(newCategoryInput);
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.textContent = 'Add Quote';
    submitButton.id = 'addQuoteBtn';
    
    // Create message container
    const messageDiv = document.createElement('div');
    messageDiv.id = 'formMessage';
    messageDiv.style.marginTop = '15px';
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.display = 'none';
    
    // Assemble the form
    form.appendChild(quoteTextGroup);
    form.appendChild(authorGroup);
    form.appendChild(categoryGroup);
    form.appendChild(newCategoryGroup);
    form.appendChild(submitButton);
    form.appendChild(messageDiv);
    
    // Add the form to the container
    addQuoteFormContainer.appendChild(form);
    
    // Add event listener to the submit button
    submitButton.addEventListener('click', addQuote);
    
    // Show a success message
    showFormMessage("Add quote form created! Fill in the details to add a new quote.", "success");
}

// Add a new quote
function addQuote() {
    // Get form elements
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteAuthor = document.getElementById('newQuoteAuthor');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const formMessage = document.getElementById('formMessage');
    
    // Get values
    const text = newQuoteText ? newQuoteText.value.trim() : '';
    const author = newQuoteAuthor ? newQuoteAuthor.value.trim() : '';
    let category = newQuoteCategory ? newQuoteCategory.value : '';
    
    // Check if user wants to add a new category
    const newCategory = newCategoryInput ? newCategoryInput.value.trim() : '';
    if (newCategory) {
        category = newCategory;
    }
    
    // Validation
    if (!text) {
        showFormMessage("Please enter a quote text.", "error", formMessage);
        return;
    }
    
    if (!category) {
        showFormMessage("Please select or enter a category.", "error", formMessage);
        return;
    }
    
    // Add new category if it doesn't exist
    if (!categories.includes(category)) {
        categories.push(category);
        updateCategoryFilters();
        updateCategoryDropdowns();
    }
    
    // Create new quote object
    const newQuote = {
        text: text,
        author: author || "Anonymous",
        category: category
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Save to local storage
    saveToLocalStorage();
    
    // Show success message
    showFormMessage("Quote added successfully! Saved to local storage.", "success", formMessage);
    
    // Clear form fields
    if (newQuoteText) newQuoteText.value = "";
    if (newQuoteAuthor) newQuoteAuthor.value = "";
    if (newCategoryInput) newCategoryInput.value = "";
    if (newQuoteCategory) newQuoteCategory.value = "";
    
    // Update statistics
    updateStatistics();
    
    // If current filter matches the new quote's category or is "All", show the new quote
    if (currentFilter === "All" || currentFilter === category) {
        showRandomQuote();
    }
}

// Show form message
function showFormMessage(message, type, formMessageElement = null) {
    let messageDiv = formMessageElement;
    
    if (!messageDiv) {
        messageDiv = document.getElementById('formMessage');
        
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'formMessage';
            messageDiv.style.marginTop = '15px';
            messageDiv.style.padding = '10px';
            messageDiv.style.borderRadius = '5px';
            messageDiv.style.display = 'block';
            
            const form = document.getElementById('addQuoteForm');
            if (form) {
                form.appendChild(messageDiv);
            } else if (addQuoteFormContainer) {
                addQuoteFormContainer.appendChild(messageDiv);
            }
        }
    }
    
    messageDiv.textContent = message;
    messageDiv.style.display = "block";
    messageDiv.style.backgroundColor = type === "error" ? "#ffebee" : "#e8f5e9";
    messageDiv.style.color = type === "error" ? "#c62828" : "#2e7d32";
    messageDiv.style.border = type === "error" ? "1px solid #ffcdd2" : "1px solid #c8e6c9";
    
    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 3000);
}

// Show data message
function showDataMessage(message, type) {
    dataMessage.textContent = message;
    dataMessage.style.display = "block";
    dataMessage.style.backgroundColor = type === "error" ? "#ffebee" : "#e8f5e9";
    dataMessage.style.color = type === "error" ? "#c62828" : "#2e7d32";
    dataMessage.style.border = type === "error" ? "1px solid #ffcdd2" : "1px solid #c8e6c9";
    
    setTimeout(() => {
        dataMessage.style.display = "none";
    }, 4000);
}

// Delete a category
function deleteCategoryFunc() {
    const categoryToDelete = deleteCategory.value;
    
    if (!categoryToDelete) {
        showDataMessage("Please select a category to delete.", "error");
        return;
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the category "${categoryToDelete}"? This will also delete all quotes in this category.`)) {
        return;
    }
    
    // Remove category from categories array
    categories = categories.filter(cat => cat !== categoryToDelete);
    
    // Remove quotes with this category
    quotes = quotes.filter(quote => quote.category !== categoryToDelete);
    
    // Save to local storage
    saveToLocalStorage();
    
    // Update UI
    updateCategoryFilters();
    updateCategoryDropdowns();
    
    // Reset current filter if it was the deleted category
    if (currentFilter === categoryToDelete) {
        currentFilter = "All";
        sessionData.currentFilter = "All";
        saveSessionToStorage();
        updateCategoryFilters();
    }
    
    // Show a random quote
    showRandomQuote();
    
    // Update statistics
    updateStatistics();
    
    // Reset delete dropdown
    deleteCategory.value = "";
    
    showDataMessage(`Category "${categoryToDelete}" deleted successfully.`, "success");
}

// Update statistics
function updateStatistics() {
    totalQuotesEl.textContent = quotes.length;
    totalCategoriesEl.textContent = categories.length;
    quotesShownEl.textContent = sessionData.quotesViewed;
}

// ==============================
// FAVORITES FUNCTIONS
// ==============================

// Add current quote to favorites
function addToFavorites() {
    const currentQuoteText = quoteText.textContent.replace(/"/g, '').trim();
    
    // Check if quote is already in favorites
    if (favorites.some(fav => fav.text === currentQuoteText)) {
        showDataMessage("This quote is already in your favorites!", "error");
        return;
    }
    
    // Get current quote details
    const currentAuthor = quoteAuthor.textContent.replace("— ", "").trim();
    const currentCategory = quoteCategory.textContent;
    
    // Add to favorites
    favorites.push({
        text: currentQuoteText,
        author: currentAuthor || "Anonymous",
        category: currentCategory
    });
    
    // Save to local storage
    saveToLocalStorage();
    
    // Update favorites display
    displayFavorites();
    
    showDataMessage("Quote added to favorites!", "success");
}

// Clear all favorites
function clearFavorites() {
    if (favorites.length === 0) {
        showDataMessage("Your favorites list is already empty.", "error");
        return;
    }
    
    if (confirm("Are you sure you want to clear all favorites?")) {
        favorites = [];
        
        // Save to local storage
        saveToLocalStorage();
        
        // Update favorites display
        displayFavorites();
        
        showDataMessage("All favorites cleared.", "success");
    }
}

// Display favorites
function displayFavorites() {
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">