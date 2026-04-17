// Couturiere – Wardrobe System (Items + Outfits)
// No migration notice, simply overwrite old localStorage

// ---------- AUTH ----------
const VALID_EMAIL = "admin@example.com";
const VALID_PASSWORD = "pass123!";

function checkAuth() {
    const loggedIn = sessionStorage.getItem("couturiere_logged_in");
    if (loggedIn === "true") {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("app").style.display = "block";
        initApp();
    } else {
        document.getElementById("login-container").style.display = "flex";
        document.getElementById("app").style.display = "none";
        attachLoginEvent();
    }
}

function attachLoginEvent() {
    const loginBtn = document.getElementById("login-btn");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const errorDiv = document.getElementById("login-error");
    const doLogin = () => {
        if (emailInput.value.trim() === VALID_EMAIL && passwordInput.value === VALID_PASSWORD) {
            sessionStorage.setItem("couturiere_logged_in", "true");
            document.getElementById("login-container").style.display = "none";
            document.getElementById("app").style.display = "block";
            initApp();
        } else {
            errorDiv.textContent = "Invalid credentials. Use admin@example.com / pass123!";
        }
    };
    loginBtn.addEventListener("click", doLogin);
    emailInput.addEventListener("keypress", (e) => e.key === "Enter" && doLogin());
    passwordInput.addEventListener("keypress", (e) => e.key === "Enter" && doLogin());
}

// ---------- DATA MODELS ----------
let items = [];      // array of Item objects
let outfits = [];    // array of Outfit objects

// Demo data (fresh start, no notice)
function loadDemoData() {
    items = [
        { id: 1001, name: "White Cotton Tee", type: "wear", category: "upperwear", season: "any", formality: "casual", color: "white", material: "cotton" },
        { id: 1002, name: "Black Denim Jeans", type: "wear", category: "lowerwear", season: "any", formality: "casual", color: "black", material: "denim" },
        { id: 1003, name: "Leather Chelsea Boots", type: "wear", category: "footwear", season: "fall", formality: "smart", color: "brown", material: "leather" },
        { id: 1004, name: "Wool Beanie", type: "accessory", category: "headwear", season: "winter", formality: "casual", color: "gray", material: "wool" },
        { id: 1005, name: "Minimalist Watch", type: "accessory", category: "jewelry", season: "any", formality: "smart", color: "silver", material: "metal" }
    ];
    outfits = [
        { id: 2001, name: "Casual Day Out", items: [1001, 1002, 1003], favorite: false, createdAt: Date.now() },
        { id: 2002, name: "Winter Chill", items: [1001, 1002, 1004], favorite: true, createdAt: Date.now() }
    ];
    saveItems();
    saveOutfits();
}

function saveItems() { localStorage.setItem("couturiere_items", JSON.stringify(items)); }
function saveOutfits() { localStorage.setItem("couturiere_outfits", JSON.stringify(outfits)); }
function loadItems() {
    const stored = localStorage.getItem("couturiere_items");
    if (stored) items = JSON.parse(stored);
    else loadDemoData();
}
function loadOutfits() {
    const stored = localStorage.getItem("couturiere_outfits");
    if (stored) outfits = JSON.parse(stored);
    else loadDemoData();
}

// Helper: get item by id
function getItemById(id) { return items.find(i => i.id === id); }

// ---------- RENDER ITEMS PAGE ----------
function renderItemsList() {
    const container = document.getElementById("items-list");
    if (!container) return;
    if (items.length === 0) {
        container.innerHTML = `<div class="placeholder-text"><span class="material-icons">checkroom</span><span>No items yet. Add one above.</span></div>`;
        return;
    }
    container.innerHTML = items.map(item => `
        <div class="dresser-item" data-id="${item.id}">
            <div class="item-info">
                <span class="item-name">${escapeHtml(item.name)}</span>
                <span class="item-details">
                    ${item.type === "wear" ? "🧥 Wear" : "💍 Accessory"} · ${item.category} · ${item.formality} · ${item.season}
                    ${item.color ? ` · ${item.color}` : ""} ${item.material ? ` · ${item.material}` : ""}
                </span>
            </div>
            <button class="delete-item" data-id="${item.id}">
                <span class="material-icons">delete_outline</span>
            </button>
        </div>
    `).join("");
    document.querySelectorAll("#items-list .delete-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(btn.dataset.id);
            deleteItemById(id);
        });
    });
}

