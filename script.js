// ---------- VARIABLES (Array of Objects) ----------
let clothes = [
    { id: 1, name: "White Linen Shirt", category: "Tops", emoji: "👕" },
    { id: 2, name: "High-Waist Trousers", category: "Bottoms", emoji: "👖" },
    { id: 3, name: "Silk Slip Dress", category: "Dresses", emoji: "👗" }
];

let currentFilter = "All"; // keeps track of active filter

// DOM elements
const gridContainer = document.getElementById("gridContainer");
const addBtn = document.getElementById("addBtn");
const itemNameInput = document.getElementById("itemName");
const itemCategorySelect = document.getElementById("itemCategory");
const itemEmojiInput = document.getElementById("itemEmoji");

// ---------- FUNCTION 1: Render wardrobe based on filter ----------
function renderWardrobe() {
    let itemsToRender = clothes;
    
    // CONDITIONAL: filter if not "All"
    if (currentFilter !== "All") {
        itemsToRender = clothes.filter(item => item.category === currentFilter);
    }
    
    // DOM MANIPULATION: rebuild the grid HTML
    if (itemsToRender.length === 0) {
        gridContainer.innerHTML = `<p style="text-align:center; grid-column:1/-1;">Your wardrobe is empty. Add some pieces!</p>`;
        return;
    }
    
    let html = "";
    for (let item of itemsToRender) {
        html += `
            <div class="card" data-id="${item.id}">
                <div class="card-emoji">${item.emoji}</div>
                <div class="card-name">${escapeHtml(item.name)}</div>
                <div class="card-category">${item.category}</div>
                <button class="delete-btn" data-id="${item.id}">🗑 Delete</button>
            </div>
        `;
    }
    gridContainer.innerHTML = html;
    
    // Attach delete event listeners to each delete button
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(btn.dataset.id);
            deleteItem(id);
        });
    });
}

// Helper to prevent XSS (just good practice)
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
}

// ---------- FUNCTION 2: Add new clothing item ----------
function addItem() {
    const name = itemNameInput.value.trim();
    const category = itemCategorySelect.value;
    let emoji = itemEmojiInput.value.trim();
    
    // CONDITIONAL: check if name is empty
    if (name === "") {
        alert("Please enter a clothing name.");
        return;
    }
    
    // Default emoji if empty
    if (emoji === "") {
        if (category === "Tops") emoji = "👕";
        else if (category === "Bottoms") emoji = "👖";
        else emoji = "👗";
    }
    
    const newItem = {
        id: Date.now(), // unique ID
        name: name,
        category: category,
        emoji: emoji
    };
    
    clothes.push(newItem);
    renderWardrobe(); // re-render with current filter
    
    // Clear input fields
    itemNameInput.value = "";
    itemEmojiInput.value = "";
}

// ---------- FUNCTION 3: Delete item by ID ----------
function deleteItem(id) {
    // CONDITIONAL (implicit: filter creates new array)
    clothes = clothes.filter(item => item.id !== id);
    renderWardrobe();
}

// ---------- FUNCTION 4: Change filter category ----------
function setFilter(category) {
    currentFilter = category;
    renderWardrobe();
    
    // Update active style on filter buttons
    document.querySelectorAll(".filter-btn").forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// ---------- EVENT LISTENERS ----------
addBtn.addEventListener("click", addItem);

// Filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const category = btn.dataset.category;
        setFilter(category);
    });
});

// Optional: press Enter in name input to add item
itemNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addItem();
});

// ---------- INITIAL RENDER ----------
renderWardrobe();