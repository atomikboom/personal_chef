# 📖 Guida Tecnica — PERSONAL_CHEF

Documento di riferimento completo per lo sviluppo, il deploy e la manutenzione del progetto.

---

## 📦 1. Setup Iniziale

### Requisiti
- **Node.js** v20+ — https://nodejs.org
- **npm** v10+
- **Expo CLI** (installato automaticamente con npx)
- **EAS CLI** (per build e aggiornamenti cloud)
- Account **Expo** — https://expo.dev
- Account **Supabase** — https://supabase.com

### Installazione dipendenze
```bash
# Dalla cartella del progetto
npm install
```

### Configurare le variabili d'ambiente
Crea (o modifica) il file `.env` nella radice del progetto:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxx...
```
> ⚠️ Senza queste chiavi l'app parte in **Mock Mode** (dati locali temporanei, non salvati su DB).

---

## 🚀 2. Avviare il Progetto in Sviluppo

### Avvio standard (stessa rete Wi-Fi)
```bash
npx expo start -c --lan
```
- `-c` = pulisce la cache di Metro (sempre consigliato dopo modifiche al codice).
- `--lan` = serve l'app sulla rete locale, nessun tool extra necessario.
- Scansiona il **QR code** che appare nel terminale con l'app **Expo Go** sul telefono.

### Avvio con tunnel (ngrok) — se telefono e Mac sono su reti diverse
```bash
# Prima di usarlo la prima volta, installa ngrok localmente
npm install @expo/ngrok@4.1.0 --save-dev

