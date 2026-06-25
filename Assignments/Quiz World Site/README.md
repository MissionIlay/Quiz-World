# Quiz World Site Deployment Instructions

This folder contains the **final deployed HTML files** for the Quiz World Site. To keep the project organized and clean, please adhere to the following development and deployment rules:

## 📁 Repository Structure

- **`Electrostats/`**
  - Contains Electrostats PDFs, chapter images (`gauss_images/`), and the master source file `electrostats_quiz_competition.html`.
- **`Optics /`**
  - Contains Optics PDFs, practice worksheets, chapter images, chapter videos (`it_must_have_a_nice_image_of_a.mp4`), and master source files (`optics_quiz_competition.html`, `refraction_quiz_competition.html`).
- **`Quiz World Site/`** (This folder)
  - Contains only the final deployed HTML files (`index.html`, `electrostats_quiz_competition.html`, `optics_quiz_competition.html`, `refraction_quiz_competition.html`).

---

## 🛠️ Development Rules

1. **Do not edit HTML files directly in the `Quiz World Site/` folder.**
   - All feature development and question fine-tuning must be done in the respective chapter/subject folders (e.g. `Electrostats/` or `Optics /`).
2. **Keep assets inside subject folders.**
   - All image assets, diagrams, videos, and PDFs must remain inside their respective subject folders 
   - Do not place or scatter image files inside `Quiz World Site/`.

---

## 🚀 Deployment Process

When you have finished editing a chapter's HTML files and are ready to deploy them to the main portal:

1. **Copy the HTML file** from the subject folder to the `Quiz World Site/` folder.
2. **Adjust relative asset paths** in the deployed HTML file to reference the subject folders.
   - For Electrostats: Prefix image paths with `../Electrostats/` (e.g. `../Electrostats/gauss_images/`).

---

## 🎮 Mode Configuration (Two Modes)

Whenever you build or update an assignment, you **must create and maintain two separate HTML versions**:
1. **Quiz Mode (`*_quiz_competition.html`)**: Presenter-led, team-based scoreboard mode.
2. **Exam Mode (`*_exam.html`)**: Individual points-game mode with dynamic scoring (`10` down to `3` points over 300s), 5-minute timeout, and a final summary overlay.

When deploying, always **copy and paste both files** (e.g. `*_quiz_competition.html` and `*_exam.html`) into the `Quiz World Site/` folder, and make sure their relative paths to assets are corrected. Ensure the main portal page dropdown is updated to link to both versions.

