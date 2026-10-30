# Changelog

Formato Keep a Changelog 1.1.0, versioni SemVer.

## [Unreleased]

### Added
* Plugin `navigation_hub` con modalità tag, elenco, dataset e briciole.

### Fixed
* L'installer aggiunge `@deck.gl/widgets` alle dipendenze di Superset 6.1.0 RC3, dove manca e fa fallire la build webpack.
* La modalità tag filtra per nome esatto del tag (il filtro dell'API è un ILIKE su sottostringa) e pagina i risultati.
* Non si richiede più la colonna `description`, assente dall'elenco dell'API dashboard.
* Il cambio di modalità rilancia la query (era `renderTrigger`).
* Controlli rinominati `hub_mode`, `hub_tags`, `hub_slugs`, `grid_columns` per non collidere con `mode`, `tags` e `columns` di formData.
* Una dashboard senza titolo usa lo slug invece di rompere l'ordinamento.