function deleteItemById(id) {
    // Check if item is used in any outfit
    const usedInOutfits = outfits.filter(o => o.items.includes(id));
    if (usedInOutfits.length > 0) {
        alert(`Cannot delete: item is used in ${usedInOutfits.length} outfit(s). Remove it from outfits first.`);
        return;
    }
    items = items.filter(i => i.id !== id);
    saveItems();
    renderItemsList();
    renderOutfitsList();   // in case outfit preview changes
    updateRecommendation();
    // Also re-render outfit item selector
    renderOutfitItemSelector();
}

function addNewItem() {
    const name = document.getElementById("item-name").value.trim();
    if (!name) { alert("Item name required"); return; }
    const type = document.getElementById("item-type").value;
    const category = document.getElementById("item-category").value;
    const season = document.getElementById("item-season").value;
    const formality = document.getElementById("item-formality").value;
    const color = document.getElementById("item-color").value.trim();
    const material = document.getElementById("item-material").value.trim();
    const newItem = {
        id: Date.now(),
        name, type, category, season, formality,
        color: color || "unspecified",
        material: material || "unspecified"
    };
    items.push(newItem);
    saveItems();
    renderItemsList();
    renderOutfitItemSelector();  // update multi-select in outfits page
    updateRecommendation();
    // Clear form
    document.getElementById("item-name").value = "";
    document.getElementById("item-color").value = "";
    document.getElementById("item-material").value = "";
}

// ---------- RENDER OUTFITS PAGE ----------
function renderOutfitsList() {
    const container = document.getElementById("outfits-list");
    if (!container) return;
    if (outfits.length === 0) {
        container.innerHTML = `<div class="placeholder-text"><span class="material-icons">inventory_2</span><span>No outfits yet. Create one below.</span></div>`;
        return;
    }
    container.innerHTML = outfits.map(outfit => {
        const itemNames = outfit.items.map(id => {
            const it = getItemById(id);
            return it ? it.name : "?";
        }).join(", ");
        return `
            <div class="dresser-item" data-id="${outfit.id}">
                <div class="item-info">
                    <span class="item-name">${escapeHtml(outfit.name)} ${outfit.favorite ? "⭐" : ""}</span>
                    <span class="item-details">${itemNames}</span>
                </div>
                <button class="delete-item" data-id="${outfit.id}">
                    <span class="material-icons">delete_outline</span>
                </button>
            </div>
        `;
    }).join("");
    document.querySelectorAll("#outfits-list .delete-item").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(btn.dataset.id);
            deleteOutfitById(id);
        });
    });
}

function deleteOutfitById(id) {
    outfits = outfits.filter(o => o.id !== id);
    saveOutfits();
    renderOutfitsList();
    setTodaysFit();  // if today's outfit was deleted, refresh
    updateRecommendation();
}

function renderOutfitItemSelector() {
    const container = document.getElementById("outfit-item-selector");
    if (!container) return;
    if (items.length === 0) {
        container.innerHTML = `<div class="placeholder-text">Add items first</div>`;
        return;
    }
    // Group by type/category for readability
    const wears = items.filter(i => i.type === "wear");
    const accessories = items.filter(i => i.type === "accessory");
    let html = `<div style="margin-bottom:0.5rem;"><strong>Wears (required at least one)</strong></div>`;
    wears.forEach(item => {
        html += `<label><input type="checkbox" value="${item.id}" class="outfit-checkbox"> ${escapeHtml(item.name)} (${item.category})</label>`;
    });
    if (accessories.length) {
        html += `<div style="margin-top:0.5rem;"><strong>Accessories (optional)</strong></div>`;
        accessories.forEach(item => {
            html += `<label><input type="checkbox" value="${item.id}" class="outfit-checkbox"> ${escapeHtml(item.name)} (${item.category})</label>`;
        });
    }
    container.innerHTML = html;
}

