# Couturière – Personal Outfit Helper

## Metadata

+-----------+--------------+
| Version   | Last Updated |
+-----------+--------------+
| v0.3.0    | 2026-04-18   |
+-----------+--------------+

## Description

Couturière is a wardrobe management application that assists the user in curating daily outfits, maintaining a catalogue of articles, and receiving suggestions for new pieces.

## Objects

### Article

An individual article of clothing or accessory.

Properties:
- `id` (string, UUID) – unique identifier
- `name` (string) – display name of the article
- `description` (string, optional) – free‑text notes
- `season` (enum: "spring", "summer", "autumn", "winter", "all") – intended seasonal use
- `style` (enum: "casual", "smart", "formal", "sporty") – style category
- `variation` (string, optional) – describes a modifiable state of the article (e.g., "rolled sleeves", "tucked", "belted"). Variations may affect thermal suitability or style independently of the base article.
- `tags` (array of strings, optional) – user‑defined keywords
- `createdAt` (ISO date string) – timestamp of creation
- `updatedAt` (ISO date string) – timestamp of last modification

### Ensemble

A collection of one or more `Article` references. Also referred to as an outfit, fit, or wear.

Properties:
- `id` (string, UUID) – unique identifier
- `name` (string) – display name of the ensemble
- `articleIds` (array of UUIDs) – references to constituent articles
- `tags` (array of strings, optional) – independent tags for the ensemble (e.g., "date night", "casual Friday"). These tags are not inherited from individual articles.
- `createdAt` (ISO date string)
- `updatedAt` (ISO date string)

## Pages

### Home Page

The home page contains two sections:

#### 1. Dashboard

Displays a welcome banner and high‑level summary of the wardrobe (e.g., article count, ensemble count).

#### 2. À la Main

A curated outfit for the day. The system selects an ensemble from the user’s dresser based on a simple heuristic (most frequent style category among articles). User may request a new random selection via a “Pick for me” control.

### My Fits

The My Fits page is divided into two sub‑sections:

#### 1. Penderie

Shows the collection of both `Article` and `Ensemble` objects owned by the user.

##### A. View Article

Opened by clicking on an article. Displays the article’s full properties (name, description, tags, variation, etc.) and provides actions: **Edit Article** and **Delete Article**.

###### I. Edit Article

Allows modification of all editable fields (`name`, `description`, `season`, `style`, `variation`, `tags`). Upon submission, the `updatedAt` timestamp is refreshed.

###### II. Delete Article

Prompts the user to confirm deletion. If confirmed, removes the article from storage. Any ensemble that referenced the deleted article shall have that reference removed (orphaned references are not permitted).

##### B. Add Article

Presents a form to create a new `Article`. All fields except `description` and `variation` are required. On successful creation, the article is appended to the wardrobe and persisted.

##### C. View Ensemble

Analogous to View Article – displays ensemble properties (name, constituent articles, independent tags). Actions: **Edit Ensemble** and **Delete Ensemble**.

##### D. Add Ensemble

Form to create a new `Ensemble`. The user selects a name and one or more existing articles. Ensemble‑specific tags may be added independently.

#### 2. Create‑a‑Fit

Dedicated interface for building a new `Ensemble` from scratch. Distinct from the simple “Add Ensemble” action because it emphasises a step‑by‑step, visual assembly process. The user may:

- Browse and filter existing articles
- Add articles to a working set
- Assign ensemble‑level tags (independent of article tags)
- Save the resulting ensemble to `My Fits`

The output is an `Ensemble` object as defined above.

## Technical Specifications

### Current Stack

- **Platform:** Web (desktop / mobile browser)
- **Languages:** HTML5, CSS3, JavaScript (ES2020)
- **Persistence:** `localStorage` (browser)
- **Authentication:** Demo placeholder (see below)
- **Dependencies:** None (vanilla implementation)

### Planned Migration

A future release will migrate the application to **React Native** (targeting iOS and Android). The data model (`Article`, `Ensemble`) and core logic will be preserved; only the presentation and persistence layers will be re‑implemented.