# Poi avvia
npx expo start -c --tunnel
```

### Forzare il ricaricamento dell'app sul telefono (mentre Expo è in esecuzione)
```
Premi   Shift + R   nel terminale dove gira Expo
```

### Aprire nel browser (modalità Web)
```bash
npx expo start -c
# poi premi   w   nel terminale
```

---

## 🗄️ 3. Database — Supabase

### Aprire lo SQL Editor di Supabase
1. Vai su https://supabase.com → Dashboard del tuo progetto.
2. Clicca su **SQL Editor** nel menu laterale.
3. Incolla ed esegui gli script SQL da lì.

### Creare lo schema del database (prima volta)
Copia il contenuto di `supabase_schema.sql` e incollalo nello **SQL Editor** di Supabase.

### Popolare il database con i dati di esempio (seed)
```bash
npx ts-node seed.ts
```
> Questo script legge i dati da `useMockDataStore.ts` e li inserisce nelle tabelle Supabase.

### Controllare se l'app è connessa a Supabase (o in Mock Mode)
Aggiungi temporaneamente in `src/services/supabase.ts`:
```ts
console.log('SUPABASE URL →', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('MOCK MODE →', isMockMode);
```
Poi riavvia con `npx expo start -c --lan`. Se vedi l'URL corretto e `isMockMode = false`, sei connesso.

---

## 📲 4. Aggiornare l'App su Expo Go (senza pubblicarla)

### Metodo 1 — Locale (la più veloce, consigliata per sviluppo)
Assicurati che Mac e telefono siano sulla **stessa rete Wi-Fi**, poi:
```bash
npx expo start -c --lan
```
Scansiona il QR code con Expo Go. Ogni salvataggio di file si riflette istantaneamente.

### Metodo 2 — EAS Update (over-the-air, senza Mac acceso)
Pubblica un aggiornamento JavaScript sul cloud Expo:
```bash
eas update --branch main --message "descrizione delle modifiche"
```
Poi **chiudi e riapri il progetto** nell'app Expo Go: scaricherà automaticamente l'aggiornamento.

> ⚠️ Per funzionare, le variabili Supabase devono essere configurate anche su EAS:
> ```bash
> eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co" --visibility plaintext
> eas env:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..." --visibility sensitive
> ```
> Oppure aggiungile dalla dashboard: https://expo.dev → il tuo progetto → **Environment Variables**

---

## 🏗️ 5. Build — Pubblicare l'App (opzionale)

### Login
```bash
eas login
# inserisci email e password del tuo account Expo (daniele24)
```

### Build Android (.apk per test interni)
```bash
eas build --platform android --profile preview
```

### Build iOS (richiede account Apple Developer)
```bash
eas build --platform ios --profile preview
```

### Build per entrambe le piattaforme
```bash
eas build --platform all --profile production
```

### Bundle Identifier richiesto da EAS
- **Android App ID:** `com.daniele24.personalchef`
- **iOS Bundle ID:** `com.daniele24.personalchef`

> ⚠️ Niente underscore (`_`) né maiuscole nei Bundle ID iOS.

---

## 🔧 6. Git & GitHub

### Salvare le modifiche e caricarle su GitHub
```bash
git add .
git commit -m "Descrizione delle modifiche"
git push origin main
```

### Vedere le ultime modifiche
```bash
git log --oneline -10
```

### Scaricare aggiornamenti dal repo remoto
```bash
git pull origin main
```

---

## 🧹 7. Pulizia della Cache (quando qualcosa va storto)

### Pulizia cache Metro e Node (sul Mac)
```bash
rm -rf $TMPDIR/metro-cache
rm -rf node_modules/.cache
npx expo start -c --lan
```

### Pulizia totale e reinstallazione dipendenze
```bash
rm -rf node_modules
npm install
npx expo start -c --lan
```

### Pulizia cache su Expo Go (telefono)
- **iPhone/Android:** Disinstalla Expo Go → Reinstallalo dallo store → Scansiona di nuovo il QR code.

---

## 🏗️ 8. Struttura del Progetto

```
PERSONAL_CHEF/
├── app/                      # Schermate (Expo Router)
│   ├── (tabs)/               # Tab principali (Food, Materiali, Ricette, Eventi)
│   ├── event/
│   │   ├── [id].tsx          # Dettaglio evento + checklist + elimina
│   │   └── new.tsx           # Creazione nuovo evento
│   ├── recipe/[id].tsx       # Dettaglio ricetta
│   └── modals/               # Modali (aggiungi ingrediente, lotto, ecc.)
├── src/
│   ├── hooks/                # Hook dati (TanStack Query)
│   │   ├── useEvents.ts      # CRUD eventi (add, update, close, delete)
│   │   ├── useIngredients.ts
│   │   ├── useRecipes.ts
│   │   ├── useEquipment.ts
│   │   └── useKits.ts        # Fetch kit da Supabase
│   ├── store/
│   │   └── useMockDataStore.ts  # Dati locali per Mock Mode (Zustand)
│   ├── services/
│   │   └── supabase.ts       # Client Supabase + flag isMockMode
│   ├── utils/
│   │   ├── eventLogic.ts     # Calcolo fabbisogno, FEFO, costi
│   │   └── pdfExport.ts      # Esportazione PDF prep-sheet
│   └── theme/
│       └── constants.ts      # Colori, spaziature, tipografia
├── supabase_schema.sql       # Schema DB completo
├── seed.ts                   # Script per popolare Supabase con dati di esempio
├── .env                      # Chiavi Supabase (NON committare su GitHub!)
└── GUIDA_TECNICA.md          # Questo documento
```

---

## � 9. Note Tecniche

### Mock Mode vs Supabase Live
L'app controlla all'avvio se le variabili `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` sono valide.
- **Mock Mode** (nessuna connessione): dati salvati in memoria locale tramite Zustand, si perdono alla chiusura dell'app.
- **Live Mode**: tutti i dati vengono letti e scritti su Supabase in tempo reale.

### Logica FEFO (First Expired, First Out)
Quando un evento viene **chiuso**, il sistema scarica lo stock partendo dai lotti con la scadenza più vicina. Implementata in `src/utils/eventLogic.ts` → funzione `deductStockFEFO`.

### Calcolo Costi
Il costo di ogni ricetta/evento è calcolato dinamicamente usando l'ultimo prezzo di acquisto registrato nei lotti degli ingredienti (`src/utils/eventLogic.ts` → `calculateEventCost`).

### Eliminare un Evento
Dalla schermata di dettaglio evento, premi l'icona 🗑️ rossa in alto a destra. Viene mostrato un dialogo di conferma prima di procedere. L'eliminazione cancella anche tutte le righe collegate (menu items, kit, missing items).
