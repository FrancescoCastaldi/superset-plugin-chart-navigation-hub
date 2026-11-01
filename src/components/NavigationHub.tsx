import React, { CSSProperties, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SupersetClient } from '@superset-ui/core';
import {
  DashboardSummary,
  NavigationHubProps,
  Tile,
} from '../types';
import {
  buildCrumbs,
  currentSlugFromPath,
  dashboardListQuery,
  dashboardUrl,
  groupTiles,
  hasTag,
  TAG_PAGE_SIZE,
  mergeOverrides,
  parseOverrides,
  tileFromDashboard,
  uniqueBySlug,
} from '../utils/tiles';
import { Icon } from './icons';

type Status = 'loading' | 'ready' | 'error';

const getJson = async (endpoint: string) => {
  const { json } = await SupersetClient.get({ endpoint });
  return json as any;
};

const MAX_TAG_PAGES = 20;

async function fetchByTag(tag: string): Promise<Tile[]> {
  const tiles: Tile[] = [];
  for (let page = 0; page < MAX_TAG_PAGES; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const json = await getJson(
      `/api/v1/dashboard/?q=${encodeURIComponent(dashboardListQuery(tag, page))}`,
    );
    const rows = (json.result ?? []) as DashboardSummary[];
    rows
      .filter(row => hasTag(row, tag))
      .forEach(row => {
        const tile = tileFromDashboard(row, tag);
        if (tile) tiles.push(tile);
      });
    if (rows.length < TAG_PAGE_SIZE) break;
  }
  return tiles;
}

async function fetchByTags(tags: string[]): Promise<Tile[]> {
  return uniqueBySlug((await Promise.all(tags.map(fetchByTag))).flat());
}

async function fetchBySlugs(slugs: string[]): Promise<Tile[]> {
  const results = await Promise.all(
    slugs.map(async (slug, index) => {
      try {
        const json = await getJson(`/api/v1/dashboard/${encodeURIComponent(slug)}`);
        const tile = tileFromDashboard({ ...json.result, slug: json.result?.slug ?? slug });
        return tile ? { ...tile, order: index } : null;
      } catch {
        return null; // missing or not accessible: the tile does not appear
      }
    }),
  );
  return results.filter((tile): tile is Tile => tile !== null);
}

// The theme reaches the chart through its props: `useTheme` is exported from different packages
// depending on the Superset version, so the plugin does not import it.
const HubThemeContext = createContext<Record<string, any>>({});

function useStyles() {
  const theme = useContext(HubThemeContext);
  return useMemo(() => {
    const primary = theme?.colorPrimary ?? '#2893B3';
    const bg = theme?.colorBgContainer ?? '#ffffff';
    const border = theme?.colorBorderSecondary ?? theme?.colorBorder ?? '#d9dee3';
    const text = theme?.colorText ?? '#1f2933';
    const muted = theme?.colorTextSecondary ?? '#5f6b76';
    const radius = theme?.borderRadius ?? 8;
    const root: CSSProperties = { overflow: 'auto', color: text, boxSizing: 'border-box', padding: 8 };
    const card: CSSProperties = {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      padding: 16,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: radius,
      color: text,
      textDecoration: 'none',
    };
    return { primary, border, muted, root, card };
  }, [theme]);
}

