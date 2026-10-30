import {
  DashboardSummary,
  NavigationHubFormData,
  Tile,
  TileGroup,
  TileOverride,
} from '../types';

const UNGROUPED = '';

/** Rison string literal: '...' with ! and ' escaped by !. */
export const risonString = (value: string): string =>
  `'${value.replace(/!/g, '!!').replace(/'/g, "!'")}'`;

export const dashboardListQuery = (tag: string, pageSize = 100): string =>
  `(columns:!(id,slug,dashboard_title,description,tags.name),` +
  `filters:!((col:tags,opr:dashboard_tags,value:${risonString(tag)})),` +
  `order_column:dashboard_title,order_direction:asc,page_size:${pageSize})`;

export const dashboardUrl = (slug: string): string =>
  `/superset/dashboard/${encodeURIComponent(slug)}/`;

export const parseOverrides = (json?: string): Record<string, TileOverride> => {
  if (!json || !json.trim()) return {};
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

export const tileFromDashboard = (
  dashboard: DashboardSummary,
  tag?: string,
): Tile | null => {
  const slug = dashboard.slug || (dashboard.id != null ? String(dashboard.id) : '');
  if (!slug) return null;
  return {
    slug,
    title: dashboard.dashboard_title || slug,
    description: dashboard.description || undefined,
    order: Number.MAX_SAFE_INTEGER,
    tag: tag ?? dashboard.tags?.[0]?.name,
  };
};

export const mergeOverrides = (
  tiles: Tile[],
  overrides: Record<string, TileOverride>,
): Tile[] =>
  tiles
    .filter(tile => !overrides[tile.slug]?.hidden)
    .map(tile => {
      const o = overrides[tile.slug];
      if (!o) return tile;
      return {
        ...tile,
        title: o.title ?? tile.title,
        description: o.description ?? tile.description,
        group: o.group ?? tile.group,
        icon: o.icon ?? tile.icon,
        order: o.order ?? tile.order,
      };
    });

export const uniqueBySlug = (tiles: Tile[]): Tile[] => {
  const seen = new Set<string>();
  return tiles.filter(tile => {
    if (seen.has(tile.slug)) return false;
    seen.add(tile.slug);
    return true;
  });
};

const byOrderThenTitle = (a: Tile, b: Tile): number =>
  a.order - b.order || a.title.localeCompare(b.title, 'it');

export const groupTiles = (
  tiles: Tile[],
  groupBy: NavigationHubFormData['groupBy'],
): TileGroup[] => {
  const sorted = [...tiles].sort(byOrderThenTitle);
  if (groupBy === 'none') return [{ name: UNGROUPED, tiles: sorted }];
  const groups = new Map<string, Tile[]>();
  sorted.forEach(tile => {
    const key = (groupBy === 'tag' ? tile.tag : tile.group) ?? UNGROUPED;
    groups.set(key, [...(groups.get(key) ?? []), tile]);
  });
  return [...groups.entries()]
    .sort(([a], [b]) =>
      a === b ? 0 : a === UNGROUPED ? 1 : b === UNGROUPED ? -1 : a.localeCompare(b, 'it'),
    )
    .map(([name, groupTilesList]) => ({ name, tiles: groupTilesList }));
};

type Row = Record<string, unknown>;

export const tilesFromRows = (
  rows: Row[],
  formData: NavigationHubFormData,
): Tile[] => {
  const pick = (row: Row, column?: string): string | undefined => {
    if (!column) return undefined;
    const value = row[column];
    return value === null || value === undefined || value === ''
      ? undefined
      : String(value);
  };
  const tiles: Tile[] = [];
  rows.forEach(row => {
    const slug = pick(row, formData.slugColumn);
    if (!slug) return;
    const order = Number(pick(row, formData.orderColumn));
    tiles.push({
      slug,
      title: pick(row, formData.titleColumn) ?? slug,
      description: pick(row, formData.descriptionColumn),
      group: pick(row, formData.groupColumn),
      icon: pick(row, formData.iconColumn),
      status: pick(row, formData.statusColumn),
      order: Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER,
    });
  });
  return uniqueBySlug(tiles);
};

export interface Crumb {
  label: string;
  url?: string;
}

/** Briciole "Home > dashboard corrente". La Home non viene ripetuta se coincide. */
export const buildCrumbs = (
  homeLabel: string,
  homeSlug: string | null,
  currentSlug: string | null,
  currentTitle: string,
): Crumb[] => {
  const atHome = homeSlug !== null && homeSlug === currentSlug;
  if (!homeSlug || atHome) return [{ label: currentTitle }];
  return [
    { label: homeLabel, url: dashboardUrl(homeSlug) },
    { label: currentTitle },
  ];
};

/** Slug della dashboard corrente da un pathname /superset/dashboard/<slug>/. */
export const currentSlugFromPath = (pathname: string): string | null => {
  const match = pathname.match(/\/superset\/dashboard\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};
