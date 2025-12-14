// Quote data structure
let quotes = [
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

// Categories array
let categories = ["Motivation", "Life", "Inspiration", "Wisdom", "Happiness", "Change", "Love", "Courage", "Individuality"];

// Favorites array
let favorites = [];

// Statistics
let stats = {
    totalQuotes: 0,
    totalCategories: 0,
    quotesShown: 0
};

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteAuthor = document.getElementById('newQuoteAuthor');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const newCategoryInput = document.getElementById('newCategoryInput');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const formMessage = document.getElementById('formMessage');
const deleteCategory = document.getElementById('deleteCategory');
const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');
const addToFavoritesBtn = document.getElementById('addToFavorites');
const clearFavoritesBtn = document.getElementById('clearFavorites');
const favoritesList = document.getElementById('favoritesList');
const totalQuotesEl = document.getElementById('totalQuotes');
const totalCategoriesEl = document.getElementById('totalCategories');
const quotesShownEl = document.getElementById('quotesShown');

// Current filter
let currentFilter = "All";

// Initialize the application
function init() {
    // Display first quote
    showRandomQuote();
    
    // Populate category filters
    updateCategoryFilters();
    
    // Populate category dropdowns
    updateCategoryDropdowns();
    
    // Update statistics
    updateStatistics();
    
    // Load favorites from localStorage if available
    loadFavorites();
    
    // Display favorites
    displayFavorites();
    
    // Set up event listeners
    setupEventListeners();
}

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
    
    // Update statistics
    stats.quotesShown++;
    updateStatistics();
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
            updateCategoryFilters();
            showRandomQuote();
        });
        categoryFilter.appendChild(button);
    });
}

// Update category dropdowns
function updateCategoryDropdowns() {
    // Clear existing options except the first one
    while (newQuoteCategory.options.length > 1) {
        newQuoteCategory.remove(1);
    }
    
    while (deleteCategory.options.length > 1) {
        deleteCategory.remove(1);
    }
    
    // Add categories to dropdowns
    categories.forEach(category => {
        // Add to new quote category dropdown
        const option1 = document.createElement('option');
        option1.value = category;
        option1.textContent = category;
        newQuoteCategory.appendChild(option1);
        
        // Add to delete category dropdown
        const option2 = document.createElement('option');
        option2.value = category;
        option2.textContent = category;
        deleteCategory.appendChild(option2);
    });
}

