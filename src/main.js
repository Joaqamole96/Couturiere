// Dripify - Core Application Logic

// ---------- Data Model ----------
let outfits = [];

// Load from localStorage or use default items
function loadData() {
    const stored = localStorage.getItem('dripify_outfits');
    if (stored) {
        outfits = JSON.parse(stored);
    } else {
        // Default starter outfits
        outfits = [
            { id: Date.now() + 101, name: "Oversized hoodie + cargo pants", season: "winter", style: "casual" },
            { id: Date.now() + 102, name: "Linen button-up + chinos", season: "summer", style: "smart" },
            { id: Date.now() + 103, name: "Blazer + dress trousers", season: "spring", style: "formal" },
            { id: Date.now() + 104, name: "Retro sneakers + joggers", season: "any", style: "sporty" }
        ];
        saveToLocal();
    }
    renderDresserItems();
    updateRecommendation();
}

function saveToLocal() {
    localStorage.setItem('dripify_outfits', JSON.stringify(outfits));
}

// Helper: escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ---------- Today's Fit (random selection) ----------
function getRandomOutfit() {
    if (outfits.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * outfits.length);
    return outfits[randomIndex];
}

function setTodaysFit() {
    const container = document.getElementById('today-outfit');
    if (!container) return;

    if (outfits.length === 0) {
        container.innerHTML = '<div class="placeholder">Add outfits to your dresser first</div>';
        return;
    }

    const outfit = getRandomOutfit();
    container.innerHTML = `
        <div class="outfit-card">
            <div class="outfit-name">${escapeHtml(outfit.name)}</div>
            <div class="outfit-meta">${outfit.style} · ${outfit.season}</div>
        </div>
    `;
}

// ---------- Recommendation Engine (based on user's most frequent style) ----------
function getSmartRecommendation() {
    if (outfits.length === 0) return null;

    // Count style frequencies
    const styleCount = {};
    outfits.forEach(outfit => {
        styleCount[outfit.style] = (styleCount[outfit.style] || 0) + 1;
    });

    // Find dominant style
    let dominantStyle = "casual";
    let maxCount = 0;
    for (const [style, count] of Object.entries(styleCount)) {
        if (count > maxCount) {
            maxCount = count;
            dominantStyle = style;
        }
    }

    // Find outfits that match the dominant style
    const matchingOutfits = outfits.filter(o => o.style === dominantStyle);
    if (matchingOutfits.length > 0) {
        return matchingOutfits[Math.floor(Math.random() * matchingOutfits.length)];
    }
    
    return outfits[0];
}

function updateRecommendation() {
    const recArea = document.getElementById('recommendation-area');
    if (!recArea) return;

    if (outfits.length === 0) {
        recArea.innerHTML = '<div class="empty-message">Add outfits to get personalized recommendations</div>';
        return;
    }

    const rec = getSmartRecommendation();
    if (rec) {
        recArea.innerHTML = `
            <div class="rec-content">
                <div class="rec-name">${escapeHtml(rec.name)}</div>
                <div class="rec-reason">Based on your ${rec.style} style vibe</div>
            </div>
        `;
    } else {
        recArea.innerHTML = '<div class="empty-message">Add more outfits for better recommendations</div>';
    }
}

// ---------- Dresser: Render all outfits with delete buttons ----------
function renderDresserItems() {
    const container = document.getElementById('dresser-items');
    if (!container) return;

    if (outfits.length === 0) {
        container.innerHTML = '<div class="placeholder" style="text-align:center; padding:1rem;">👕 Your dresser is empty — add your first outfit above</div>';
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
            <button class="delete-item" data-id="${outfit.id}">🗑️</button>
        </div>
    `).join('');

    // Attach delete event listeners
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
    renderDresserItems();
    updateRecommendation();
    
    // Refresh today's fit if it's now empty or if the current outfit was deleted
    if (outfits.length === 0) {
        document.getElementById('today-outfit').innerHTML = '<div class="placeholder">✨ Add outfits to your dresser first</div>';
    } else {
        // Check if current displayed outfit still exists
        const currentDisplay = document.querySelector('#today-outfit .outfit-name');
        if (currentDisplay) {
            const currentName = currentDisplay.innerText.replace('👔 ', '');
            const stillExists = outfits.some(o => o.name === currentName);
            if (!stillExists) setTodaysFit();
        } else {
            setTodaysFit();
        }
    }
}

// ---------- Add new outfit ----------
function addNewOutfit() {
    const nameInput = document.getElementById('outfit-name');
    const seasonSelect = document.getElementById('outfit-season');
    const styleSelect = document.getElementById('outfit-style');

    const name = nameInput.value.trim();
    if (name === "") {
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
    renderDresserItems();
    updateRecommendation();
    
    // Reset form
    nameInput.value = "";
    seasonSelect.value = "any";
    styleSelect.value = "casual";
    
    // If this is the first outfit, set today's fit
    if (outfits.length === 1) {
        setTodaysFit();
    }
}

// ---------- Event Listeners & Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setTodaysFit();

    // Pick for me button
    const pickBtn = document.getElementById('btn-pick-today');
    if (pickBtn) {
        pickBtn.addEventListener('click', () => {
            if (outfits.length === 0) {
                alert("Your dresser is empty! Add some outfits first");
                return;
            }
            setTodaysFit();
        });
    }

    // Add outfit button
    const addBtn = document.getElementById('btn-add_outfit');
    if (addBtn) {
        addBtn.addEventListener('click', addNewOutfit);
    }

    // Refresh recommendations button
    const refreshBtn = document.getElementById('btn-refresh-recs');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (outfits.length === 0) {
                alert("Add outfits to your dresser to get recommendations");
                return;
            }
            updateRecommendation();
        });
    }

    // Allow pressing Enter in the input field to add outfit
    const nameField = document.getElementById('outfit-name');
    if (nameField) {
        nameField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addNewOutfit();
            }
        });
    }
});