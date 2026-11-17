# EnCaDev website

Requires Node.js 20 or newer with npm. The project has no npm dependencies.

## Edit and preview

Open PowerShell in the extracted EnCaDev-Managed folder and run:

```powershell
npm run dev
```

Open http://127.0.0.1:5173. Refresh after editing any source file to see the changes. Stop the server with Ctrl+C.

## Build and preview the finished site

- `npm run build` checks the JavaScript and generates `dist/`. Upload the contents of `dist/` to a static web host.
- `npm start` builds the site and serves `dist/` at http://127.0.0.1:8000.
- `npm run check` checks JavaScript syntax.

The commands also work from the project's `src/` folder. npm locates the project root, and the scripts resolve source and output paths from their own location. To change a port in PowerShell, set `$env:PORT = 8080` before starting a server.

## Where to edit

| File or folder | What it controls |
| --- | --- |
| `src/pages/home.html` | Home, the mouse scroll cue, and the technology carousel |
| `src/pages/solutions.html` | Services, demo screens, and application security |
| `src/pages/contact.html` | Contact and registered company details |
| `src/index.html` | Shared page layout, navbar, language selector, and footer |
| `src/public/style.css` | Site styling and animations |
| `src/public/app.js` | Page navigation, data-flow animation, and mouse scroll behavior |
| `src/public/home-stats.js` | Client and project totals and their scroll animation |
| `src/public/portfolio.js` | Polish translations, demo behavior, and carousel |
| `src/public/logos/` and `src/public/previews/` | Technology logos, flags, and demo mockups |

Update matching entries in `src/public/portfolio.js` when changing English text marked with `data-copy`. The demos use sample data and scripted chatbot replies.

## Update the Home totals

In `src/public/home-stats.js`, set `clients` and `projects` to the minimum totals to display. The graph rescales automatically.

## Home background photo credits

Stock photos bundled in `src/public/backgrounds/` are licensed under the [Unsplash License](https://unsplash.com/license).

- `projects.webp` — [Compagnons](https://unsplash.com/photos/people-working-on-laptops-at-a-table-Uywp-JHgVP4)
- `development.webp` — [Jakub Żerdzicki](https://unsplash.com/photos/computer-screen-displaying-lines-of-code-n3ba57RKVNs)
- `contact.webp` — [Huy Phan](https://unsplash.com/photos/a-modern-desk-setup-with-a-keyboard-and-monitor-Wqfpx-QnT-g)
- `integration.webp` — [Cherrydeck](https://unsplash.com/photos/people-collaborating-in-modern-office-workspace-UpsEF48wAgk)
- `workflow.webp` — [Rodeo Project Management Software](https://unsplash.com/photos/a-laptop-computer-sitting-on-top-of-a-wooden-table-DGG9Dzf7Udo)
