const budgetRange = document.getElementById("budgetRange");
const budgetValue = document.getElementById("budgetValue");
const themeToggle = document.getElementById("themeToggle");
const selectedItemsList = document.getElementById("selectedItemsList");
const categoryFilter = document.getElementById("categoryFilter");
const voiceBtn = document.getElementById("voiceBtn");

let selectedItems = [];
let bestSelectedItems = [];

// Budget slider
if (budgetRange && budgetValue) {
    budgetRange.addEventListener("input", () => {
        budgetValue.textContent = budgetRange.value;
    });
}

// Theme toggle
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
    });
}

// Add item
function addItem(name, price, value) {
    selectedItems.push({ name, price, value });
    bestSelectedItems = [];

    clearActiveButtons();
    updateSelectedItems();
    hideAllSuggestionResults();

    alert(name + " added!");
}

// Remove item
function removeItem(index) {
    selectedItems.splice(index, 1);
    bestSelectedItems = [];

    clearActiveButtons();
    updateSelectedItems();
    hideAllSuggestionResults();
}

// Show selected items
function updateSelectedItems() {
    if (!selectedItemsList) return;

    if (selectedItems.length === 0) {
        selectedItemsList.innerHTML = "<p>No items selected yet.</p>";
        return;
    }

    let html = "<ul style='list-style:none; padding:0;'>";

    selectedItems.forEach((item, index) => {
        html += `
            <li style="margin-bottom:10px; background:rgba(255,255,255,0.08); padding:10px; border-radius:8px;">
                <strong>${index + 1}. ${item.name}</strong><br>
                Price: ₹${item.price} | Value: ${item.value}<br>
                <button onclick="removeItem(${index})" style="margin-top:8px; background:red; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">
                    ❌ Remove
                </button>
            </li>
        `;
    });

    html += "</ul>";
    selectedItemsList.innerHTML = html;
}

