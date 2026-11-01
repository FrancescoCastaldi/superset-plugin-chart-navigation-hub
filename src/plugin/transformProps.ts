import { ChartProps } from '@superset-ui/core';
import { NavigationHubFormData, NavigationHubProps } from '../types';
import { tilesFromRows } from '../utils/tiles';

const clampColumns = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(6, Math.max(1, Math.round(n))) : 3;
};

const asArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [];

/** ChartProps exposes formData in camelCase, while tests and other callers use snake_case. */
export default function transformProps(chartProps: ChartProps): NavigationHubProps {
  const { width, height, formData, queriesData } = chartProps as any;
  const fd = formData as Record<string, any>;

  const hub: NavigationHubFormData = {
    mode: fd.hubMode ?? fd.hub_mode ?? 'tags',
    tags: asArray(fd.hubTags ?? fd.hub_tags),
    slugs: asArray(fd.hubSlugs ?? fd.hub_slugs),
    titleColumn: fd.titleColumn ?? fd.title_column ?? undefined,
    slugColumn: fd.slugColumn ?? fd.slug_column ?? undefined,
    groupColumn: fd.groupColumn ?? fd.group_column ?? undefined,
    descriptionColumn: fd.descriptionColumn ?? fd.description_column ?? undefined,
    iconColumn: fd.iconColumn ?? fd.icon_column ?? undefined,
    orderColumn: fd.orderColumn ?? fd.order_column ?? undefined,
    statusColumn: fd.statusColumn ?? fd.status_column ?? undefined,
    overridesJson: fd.overridesJson ?? fd.overrides_json ?? '',
    columns: clampColumns(fd.gridColumns ?? fd.grid_columns),
    groupBy: fd.groupBy ?? fd.group_by ?? 'none',
    homeLabel: fd.homeLabel ?? fd.home_label ?? 'Home',
    fallbackHomeSlug: fd.fallbackHomeSlug ?? fd.fallback_home_slug ?? '',
  };

  const rows = (queriesData?.[0]?.data ?? []) as Record<string, unknown>[];
  return {
    width,
    height,
    formData: hub,
    datasetTiles: hub.mode === 'dataset' ? tilesFromRows(rows, hub) : [],
    theme: (chartProps as any).theme,
  };
}
