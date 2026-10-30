# superset-plugin-chart-navigation-hub

Chart plugin `navigation_hub` per Apache Superset 6.1.0. Trasforma una dashboard in una pagina indice a tessere, oppure mostra le briciole "Home > dashboard corrente". Funziona da solo e si abbina a `superset-homepage`.

## Modalità

| Modalità | Sorgente delle tessere | Permessi |
|:---|:---|:---|
| Tag | Dashboard che hanno uno dei tag indicati (`/api/v1/dashboard/` con filtro `dashboard_tags`) | Superset nasconde le dashboard non accessibili |
| Elenco | Slug (o id) nell'ordine indicato, una chiamata per dashboard | Le dashboard non accessibili o inesistenti non compaiono |
| Dataset | Righe del dataset, con le colonne mappate su titolo, slug, gruppo, descrizione, icona, ordine, stato | Le righe non sono filtrate per permessi |
| Briciole | Homepage letta da `/api/v1/homepage/` (se `superset-homepage` è installato), altrimenti lo slug di riserva | Come la dashboard corrente |

Per le modalità senza dataset serve comunque un dataset qualsiasi: il plugin chiede un `COUNT(*)`.

## Aspetto

* Raggruppamento per tag o per colonna gruppo, da 1 a 6 colonne.
* Colori e raggio dai token del tema di Superset.
* Override per slug in JSON: `{"report-1": {"title": "Report 1", "order": 1, "group": "Group A", "icon": "heart"}, "draft": {"hidden": true}}`.
* Icone: `dashboard`, `chart`, `table`, `heart`, `users`, `calendar`, `map`, `shield`, `flask`, `clock`.
* Le tessere sono link normali: aprono la dashboard nella stessa scheda con un ricaricamento di pagina.

## Installazione

```powershell
.\install-plugin.ps1 -SupersetPath <cartella superset>
```

Lo script copia il plugin in `superset-frontend/plugins/`, registra `NavigationHubChartPlugin` in `MainPreset.ts` (idempotente, con backup) e pulisce la cache. Poi ricompilare il frontend di Superset.

## Sviluppo

```powershell
npm install
npm test
npm run build
```

I controlli del pannello si chiamano `hub_mode`, `hub_tags`, `hub_slugs` e `grid_columns`: `mode`, `tags` e `columns` collidono con chiavi standard di formData (`columns` è la lista di colonne della query).