// 0/1 Knapsack Algorithm
function findBestItems() {
    let budget = parseInt(budgetRange.value);
    let n = selectedItems.length;

    if (n === 0) {
        alert("No items selected!");
        return;
    }

    let dp = Array(n + 1)
        .fill(null)
        .map(() => Array(budget + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        let price = selectedItems[i - 1].price;
        let value = selectedItems[i - 1].value;

        for (let w = 0; w <= budget; w++) {
            if (price <= w) {
                dp[i][w] = Math.max(
                    value + dp[i - 1][w - price],
                    dp[i - 1][w]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    let w = budget;
    let bestItems = [];

    for (let i = n; i > 0; i--) {
        if (dp[i][w] !== dp[i - 1][w]) {
            bestItems.push(selectedItems[i - 1]);
            w -= selectedItems[i - 1].price;
        }
    }

    bestItems.reverse();
    bestSelectedItems = [...bestItems];

    clearActiveButtons();
    hideAllSuggestionResults();
    displayBestItems(bestItems, dp[n][budget]);
}

// Display best items
function displayBestItems(items, totalValue) {
    if (items.length === 0) {
        selectedItemsList.innerHTML = "<p>No optimal selection found.</p>";
        return;
    }

    let totalPrice = 0;
    let html = "<h3>Best Selection:</h3><ul style='list-style:none; padding:0;'>";

    items.forEach((item, index) => {
        totalPrice += item.price;

        html += `
            <li class="best-pick-item">
                <strong>${index + 1}. ${item.name}</strong><br>
                Price: ₹${item.price} | Value: ${item.value}
            </li>
        `;
    });

    html += "</ul>";
    html += `<p style="margin-top:15px;"><strong>Total Price:</strong> ₹${totalPrice}</p>`;
    html += `<p style="margin-top:10px;"><strong>Total Value:</strong> ${totalValue}</p>`;
    html += `<p style="margin-top:10px; margin-bottom:5px; color:lightgreen;"><strong>AI Suggestion:</strong> This is the best combination under your budget.</p>`;

    selectedItemsList.innerHTML = html;
}

// Category filter
if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts);
}

function filterProducts() {
    let selectedCategory = categoryFilter.value;
    let products = document.querySelectorAll(".product-card");

    products.forEach(product => {
        let categoryText = product.querySelector("p").innerText;

        if (selectedCategory === "all" || categoryText.includes(selectedCategory)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}

// Voice feature
if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

        recognition.lang = "hi-IN";
        recognition.start();

        recognition.onresult = function (event) {
            let speech = event.results[0][0].transcript.toLowerCase().trim();
            alert("You said: " + speech);

            let value = null;

            speech = speech
                .replace(/०/g, "0")
                .replace(/१/g, "1")
                .replace(/२/g, "2")
                .replace(/३/g, "3")
                .replace(/४/g, "4")
                .replace(/५/g, "5")
                .replace(/६/g, "6")
                .replace(/७/g, "7")
                .replace(/८/g, "8")
                .replace(/९/g, "9")
                .replace(/,/g, "");

            let number = speech.match(/\d+/);
            if (number) {
                value = parseInt(number[0]);
            }

            if (speech.includes("ek hazaar")) value = 1000;
            else if (speech.includes("do hazaar")) value = 2000;
            else if (speech.includes("teen hazaar") || speech.includes("tin hazaar")) value = 3000;
            else if (speech.includes("char hazaar")) value = 4000;
            else if (speech.includes("paanch hazaar")) value = 5000;
            else if (speech.includes("chhe hazaar")) value = 6000;
            else if (speech.includes("saat hazaar")) value = 7000;
            else if (speech.includes("aath hazaar")) value = 8000;
            else if (speech.includes("nau hazaar")) value = 9000;
            else if (speech.includes("das hazaar")) value = 10000;
            else if (speech.includes("gyarah hazaar")) value = 11000;
            else if (speech.includes("barah hazaar")) value = 12000;
            else if (speech.includes("pandrah hazaar")) value = 15000;
            else if (speech.includes("bees hazaar")) value = 20000;

            if (value !== null) {
                let minBudget = Number(budgetRange.min);
                let maxBudget = Number(budgetRange.max);

                if (value < minBudget) value = minBudget;
                if (value > maxBudget) value = maxBudget;

                budgetRange.value = value;
                budgetValue.textContent = value;
            } else {
                alert("I didn’t get the budget. Please explain again.");
            }
        };

        recognition.onerror = function () {
            alert("Voice not recognized, try again!");
        };
    });
}

// Product Graph
const productGraph = {
    "Running Shoes": ["Smart Watch", "Sunglasses"],
    "Smart Watch": ["Running Shoes", "Headphones", "Laptop Bag"],
    "Headphones": ["Smart Watch", "Backpack", "Water Bottle"],
    "Backpack": ["Headphones", "Novel Book", "T-Shirt"],
    "Novel Book": ["Backpack", "Bluetooth Speaker", "Power Bank"],
    "Bluetooth Speaker": ["Novel Book", "Keyboard"],
    "Sunglasses": ["Running Shoes", "Laptop Bag", "Mouse"],
    "Laptop Bag": ["Sunglasses", "Water Bottle", "Smart Watch", "Notebook Set"],
    "Water Bottle": ["Laptop Bag", "T-Shirt", "Headphones", "Casual Jacket"],
    "T-Shirt": ["Water Bottle", "Power Bank", "Backpack", "Wireless Earbuds"],
    "Power Bank": ["T-Shirt", "Keyboard", "Novel Book", "Hoodie"],
    "Keyboard": ["Power Bank", "Bluetooth Speaker", "Story Book"],

    "Mouse": ["Sunglasses", "Notebook Set", "Tablet Stand"],
    "Notebook Set": ["Mouse", "Casual Jacket", "Laptop Bag", "Fitness Band"],
    "Casual Jacket": ["Notebook Set", "Wireless Earbuds", "Water Bottle", "Rich Dad Poor Dad"],
    "Wireless Earbuds": ["Casual Jacket", "Hoodie", "T-Shirt", "Atomic Habits"],
    "Hoodie": ["Wireless Earbuds", "Story Book", "Power Bank", "Think and Grow Rich"],
    "Story Book": ["Hoodie", "Keyboard", "The Alchemist"],

    "Tablet Stand": ["Mouse", "Fitness Band"],
    "Fitness Band": ["Tablet Stand", "Rich Dad Poor Dad", "Notebook Set"],
    "Rich Dad Poor Dad": ["Fitness Band", "Atomic Habits", "Casual Jacket"],
    "Atomic Habits": ["Rich Dad Poor Dad", "Think and Grow Rich", "Wireless Earbuds"],
    "Think and Grow Rich": ["Atomic Habits", "The Alchemist", "Hoodie"],
    "The Alchemist": ["Think and Grow Rich", "Story Book"]
};

// Helper: product details from card
function getProductDetails(productName) {
    const cards = document.querySelectorAll(".product-card");

    for (let card of cards) {
        let name = card.querySelector("h3").innerText.trim();

        if (name === productName) {
            let pTags = card.querySelectorAll("p");

            let category = pTags[0].innerText.replace("Category: ", "").trim();
            let price = parseInt(pTags[1].innerText.replace("Price: ₹", "").trim());
            let value = parseInt(pTags[2].innerText.replace("Value: ", "").trim());

            return { name, category, price, value };
        }
    }

    return null;
}

function getSourceItems() {
    return bestSelectedItems.length > 0 ? bestSelectedItems : [];
}

//BFS 
function showBFS(btn) {
    setActiveButton(btn);

    const bfsResult = document.getElementById("bfsResult");
    if (!bfsResult) return;

    hideAllSuggestionResults();
    bfsResult.style.display = "block";

    const sourceItems = getSourceItems();

    if (sourceItems.length === 0) {
        bfsResult.innerHTML = "<p>First click Find Best Items</p>";
        return;
    }

    let html = `<h3></h3>`;

    sourceItems.forEach(sourceItem => {
        let suggestions = productGraph[sourceItem.name] || [];

        suggestions = suggestions.filter(name => !sourceItems.some(item => item.name === name));
        suggestions = suggestions.slice(0, 4);

        html += `
            <div style="margin-bottom:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:10px;">
                <h4 style="margin-bottom:8px;">For ${sourceItem.name}</h4>
        `;

        if (suggestions.length === 0) {
            html += `<p>No nearby suggestions found.</p>`;
        } else {
            html += `
                <ul style="list-style:none; padding:0; margin:0;">
                    ${suggestions.map(item => `<li style="margin-bottom:6px;">${item}</li>`).join("")}
                </ul>
            `;
        }

        html += `</div>`;
    });

    bfsResult.innerHTML = html;
}
// DFS (category-based)
function showDFS(btn) {
    setActiveButton(btn);

    const dfsResult = document.getElementById("dfsResult");
    if (!dfsResult) return;

    hideAllSuggestionResults();
    dfsResult.style.display = "block";

    const sourceItems = getSourceItems();

    if (sourceItems.length === 0) {
        dfsResult.innerHTML = "<p>First click Find Best Items</p>";
        return;
    }

    let html = `<h3>Smart Discovery</h3>`;

    sourceItems.forEach(sourceItem => {
        const current = getProductDetails(sourceItem.name);
        if (!current) return;

        const currentCategory = current.category;
        let suggestions = [];

        const cards = document.querySelectorAll(".product-card");
        cards.forEach(card => {
            const name = card.querySelector("h3").innerText.trim();
            const details = getProductDetails(name);

            if (
                details &&
                details.category === currentCategory &&
                details.name !== sourceItem.name
            ) {
                suggestions.push(details);
            }
        });

        // sirf 4 suggestions
        suggestions = suggestions.slice(0, 4);

        html += `
            <div style="margin-bottom:15px; background:rgba(255,255,255,0.05); padding:10px; border-radius:10px;">
                <h4 style="margin-bottom:8px;">For ${sourceItem.name}</h4>
        `;

        if (suggestions.length === 0) {
            html += `<p>No smart discovery found.</p>`;
        } else {
            html += suggestions.map(item => `
                <div class="result-card" style="margin-bottom:10px; background:rgba(255,255,255,0.08); padding:10px; border-radius:8px;">
                    <strong>${item.name}</strong><br>
                    Category: ${item.category}<br>
                    Price: ₹${item.price} | Value: ${item.value}
                </div>
            `).join("");
        }

        html += `</div>`;
    });

    dfsResult.innerHTML = html;
}
// Analysis
function showAnalysis(btn) {
    setActiveButton(btn);

    const analysisResult = document.getElementById("analysisResult");
    if (!analysisResult) return;

    hideAllSuggestionResults();
    analysisResult.style.display = "block";

    if (bestSelectedItems.length === 0) {
        analysisResult.innerHTML = "<p>First click Find Best Items</p>";
        return;
    }

    let budget = parseInt(budgetRange.value);
    let totalPrice = bestSelectedItems.reduce((sum, item) => sum + item.price, 0);
    let totalValue = bestSelectedItems.reduce((sum, item) => sum + item.value, 0);

    let mostExpensive = bestSelectedItems.reduce((max, item) =>
        item.price > max.price ? item : max
    );

    let html = `<h3>Selection Bill & Analysis</h3>`;
    html += `<ul style="list-style:none; padding:0;">`;

    bestSelectedItems.forEach((item, index) => {
        html += `
            <li style="margin-bottom:10px; background:rgba(255,255,255,0.08); padding:10px; border-radius:8px;">
                <strong>${index + 1}. ${item.name}</strong><br>
                Price: ₹${item.price} | Value: ${item.value}
            </li>
        `;
    });

    html += `</ul>`;
    html += `<p><strong>Total Price:</strong> ₹${totalPrice}</p>`;
    html += `<p><strong>Total Value:</strong> ${totalValue}</p>`;
    html += `<p><strong>Most Expensive Product:</strong> ${mostExpensive.name}</p>`;
    html += `<p><strong>Status:</strong> ${totalPrice <= budget ? "Within Budget" : "Over Budget"}</p>`;

    analysisResult.innerHTML = html;
}

// Hide all result boxes
function hideAllSuggestionResults() {
    const bfsResult = document.getElementById("bfsResult");
    const dfsResult = document.getElementById("dfsResult");
    const analysisResult = document.getElementById("analysisResult");

    if (bfsResult) bfsResult.style.display = "none";
    if (dfsResult) dfsResult.style.display = "none";
    if (analysisResult) analysisResult.style.display = "none";
}

// Active button functions
function setActiveButton(clickedBtn) {
    const allButtons = document.querySelectorAll(".suggestion-btn");
    allButtons.forEach(btn => btn.classList.remove("active"));
    clickedBtn.classList.add("active");
}

function clearActiveButtons() {
    const allButtons = document.querySelectorAll(".suggestion-btn");
    allButtons.forEach(btn => btn.classList.remove("active"));
}

// Initial hide
hideAllSuggestionResults();