function createNewOutfit() {
    const name = document.getElementById("outfit-name").value.trim();
    if (!name) { alert("Outfit name required"); return; }
    const checkboxes = document.querySelectorAll("#outfit-item-selector .outfit-checkbox:checked");
    const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const hasWear = selectedIds.some(id => {
        const item = getItemById(id);
        return item && item.type === "wear";
    });
    if (!hasWear) {
        alert("An outfit must contain at least one Wear item (upperwear, lowerwear, or footwear).");
        return;
    }
    const newOutfit = {
        id: Date.now(),
        name: name,
        items: selectedIds,
        favorite: false,
        createdAt: Date.now()
    };
    outfits.push(newOutfit);
    saveOutfits();
    renderOutfitsList();
    document.getElementById("outfit-name").value = "";
    // Uncheck all checkboxes
    document.querySelectorAll("#outfit-item-selector .outfit-checkbox").forEach(cb => cb.checked = false);
    setTodaysFit();  // update home
    updateRecommendation();
}

// ---------- HOME PAGE ----------
function getRandomOutfit() {
    if (outfits.length === 0) return null;
    return outfits[Math.floor(Math.random() * outfits.length)];
}

function setTodaysFit() {
    const container = document.getElementById("today-outfit");
    if (!container) return;
    if (outfits.length === 0) {
        container.innerHTML = `<div class="placeholder-text"><span class="material-icons">spa</span><span>No outfits yet. Create one in My Outfits.</span></div>`;
        return;
    }
    const outfit = getRandomOutfit();
    const itemNames = outfit.items.map(id => {
        const it = getItemById(id);
        return it ? it.name : "?";
    }).join(", ");
    container.innerHTML = `
        <div class="outfit-display">
            <div class="outfit-name">${escapeHtml(outfit.name)}</div>
            <div class="outfit-meta">${itemNames}</div>
        </div>
    `;
}

function updateRecommendation() {
    const recArea = document.getElementById("recommendation-area");
    if (!recArea) return;
    if (items.length === 0 || outfits.length === 0) {
        recArea.innerHTML = `<div class="placeholder-text"><span class="material-icons">auto_awesome</span><span>Add items & outfits to get suggestions</span></div>`;
        return;
    }
    // Simple suggestion: recommend a category that is under-represented
    // For now, just pick a random item that is not in any outfit (or most used category missing)
    const usedItemIds = new Set();
    outfits.forEach(o => o.items.forEach(id => usedItemIds.add(id)));
    const unusedItems = items.filter(i => !usedItemIds.has(i.id));
    let suggestion = "";
    if (unusedItems.length) {
        const rand = unusedItems[Math.floor(Math.random() * unusedItems.length)];
        suggestion = `Try adding "${rand.name}" (${rand.category}) to an outfit.`;
    } else {
        suggestion = "All your items are used! Create more outfits or add new items.";
    }
    recArea.innerHTML = `<div class="rec-content"><div class="outfit-name">✨ ${escapeHtml(suggestion)}</div></div>`;
}

// ---------- NAVIGATION ----------
function initNavigation() {
    const navBtns = document.querySelectorAll(".nav-btn");
    const pages = {
        home: document.getElementById("page-home"),
        items: document.getElementById("page-items"),
        outfits: document.getElementById("page-outfits")
    };
    function showPage(pageId) {
        Object.values(pages).forEach(p => p.classList.remove("active-page"));
        pages[pageId].classList.add("active-page");
        navBtns.forEach(btn => {
            if (btn.dataset.page === pageId) btn.classList.add("active");
            else btn.classList.remove("active");
        });
        // Refresh content when switching
        if (pageId === "items") renderItemsList();
        if (pageId === "outfits") {
            renderOutfitsList();
            renderOutfitItemSelector();
        }
        if (pageId === "home") {
            setTodaysFit();
            updateRecommendation();
        }
    }
    navBtns.forEach(btn => {
        btn.addEventListener("click", () => showPage(btn.dataset.page));
    });
    showPage("home");
}

// ---------- EVENT BINDING ----------
function bindEvents() {
    document.getElementById("btn-pick-today").addEventListener("click", () => {
        if (outfits.length === 0) alert("No outfits yet. Create one in My Outfits.");
        else setTodaysFit();
    });
    document.getElementById("btn-refresh-recs").addEventListener("click", updateRecommendation);
    document.getElementById("btn-add-item").addEventListener("click", addNewItem);
    document.getElementById("btn-create-outfit").addEventListener("click", createNewOutfit);
}

function initApp() {
    loadItems();
    loadOutfits();
    bindEvents();
    initNavigation();
    renderItemsList();
    renderOutfitsList();
    renderOutfitItemSelector();
    setTodaysFit();
    updateRecommendation();
}

// Start
checkAuth();

// Helper
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}