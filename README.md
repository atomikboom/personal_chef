# Personal Chef Assistant

Benvenuto nel tuo assistente operativo! Questa app ti aiuta a gestire il magazzino e gli eventi in modo professionale.

## Configurazione Iniziale
1. **Supabase**: Carica lo script `supabase_schema.sql` nel tuo progetto Supabase.
2. **Ambiente**: Copia `.env.example` in `.env` e inserisci le tue chiavi Supabase.
3. **Login**: Usa le credenziali admin per il primo accesso.
   - Username: `admin`
   - Password: `admin123`

## Flusso Principale
1. **Magazzino**: Aggiungi ingredienti e attrezzature.
2. **Ricette**: Crea le tue ricette specificando ingredienti per porzione.
3. **Eventi**: Crea un evento e seleziona il menù. L'app calcolerà automaticamente tutto ciò che serve, scalando lo stock (FEFO) e segnalando i mancanti.
4. **Export**: Genera la checklist PDF per la spesa o per il carico materiali.

## Limitazioni Note
- Il login è un "gate" puramente locale per la preview.
- Le RLS su Supabase non sono configurate per l'auth multi-utente in questo MVP.
- La chiusura evento (ripristino materiali) è semplificata come stato UI.