function Tiles({ formData, datasetTiles, width, height }: NavigationHubProps) {
  const styles = useStyles();
  const [fetched, setFetched] = useState<Tile[]>([]);
  const [status, setStatus] = useState<Status>(
    formData.mode === 'dataset' ? 'ready' : 'loading',
  );
  const tagsKey = JSON.stringify(formData.tags);
  const slugsKey = JSON.stringify(formData.slugs);

  useEffect(() => {
    if (formData.mode === 'dataset') {
      setStatus('ready');
      return undefined;
    }
    let cancelled = false;
    setStatus('loading');
    const load =
      formData.mode === 'tags'
        ? fetchByTags(formData.tags)
        : fetchBySlugs(formData.slugs);
    load
      .then(tiles => {
        if (cancelled) return;
        setFetched(tiles);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
    // tagsKey and slugsKey represent the content of the arrays
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.mode, tagsKey, slugsKey]);

  const groups = useMemo(() => {
    const base = formData.mode === 'dataset' ? datasetTiles : fetched;
    const merged = mergeOverrides(base, parseOverrides(formData.overridesJson));
    return groupTiles(merged, formData.groupBy);
  }, [formData, datasetTiles, fetched]);

  if (status === 'loading') return <div style={{ ...styles.root, width, height }}>…</div>;
  if (status === 'error')
    return <div style={{ ...styles.root, width, height }}>Could not load the dashboards.</div>;
  if (groups.every(g => g.tiles.length === 0))
    return <div style={{ ...styles.root, width, height, color: styles.muted }}>No dashboards available.</div>;

  return (
    <div style={{ ...styles.root, width, height }}>
      {groups.map(group => (
        <section key={group.name || '_'} style={{ marginBottom: 20 }}>
          {group.name ? (
            <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>{group.name}</h3>
          ) : null}
          <div
            style={{
              display: 'grid',
              gap: 12,
              gridTemplateColumns: `repeat(${formData.columns}, minmax(0, 1fr))`,
            }}
          >
            {group.tiles.map(tile => (
              <a key={tile.slug} href={dashboardUrl(tile.slug)} style={styles.card}>
                <span style={{ color: styles.primary, flex: '0 0 auto' }}>
                  <Icon name={tile.icon} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block' }}>{tile.title}</strong>
                  {tile.description ? (
                    <span style={{ display: 'block', fontSize: 13, color: styles.muted, marginTop: 4 }}>
                      {tile.description}
                    </span>
                  ) : null}
                  {tile.status ? (
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: 8,
                        padding: '1px 8px',
                        fontSize: 12,
                        border: `1px solid ${styles.border}`,
                        borderRadius: 999,
                        color: styles.muted,
                      }}
                    >
                      {tile.status}
                    </span>
                  ) : null}
                </span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Breadcrumbs({ formData, width, height }: NavigationHubProps) {
  const styles = useStyles();
  const [homeSlug, setHomeSlug] = useState<string | null>(formData.fallbackHomeSlug || null);
  const [title, setTitle] = useState<string>('');
  const currentSlug = currentSlugFromPath(window.location.pathname);

  useEffect(() => {
    let cancelled = false;
    getJson('/api/v1/homepage/')
      .then(json => {
        const home = json.result;
        if (!cancelled && home) setHomeSlug(home.slug ?? String(home.id));
      })
      .catch(() => undefined); // API not installed: the fallback slug stays
    if (currentSlug) {
      getJson(`/api/v1/dashboard/${encodeURIComponent(currentSlug)}`)
        .then(json => !cancelled && setTitle(json.result?.dashboard_title ?? ''))
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  const crumbs = buildCrumbs(
    formData.homeLabel || 'Home',
    homeSlug,
    currentSlug,
    title || document.title,
  );

  return (
    <nav aria-label="breadcrumb" style={{ ...styles.root, width, height, display: 'flex', alignItems: 'center', gap: 8 }}>
      {crumbs.map((crumb, index) => (
        <React.Fragment key={`${crumb.label}-${index}`}>
          {index > 0 ? <span style={{ color: styles.muted }}>›</span> : null}
          {crumb.url ? (
            <a href={crumb.url} style={{ color: styles.primary }}>
              {crumb.label}
            </a>
          ) : (
            <span aria-current="page">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default function NavigationHub(props: NavigationHubProps) {
  return (
    <HubThemeContext.Provider value={props.theme ?? {}}>
      {props.formData.mode === 'breadcrumb' ? <Breadcrumbs {...props} /> : <Tiles {...props} />}
    </HubThemeContext.Provider>
  );
}
