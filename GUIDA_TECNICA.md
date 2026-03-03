# Guida Tecnica: PERSONAL_CHEF

Questa guida fornisce le istruzioni necessarie per configurare, avviare e navigare nel progetto PERSONAL_CHEF.

## 🚀 Come Avviare il Progetto

Il progetto è basato su **Expo** (React Native). Assicurati di avere Node.js installato.

### 1. Installazione Dipendenze
Apri il terminale nella cartella del progetto ed esegui:
```bash
npm install
```

### 2. Avvio in Modalità Sviluppo
Esegui il comando:
```bash
npx expo start
```
Una volta avviato, puoi scegliere come visualizzare l'app:
- Premi **`i`** per caricarla nel simulatore iOS (se su Mac con Xcode).
- Premi **`a`** per caricarla nell'emulatore Android.
- Premi **`w`** per aprirla nel browser (modalità Web).
- Scansiona il **QR Code** con l'app "Expo Go" sul tuo smartphone per testarla live.

---

## 🏗️ Struttura del Progetto

-   **`app/`**: Contiene le schermate (schermate basate su file routing di Expo Router).
    -   `app/(tabs)/`: Schermate principali della barra di navigazione (Food, Materiali, Ricette, Eventi).
    -   `app/event/[id].tsx`: Dettaglio evento e checklist preparazione.
    -   `app/recipe/[id].tsx`: Dettaglio ricetta, ingredienti per porzione e calcolo costi.
    -   `app/modals/`: Modali per aggiunta rapida (Ingredienti, Lotti, Shopping List).
-   **`src/`**: Core logico dell'applicazione.
    -   `src/hooks/`: Hook personalizzati per la gestione dei dati (TanStack Query) per Eventi, Ingredienti, Ricette.
    -   `src/store/`: Gestione dello stato globale (Zustand). Include `useMockDataStore.ts` per il funzionamento offline/demo.
    -   `src/utils/`: Logiche di business.
        -   `eventLogic.ts`: Calcolo fabbisogno, logica FEFO (scadenza lotti) e calcolo costi.
        -   `pdfExport.ts`: Generazione di Prep-Sheets e Liste della Spesa in PDF.
    -   `src/services/`: Configurazione Supabase.
-   **`supabase_schema.sql`**: Schema del database per la produzione.
-   **`seed_data.sql`**: Dati di esempio per popolare il database.

---

## 🛠️ Note Tecniche Importanti

### Modalità Mock vs Real DB
L'app è configurata per funzionare in **Mock Mode** se non rileva le chiavi di Supabase. In questa modalità, i dati vengono salvati temporaneamente nella memoria del dispositivo tramite Zustand (`useMockDataStore.ts`).

### Logica FEFO (First Expired, First Out)
Quando un evento viene chiuso, il sistema scarica lo stock partendo dai lotti con la data di scadenza più vicina. Questa logica è implementata in `src/utils/eventLogic.ts`.

### Calcolo Costi
Il costo di una ricetta o di un evento viene calcolato dinamicamente guardando l'ultimo prezzo di acquisto registrato nei lotti degli ingredienti.
