# OB/GYN Emergency Case Simulator

Interactive, browser-based clinical cases for OB/GYN residents. Static site (HTML/CSS/JS, no dependencies), ready for GitHub Pages.

**Case 1E — Pelvic pain and vaginal bleeding in early pregnancy.**

## Features
- History → physical exam → diagnosis → workup → management → orders → surgery → postoperative care.
- Immediate feedback and scoring for every decision; challenges from colleagues, attendings, nurses, and radiologists.
- Patient chart that accumulates findings; simulated clock.
- Printable debrief with path, critical errors, written answers, teaching points, and references.
- No data collection: nothing is stored or transmitted.

## Run locally
Open `index.html` in a browser.

## Publish on GitHub Pages
Settings → Pages → Source: *Deploy from a branch* → `main` / root.

## Add a new case
Create `cases/<id>.js` following `cases/case1e.js`, include it in `index.html`, and open `index.html?case=<id>`.

## Author
Ricardo F. Savaris, MD, PhD — Department of Obstetrics and Gynecology, UFRGS / Hospital de Clínicas de Porto Alegre.

For educational use only. Not a substitute for clinical judgment.
