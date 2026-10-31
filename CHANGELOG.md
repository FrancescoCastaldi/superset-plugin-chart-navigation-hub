# Changelog

Keep a Changelog 1.1.0 format, SemVer versioning.

## [Unreleased]

### Added
* `navigation_hub` plugin with tags, list, dataset and breadcrumb modes.

### Fixed
* The installer adds `@deck.gl/widgets` to the Superset 6.1.0 RC3 dependencies, where it is missing and breaks the webpack build.
* Tag mode filters by exact tag name (the API filter is an ILIKE on substrings) and pages through the results.
* The `description` column is no longer requested, because the dashboard API list does not expose it.
* Changing the mode re-runs the query (it used `renderTrigger`).
* Controls renamed to `hub_mode`, `hub_tags`, `hub_slugs` and `grid_columns` so they do not clash with `mode`, `tags` and `columns` in formData.
* A dashboard without a title uses its slug instead of breaking the sort order.
