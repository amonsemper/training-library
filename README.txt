Training Library - static site

Open index.html in any browser, or upload this whole folder to any static host.
An offline zip is rebuilt on every push by .github/workflows/offline.yml and attached to the
"offline" release (linked from the home page).

Static hosts:
  - Netlify Drop: https://app.netlify.com/drop  (drag this folder onto the page)
  - Cloudflare Pages: https://pages.cloudflare.com/
  - GitHub Pages: https://pages.github.com/

Files:
  index.html                 library home and navigation
  cqb.html                   Recon & CQB Primer
  scenarios.html             Scenario-Based Engagement Breakdowns
  fieldcraft.html            Fieldcraft (land nav, hide sites, signature, drones, recon)
  medical.html               Field Medical (MARCH, hemorrhage, IFAK, CPR, cold and heat)
  comms.html                 Analogue Comms (simplex radio, licensing, field phones, HF)
  offgrid.html               Off-Grid Environment Configurations (batteries, generators, fuel, heating and cooling)
  water.html, food.html, kits.html, fire-shelter.html   Preparedness: water, food storage, kits and go-bags, fire and shelter
  cards.html                 Printable one-page cards (bleeding control, family plan, comms plan, water, load sheet)
  maintenance.html           Firearm cleaning and maintenance
  search.html                Site search (index in assets/search-index.js)
  sw.js, manifest.webmanifest, assets/icons/   installable offline app + link-preview image

GENERATED: nav, home cards, link-preview tags, "Updated" dates, search index, sw.js and the extra CSS block are
rebuilt by ~/Desktop/training-library-tools/build.py (run it before every commit). New pages start in
training-library-tools/bodies/; videos are listed in training-library-tools/videos.json.
  cover.html                 Cover and Concealment
  calculator.html            Ballistics Calculator (all cartridges; data in assets/ballistics.js)
  armory.html                Armory Planner (local-only kit/ammo/gear planner; self-contained app)
  rifle.html, shotgun.html, handgun.html, bolt-rifle.html
  defensive-rifle.html, defensive-shotgun.html, defensive-handgun.html, defensive-bolt-rifle.html
  modifications.html         Common Weapon Modifications
  drills.html                Common Practice Drills (with par timer)
  assets/video.js            click-to-play YouTube player for the Videos sections
  assets/img/                platform photos and card icons
  assets/img/icons/          home-card icons (sketch illustrations)
  assets/site.css            shared styles (colors are tokens at the top)
  assets/sim.js              shared animation engine
  assets/ballistics.js       G1 trajectory solver and load calculator (load data at the top)

Fonts load from Google Fonts; offline, pages fall back to system fonts.
