# codemap: superset-plugin-chart-navigation-hub

| Percorso | Contenuto |
|:---|:---|
| `src/plugin/index.ts` | `NavigationHubChartPlugin` (metadata, registrazione). |
| `src/plugin/controlPanel.tsx` | Controlli `hub_*`, `grid_columns`, mappatura colonne, override JSON. |
| `src/plugin/buildQuery.ts` | `COUNT(*)` fuori dalla modalità dataset, colonne mappate in dataset. |
| `src/plugin/transformProps.ts` | Normalizza formData (camelCase e snake_case) e costruisce le tessere del dataset. |
| `src/components/NavigationHub.tsx` | Tessere (fetch per tag o slug) e briciole. |
| `src/components/icons.tsx` | Set di icone SVG generiche. |
| `src/utils/tiles.ts` | Funzioni pure: rison, override, raggruppamento, righe in tessere, briciole. |
| `test/` | Test jest delle funzioni pure e del plugin (con double di `@superset-ui/core`). |
| `install-plugin.ps1`, `install.bat` | Copia in `superset-frontend/plugins/` e registra in `MainPreset.ts`. |