// Add a new quote
function addQuote() {
    const text = newQuoteText.value.trim();
    const author = newQuoteAuthor.value.trim();
    let category = newQuoteCategory.value;
    
    // Check if user wants to add a new category
    const newCategory = newCategoryInput.value.trim();
    if (newCategory) {
        category = newCategory;
    }
    
    // Validation
    if (!text) {
        showFormMessage("Please enter a quote text.", "error");
        return;
    }
    
    if (!category) {
        showFormMessage("Please select or enter a category.", "error");
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
    
    // Show success message
    showFormMessage("Quote added successfully!", "success");
    
    // Clear form fields
    newQuoteText.value = "";
    newQuoteAuthor.value = "";
    newCategoryInput.value = "";
    newQuoteCategory.value = "";
    
    // Update statistics
    updateStatistics();
    
    // If current filter matches the new quote's category or is "All", show the new quote
    if (currentFilter === "All" || currentFilter === category) {
        showRandomQuote();
    }
}

// Show form message
function showFormMessage(message, type) {
    formMessage.textContent = message;
    formMessage.style.display = "block";
    formMessage.style.backgroundColor = type === "error" ? "#ffebee" : "#e8f5e9";
    formMessage.style.color = type === "error" ? "#c62828" : "#2e7d32";
    formMessage.style.border = type === "error" ? "1px solid #ffcdd2" : "1px solid #c8e6c9";
    
    // Hide message after 3 seconds
    setTimeout(() => {
        formMessage.style.display = "none";
    }, 3000);
}

// Delete a category
function deleteCategoryFunc() {
    const categoryToDelete = deleteCategory.value;
    
    if (!categoryToDelete) {
        showFormMessage("Please select a category to delete.", "error");
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
    
    // Update UI
    updateCategoryFilters();
    updateCategoryDropdowns();
    
    // Reset current filter if it was the deleted category
    if (currentFilter === categoryToDelete) {
        currentFilter = "All";
        updateCategoryFilters();
    }
    
    // Show a random quote
    showRandomQuote();
    
    // Update statistics
    updateStatistics();
    
    // Reset delete dropdown
    deleteCategory.value = "";
    
    showFormMessage(`Category "${categoryToDelete}" deleted successfully.`, "success");
}

// Update statistics
function updateStatistics() {
    stats.totalQuotes = quotes.length;
    stats.totalCategories = categories.length;
    
    totalQuotesEl.textContent = stats.totalQuotes;
    totalCategoriesEl.textContent = stats.totalCategories;
    quotesShownEl.textContent = stats.quotesShown;
}

// Add current quote to favorites
function addToFavorites() {
    const currentQuoteText = quoteText.textContent.replace(/"/g, '').trim();
    
    // Check if quote is already in favorites
    if (favorites.some(fav => fav.text === currentQuoteText)) {
        showFormMessage("This quote is already in your favorites!", "error");
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
    
    // Save to localStorage
    saveFavorites();
    
    // Update favorites display
    displayFavorites();
    
    showFormMessage("Quote added to favorites!", "success");
}

// Clear all favorites
function clearFavorites() {
    if (favorites.length === 0) {
        showFormMessage("Your favorites list is already empty.", "error");
        return;
    }
    
    if (confirm("Are you sure you want to clear all favorites?")) {
        favorites = [];
        
        // Clear from localStorage
        localStorage.removeItem('quoteFavorites');
        
        // Update favorites display
        displayFavorites();
        
        showFormMessage("All favorites cleared.", "success");
    }
}

// Display favorites
function displayFavorites() {
    favoritesList.innerHTML = '';
    
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">No favorite quotes yet. Add some!</p>';
        return;
    }
    
    favorites.forEach((quote, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.style.padding = "15px";
        favoriteItem.style.marginBottom = "10px";
        favoriteItem.style.backgroundColor = "#f9f9ff";
        favoriteItem.style.borderRadius = "8px";
        favoriteItem.style.borderLeft = "3px solid #ff9f43";
        
        favoriteItem.innerHTML = `
            <p style="font-style: italic;">"${quote.text}"</p>
            <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                <span style="color: #7f8c8d;">${quote.author}</span>
                <span style="background-color: #e1e8ff; color: #2575fc; padding: 3px 10px; border-radius: 15px; font-size: 0.8rem;">${quote.category}</span>
            </div>
        `;
        
        favoritesList.appendChild(favoriteItem);
    });
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('quoteFavorites', JSON.stringify(favorites));
}

// Load favorites from localStorage
function loadFavorites() {
    const savedFavorites = localStorage.getItem('quoteFavorites');
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }
}

// Set up event listeners
function setupEventListeners() {
    // New quote button
    newQuoteBtn.addEventListener('click', showRandomQuote);
    
    // Add quote button
    addQuoteBtn.addEventListener('click', addQuote);
    
    // Delete category button
    deleteCategoryBtn.addEventListener('click', deleteCategoryFunc);
    
    // Add to favorites button
    addToFavoritesBtn.addEventListener('click', addToFavorites);
    
    // Clear favorites button
    clearFavoritesBtn.addEventListener('click', clearFavorites);
    
    // Allow pressing Enter in the new category field to add a quote
    newCategoryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addQuote();
        }
    });
    
    // Allow pressing Enter in the quote text field to add a quote
    newQuoteText.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            addQuote();
        }
    });
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);