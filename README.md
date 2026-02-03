# Valentine Day Page

Prosty, statyczny landing page walentynkowy z uroczym misiem i uciekającym przyciskiem „No”.

## Jak uruchomić lokalny podgląd

W większości hostingów „preview” nie działa, gdy otwierasz plik bez serwera (np. `file://...`).
Przeglądarka może wtedy blokować ładowanie plików JS/CSS lub zasobów względnych.
Najprostsze rozwiązanie to uruchomić lokalny serwer HTTP:

```bash
python -m http.server 8000
```

Następnie otwórz: `http://localhost:8000/`.

Alternatywnie możesz uruchomić wbudowany serwer node (bez zależności), który serwuje `public/`:

```bash
npm run dev
```

## Struktura projektu

```
.
├── index.html
├── assets
│   ├── app.js
│   └── styles.css
└── public
    ├── index.html
    └── assets
        ├── app.js
        └── styles.css
```

## Jak działa preview w różnych miejscach

Niektóre narzędzia „Preview” oczekują, że pliki będą w katalogu `public/`.
Dlatego utrzymuję kopię strony w `public/` — to ułatwia podgląd w takich środowiskach.
Dodatkowo w repo jest `server.js` i skrypt `npm run dev`, więc preview może po prostu uruchomić serwer.

## Jak wdrożyć (deploy)

To zwykła strona statyczna, więc możesz ją wrzucić praktycznie wszędzie:

- **GitHub Pages**: wrzuć repo i włącz Pages dla gałęzi z `index.html`.
- **Netlify / Vercel**: wybierz „static site” bez buildu, katalog główny to `.`.
- **Dowolny serwer**: skopiuj `index.html` i folder `assets` na serwer.

## Personalizacja

- Teksty zmienisz w `index.html`.
- Kolory, odstępy i typografia są w `assets/styles.css`.
- Logika uciekającego przycisku i overlayu jest w `assets/app.js`.
