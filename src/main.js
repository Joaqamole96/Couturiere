// Dripify

// ---------- Authentication ----------
const VALID_EMAIL = "admin@example.com";
const VALID_PASSWORD = "pass123!";

function checkAuth() {
    const loggedIn = sessionStorage.getItem("dripify_logged_in");
    if (loggedIn === "true") {
        // Already logged in, show app and hide login
        document.getElementById("login-container").style.display = "none";
        document.getElementById("app").style.display = "block";
        initApp();  // load data and start the app
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
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (email === VALID_EMAIL && password === VALID_PASSWORD) {
            sessionStorage.setItem("dripify_logged_in", "true");
            document.getElementById("login-container").style.display = "none";
            document.getElementById("app").style.display = "block";
            initApp();
        } else {
            errorDiv.textContent = "Invalid email or password. Try admin@example.com / pass123!";
        }
    };

    loginBtn.addEventListener("click", doLogin);
    // Allow Enter key in inputs
    emailInput.addEventListener("keypress", (e) => { if (e.key === "Enter") doLogin(); });
    passwordInput.addEventListener("keypress", (e) => { if (e.key === "Enter") doLogin(); });
}

// ---------- App Data & Logic (unchanged except wrapped in initApp) ----------
let outfits = [];

function loadData() {
    const stored = localStorage.getItem('dripify_outfits_v2');
    if (stored) {
        outfits = JSON.parse(stored);
    } else {
        outfits = [
            { id: Date.now() + 201, name: "Oversized knit sweater + corduroy pants", season: "winter", style: "casual" },
            { id: Date.now() + 202, name: "Linen blend shirt + tailored shorts", season: "summer", style: "smart" },
            { id: Date.now() + 203, name: "Wool trench coat + leather gloves", season: "fall", style: "formal" },
            { id: Date.now() + 204, name: "Retro runner sneakers + tech fleece", season: "any", style: "sporty" }
        ];
        saveToLocal();
    }
    renderDresserList();
    updateRecommendation();
}

function saveToLocal() {
    localStorage.setItem('dripify_outfits_v2', JSON.stringify(outfits));
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getRandomOutfit() {
    if (outfits.length === 0) return null;
    return outfits[Math.floor(Math.random() * outfits.length)];
}

function setTodaysFit() {
    const container = document.getElementById('today-outfit');
    if (!container) return;
    if (outfits.length === 0) {
        container.innerHTML = `<div class="placeholder-text">
            <span class="material-icons">wardrobe</span>
            <span>Your dresser is empty — add pieces first</span>
        </div>`;
        return;
    }
    const outfit = getRandomOutfit();
    container.innerHTML = `
        <div class="outfit-display">
            <div class="outfit-name">${escapeHtml(outfit.name)}</div>
            <div class="outfit-meta">${outfit.style} · ${outfit.season}</div>
        </div>
    `;
}

function getSmartRecommendation() {
    if (outfits.length === 0) return null;
    const styleCount = {};
    outfits.forEach(o => { styleCount[o.style] = (styleCount[o.style] || 0) + 1; });
    let dominantStyle = "casual";
    let maxCount = 0;
    for (const [style, cnt] of Object.entries(styleCount)) {
        if (cnt > maxCount) { maxCount = cnt; dominantStyle = style; }
    }
    const candidates = outfits.filter(o => o.style === dominantStyle);
    return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : outfits[0];
}

function updateRecommendation() {
    const recArea = document.getElementById('recommendation-area');
    if (!recArea) return;
    if (outfits.length === 0) {
        recArea.innerHTML = `<div class="placeholder-text">
            <span class="material-icons">auto_awesome</span>
            <span>Save outfits to unlock suggestions</span>
        </div>`;
        return;
    }
    const rec = getSmartRecommendation();
    recArea.innerHTML = `
        <div class="rec-content">
            <div class="outfit-name">✨ ${escapeHtml(rec.name)}</div>
            <div class="outfit-meta">recommended based on your ${rec.style} style</div>
        </div>
    `;
}

function renderDresserList() {
    const container = document.getElementById('dresser-items');
    if (!container) return;
    if (outfits.length === 0) {
        container.innerHTML = `<div class="placeholder-text" style="padding:1rem;">
            <span class="material-icons">checkroom</span>
            <span>No items yet — start adding below</span>
        </div>`;
        return;
    }
    container.innerHTML = outfits.map(outfit => `
        <div class="dresser-item" data-id="${outfit.id}">
            <div class="item-info">
                <span class="item-name">${escapeHtml(outfit.name)}</span>
                <span class="item-details">
                    <span>${outfit.style}</span>
                    <span>${outfit.season}</span>
                </span>
            </div>
            <button class="delete-item" data-id="${outfit.id}">
                <span class="material-icons">delete_outline</span>
            </button>
        </div>
    `).join('');
    document.querySelectorAll('.delete-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            deleteOutfitById(id);
        });
    });
}

