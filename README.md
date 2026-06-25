# Physics & Optics Assignments Web Portal

This repository contains the interactive web portal for classroom quizzes and student exams.

## 📁 Repository Structure

- **`Electrostats/`**
  - Contains Gauss Law images (`gauss_images/`), master presenter quiz (`electrostats_quiz_competition.html`), and student exam (`electrostats_exam.html`).
- **`Optics /`**
  - Contains lens diagrams, subject videos (`it_must_have_a_nice_image_of_a.mp4`), master presenter quiz (`optics_quiz_competition.html`), student exam (`optics_exam.html`), refraction quiz (`refraction_quiz_competition.html`), and refraction exam (`refraction_exam.html`).
- **`Quiz World Site/`**
  - Contains the portal landing page (`index.html`) and copies of all quiz and exam files.
- **`index.html`**
  - The root entry point of the website that automatically redirects users directly to the Quiz World Site homepage.

## 🚀 Deployed Version (Quiz World Site)

To host this repository for free (e.g. on Netlify or GitHub Pages):
1. Upload the entire root directory (which contains all folders).
2. The root `index.html` automatically routes users to the correct portal page.

## 🎮 Mode Configuration (Two Modes)

Whenever you build or update an assignment, you **must create and maintain two separate HTML versions**:
1. **Quiz Mode (`*_quiz_competition.html`)**: Presenter-led, team-based scoreboard mode.
2. **Exam Mode (`*_exam.html`)**: Individual points-game mode with dynamic scoring (`10` down to `3` points over 300s), 5-minute timeout, and a final summary overlay.

When deploying, always **copy and paste both files** (e.g. `*_quiz_competition.html` and `*_exam.html`) into the `Quiz World Site/` folder, and make sure their relative paths to assets are corrected. Ensure the main portal page dropdown is updated to link to both versions.
