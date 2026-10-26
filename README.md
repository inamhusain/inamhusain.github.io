# inamhusain.dev

Personal portfolio of Inamhusain Masi, Flutter developer. Plain static HTML, CSS and JS, no build step.

```
index.html            page content
assets/css/styles.css styles (tokens at the top, light/dark via prefers-color-scheme)
assets/js/main.js     scroll animations (GSAP + ScrollTrigger + SplitText, Lenis smooth scroll, loaded from jsDelivr)
favicon.svg
robots.txt
```

## Run locally

```sh
python3 -m http.server 8000   # open http://localhost:8000
```

## Edit content

- **Add a project:** copy an `<article class="project reveal">` block in `index.html`, then set its number and its hover colour (`style="--c:#hex"`).
- **Medium stories:** these are written into the page, because browsers block requests to Medium's feed from other sites. To show a new article, copy an `<li>` in `.stories` and change its date, title and link. Your feed is at https://medium.com/feed/@flutterguru.
- **Colours and fonts:** edit the variables in `:root` at the top of `styles.css`.
- **Rule:** never name an app, client or company. Describe the app's domain and the tech used instead.

## Deploy

Upload the repo root as-is. Any static host works:

- **Netlify:** drag the folder onto https://app.netlify.com/drop, or connect the repo with no build command and `/` as the publish directory.
- **GitHub Pages:** go to Settings → Pages → Deploy from branch → `main` / root.
- **Vercel / Cloudflare Pages:** framework preset "Other", no build command.

After you connect a custom domain, add `<link rel="canonical">` and `og:url` to `index.html`.
