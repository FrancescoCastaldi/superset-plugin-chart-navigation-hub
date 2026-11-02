import { Behavior, ChartMetadata, ChartPlugin } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail.png';
import example from '../images/example.png';

const t = (str: string) => str;

const metadata = new ChartMetadata({
  name: t('StratumNavigation: Navigation Hub'),
  description: t(
    'StratumNavigation Hub: index page of tiles and breadcrumbs to the homepage or other dashboards, respecting user permissions.',
  ),
  behaviors: [Behavior.InteractiveChart],
  category: t('Navigation'),
  tags: [t('Stratum'), t('Navigation'), t('Homepage'), t('Menu'), t('Index')],
  credits: ['Francesco Castaldi'],
  exampleGallery: [{ url: example }],
  thumbnail,
});

export default class NavigationHubChartPlugin extends ChartPlugin {
  constructor() {
    super({
      buildQuery: buildQuery as any,
      controlPanel,
      loadChart: () => import('../components/NavigationHub'),
      metadata,
      transformProps: transformProps as any,
    });
  }
}
