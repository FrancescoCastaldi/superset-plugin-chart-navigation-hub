import {
  buildCrumbs,
  currentSlugFromPath,
  dashboardListQuery,
  dashboardUrl,
  groupTiles,
  hasTag,
  mergeOverrides,
  parseOverrides,
  risonString,
  tileFromDashboard,
  tilesFromRows,
  uniqueBySlug,
} from '../src/utils/tiles';
import { NavigationHubFormData, Tile } from '../src/types';

const tile = (slug: string, extra: Partial<Tile> = {}): Tile => ({
  slug,
  title: slug.toUpperCase(),
  order: Number.MAX_SAFE_INTEGER,
  ...extra,
});

const form = (extra: Partial<NavigationHubFormData> = {}): NavigationHubFormData => ({
  mode: 'dataset',
  tags: [],
  slugs: [],
  columns: 3,
  groupBy: 'group',
  ...extra,
});

test('risonString escapes ! and quotes', () => {
  expect(risonString("a'b!c")).toBe("'a!'b!!c'");
});

test('dashboardListQuery builds a paged tag filter on existing list columns only', () => {
  const q = dashboardListQuery('area:x', 2);
  expect(q).toContain("filters:!((col:tags,opr:dashboard_tags,value:'area:x'))");
  expect(q).toContain('page:2,page_size:100');
  expect(q).not.toContain('description');
});

test('hasTag matches the exact tag name (the API filter is a substring ILIKE)', () => {
  const d = { id: 1, slug: 'a', dashboard_title: 'A', tags: [{ name: 'area:xy' }] };
  expect(hasTag(d, 'area:x')).toBe(false);
  expect(hasTag(d, 'area:xy')).toBe(true);
  expect(hasTag({ ...d, tags: undefined }, 'area:xy')).toBe(false);
});

test('dashboardUrl encodes the slug', () => {
  expect(dashboardUrl('a b')).toBe('/superset/dashboard/a%20b/');
});

test('parseOverrides tolerates empty and invalid JSON', () => {
  expect(parseOverrides(undefined)).toEqual({});
  expect(parseOverrides('{oops')).toEqual({});
  expect(parseOverrides('[1]')).toEqual({});
  expect(parseOverrides('{"a":{"title":"X"}}')).toEqual({ a: { title: 'X' } });
});

test('tileFromDashboard falls back to id when slug is missing', () => {
  const t = tileFromDashboard({ id: 7, slug: null, dashboard_title: 'T', tags: [{ name: 'g' }] });
  expect(t).toMatchObject({ slug: '7', title: 'T', tag: 'g' });
});

test('mergeOverrides hides, retitles and reorders', () => {
  const tiles = [tile('a'), tile('b')];
  const out = mergeOverrides(tiles, {
    a: { title: 'Alpha', order: 1, group: 'G' },
    b: { hidden: true },
  });
  expect(out).toHaveLength(1);
  expect(out[0]).toMatchObject({ title: 'Alpha', order: 1, group: 'G' });
});

test('uniqueBySlug keeps the first', () => {
  expect(uniqueBySlug([tile('a', { title: '1' }), tile('a', { title: '2' })])).toHaveLength(1);
});

test('groupTiles by group sorts by order then title, ungrouped last', () => {
  const groups = groupTiles(
    [
      tile('c', { group: 'B', order: 2 }),
      tile('a', { group: 'B', order: 1 }),
      tile('z'),
      tile('x', { group: 'A' }),
    ],
    'group',
  );
  expect(groups.map(g => g.name)).toEqual(['A', 'B', '']);
  expect(groups[1].tiles.map(t => t.slug)).toEqual(['a', 'c']);
});

test('groupTiles by tag and none', () => {
  const tiles = [tile('a', { tag: 'T1' }), tile('b', { tag: 'T2' })];
  expect(groupTiles(tiles, 'tag').map(g => g.name)).toEqual(['T1', 'T2']);
  expect(groupTiles(tiles, 'none')).toHaveLength(1);
});

test('tilesFromRows maps columns and skips rows without slug', () => {
  const f = form({
    slugColumn: 's',
    titleColumn: 't',
    groupColumn: 'g',
    orderColumn: 'o',
    statusColumn: 'st',
  });
  const out = tilesFromRows(
    [
      { s: 'report-1', t: 'Report 1', g: 'Group A', o: 2, st: 'active' },
      { s: '', t: 'senza slug' },
      { s: 'report-2', o: 'abc' },
      { s: 'report-1', t: 'duplicato' },
    ],
    f,
  );
  expect(out).toHaveLength(2);
  expect(out[0]).toMatchObject({ slug: 'report-1', title: 'Report 1', group: 'Group A', order: 2, status: 'active' });
  expect(out[1]).toMatchObject({ slug: 'report-2', title: 'report-2', order: Number.MAX_SAFE_INTEGER });
});

test('buildCrumbs links to home unless already there', () => {
  expect(buildCrumbs('Home', 'home-a', 'det-1', 'Dettaglio')).toEqual([
    { label: 'Home', url: '/superset/dashboard/home-a/' },
    { label: 'Dettaglio' },
  ]);
  expect(buildCrumbs('Home', 'home-a', 'home-a', 'Home A')).toEqual([{ label: 'Home A' }]);
  expect(buildCrumbs('Home', null, 'x', 'X')).toEqual([{ label: 'X' }]);
});

test('currentSlugFromPath', () => {
  expect(currentSlugFromPath('/superset/dashboard/my-slug/')).toBe('my-slug');
  expect(currentSlugFromPath('/superset/dashboard/12/?x=1')).toBe('12');
  expect(currentSlugFromPath('/other')).toBeNull();
});
