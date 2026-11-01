export type HubMode = 'tags' | 'list' | 'dataset' | 'breadcrumb';

export interface TileOverride {
  title?: string;
  description?: string;
  group?: string;
  icon?: string;
  order?: number;
  hidden?: boolean;
}

export interface NavigationHubFormData {
  mode: HubMode;
  tags: string[];
  slugs: string[];
  /** Dataset mode: mapping of dataset columns to tile fields. */
  titleColumn?: string;
  slugColumn?: string;
  groupColumn?: string;
  descriptionColumn?: string;
  iconColumn?: string;
  orderColumn?: string;
  statusColumn?: string;
  /** JSON object keyed by dashboard slug, see TileOverride. */
  overridesJson?: string;
  columns: number;
  groupBy: 'none' | 'tag' | 'group';
  /** Breadcrumb mode: label of the first crumb and fallback homepage slug. */
  homeLabel?: string;
  fallbackHomeSlug?: string;
}

export interface Tile {
  slug: string;
  title: string;
  description?: string;
  group?: string;
  icon?: string;
  order: number;
  status?: string;
  tag?: string;
}

export interface TileGroup {
  name: string;
  tiles: Tile[];
}

export interface NavigationHubProps {
  width: number;
  height: number;
  formData: NavigationHubFormData;
  /** Tiles already known at transform time (dataset mode). */
  datasetTiles: Tile[];
  /** Theme of the host Superset, for colors and radius. */
  theme?: Record<string, any>;
}

export interface DashboardSummary {
  id: number;
  slug: string | null;
  dashboard_title: string;
  description?: string | null;
  tags?: { name: string }[];
}
