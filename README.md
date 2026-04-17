# Couturiere – personal outfit helper

**Version:** 0.2.0 (login added)  
**Last updated:** 2026-04-16  
**Status:** working prototype, more features planned

## What this is

Couturiere helps you pick an outfit for the day and suggests new pieces based on what you already have in your virtual dresser. Everything runs in your browser – no server, no database (yet). Your wardrobe is saved locally.

## How to run

1. Download or clone the files. Keep the folder structure:
couturiere/
├── index.html
├── style.css
├── src/
│ └── main.js
└── README.md

1. Open `index.html` with any modern browser (Chrome, Firefox, Edge, Safari).
2. No build step, no dependencies. Works offline after the first load.

## Login (added in v0.2)

The app now asks for an email and password before showing your wardrobe.  
Use these demo credentials:

- **Email:** `admin@example.com`
- **Password:** `pass123!`

Once logged in, the app remembers your session until you close the browser tab.  
*Why?* We’re planning to connect a real database later – this is just a placeholder.

## How to use

After logging in, you’ll see two pages (navigation bar at the top):

### Home page
- **Today’s Curated Fit** – click “Pick for me” to get a random outfit from your dresser.
- **Fresh Drops** – click “Refresh suggestion” to see an AI‑style recommendation. It looks at your most common style category (casual, smart, formal, sporty) and suggests a matching outfit.

### Dresser page
- **My Wardrobe** – list of all outfits you’ve saved. Each shows the name, style, and season.
- **Delete** – click the trash icon to remove an outfit.
- **Add New Piece** – type a name, pick a season and style, then click “Add to dresser”.

All changes are saved automatically in your browser’s local storage.

## Known issues / notes

- The “AI recommendation” is very simple – it just picks a random outfit from your most frequent style. It’s not actual machine learning.
- Login credentials are hardcoded. In a real version we’d use a backend.
- If you clear your browser’s local storage, your saved outfits will disappear.
- No image uploads yet – just text descriptions.

## What’s next (roadmap)

- Real database (Firebase or similar)
- Weather API integration → recommends outfits based on today’s temperature
- Outfit photos
- Share / export your wardrobe

## Credits

Made by Joaqamole, 2026.  
Icons by Google Material Icons. Fonts from Google Fonts (Inter + Playfair Display).