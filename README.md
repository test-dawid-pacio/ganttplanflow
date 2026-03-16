# GanttPlanFlow PWA — Instrukcja uruchomienia

## Zawartość pakietu

```
/GanttPlanFlow-PWA/
├── index.html        ← aplikacja (zmodyfikowana pod PWA)
├── manifest.json     ← opis aplikacji dla systemu
├── sw.js             ← Service Worker (cache + offline)
├── icons/
│   ├── icon-192.png  ← ikona (zamień na własną)
│   └── icon-512.png  ← ikona (zamień na własną)
└── README.md         ← ten plik
```

## Uruchomienie lokalne (testowanie)

### Opcja A: Python (najprostsze)
```bash
cd GanttPlanFlow-PWA
python -m http.server 8080
```
Otwórz: http://localhost:8080

### Opcja B: Node.js
```bash
npx serve .
```

### Opcja C: VS Code
Zainstaluj rozszerzenie "Live Server" → kliknij prawym na index.html → "Open with Live Server"

## Instalacja jako PWA

1. Otwórz http://localhost:8080 w **Google Chrome**
2. W pasku adresu pojawi się ikona instalacji (⊕) po prawej stronie
3. Kliknij → "Zainstaluj"
4. Aplikacja pojawi się jako osobne okno + skrót na pulpicie

## Wdrożenie online (żeby inni mogli zainstalować)

Wrzuć cały folder na hosting z HTTPS:
- **GitHub Pages**: darmowy, automatyczny HTTPS
- **Netlify**: drag & drop folder → gotowe
- **Vercel**: podpinasz repo Git → automatyczny deploy

## Ważne

- **Pierwsze uruchomienie wymaga internetu** — Service Worker cachuje
  biblioteki CDN (Tailwind, Chart.js, SheetJS, Google Fonts)
- **Każde kolejne uruchomienie działa offline** — wszystko z cache
- Przy aktualizacji aplikacji zmień `CACHE_VERSION` w `sw.js`
- Ikony `icon-192.png` i `icon-512.png` to placeholdery — zamień na własne

## Weryfikacja PWA

1. Chrome → F12 → zakładka **Application**
2. Sprawdź: Manifest (powinien być załadowany)
3. Sprawdź: Service Workers (powinien być aktywny)
4. Sprawdź: Cache Storage (powinny być zcachowane pliki)
5. Zakładka **Lighthouse** → Run audit → PWA (powinno być zielone)