function deleteOutfitById(id) {
    outfits = outfits.filter(o => o.id !== id);
    saveToLocal();
    renderDresserList();
    updateRecommendation();
    if (outfits.length === 0) {
        document.getElementById('today-outfit').innerHTML = `<div class="placeholder-text">
            <span class="material-icons">spa</span>
            <span>No outfits — add some style</span>
        </div>`;
    } else {
        const currentToday = document.querySelector('#today-outfit .outfit-name');
        if (currentToday) {
            const name = currentToday.innerText;
            if (!outfits.some(o => o.name === name)) setTodaysFit();
        } else setTodaysFit();
    }
}

function addNewOutfit() {
    const nameInput = document.getElementById('outfit-name');
    const seasonSelect = document.getElementById('outfit-season');
    const styleSelect = document.getElementById('outfit-style');
    const name = nameInput.value.trim();
    if (!name) {
        alert("Please describe your outfit");
        return;
    }
    const newOutfit = {
        id: Date.now(),
        name: name,
        season: seasonSelect.value,
        style: styleSelect.value
    };
    outfits.push(newOutfit);
    saveToLocal();
    renderDresserList();
    updateRecommendation();
    nameInput.value = "";
    seasonSelect.value = "any";
    styleSelect.value = "casual";
    if (outfits.length === 1) setTodaysFit();
}

function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const pages = {
        home: document.getElementById('page-home'),
        dresser: document.getElementById('page-dresser')
    };
    function showPage(pageId) {
        Object.values(pages).forEach(page => page.classList.remove('active-page'));
        pages[pageId].classList.add('active-page');
        navBtns.forEach(btn => {
            const btnPage = btn.getAttribute('data-page');
            if (btnPage === pageId) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pageId = btn.getAttribute('data-page');
            if (pageId === 'home') showPage('home');
            else if (pageId === 'dresser') showPage('dresser');
        });
    });
    showPage('home');
}

function bindAppEvents() {
    const pickBtn = document.getElementById('btn-pick-today');
    if (pickBtn) {
        pickBtn.addEventListener('click', () => {
            if (outfits.length === 0) alert("Add outfits to your dresser first");
            else setTodaysFit();
        });
    }
    const refreshRecs = document.getElementById('btn-refresh-recs');
    if (refreshRecs) {
        refreshRecs.addEventListener('click', () => {
            if (outfits.length === 0) alert("No outfits yet — add some to get recommendations");
            else updateRecommendation();
        });
    }
    const addBtn = document.getElementById('btn-add_outfit');
    if (addBtn) addBtn.addEventListener('click', addNewOutfit);
    const nameField = document.getElementById('outfit-name');
    if (nameField) {
        nameField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewOutfit();
        });
    }
}

function initApp() {
    loadData();
    setTodaysFit();
    initNavigation();
    bindAppEvents();
}

// Start: check authentication first
checkAuth();