import { Behavior, ChartMetadata, ChartPlugin } from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from '../images/thumbnail.png';
import example from '../images/example.png';

const t = (str: string) => str;

const metadata = new ChartMetadata({
  name: t('Navigation Hub'),
  description: t(
    'Index page of tiles: lists dashboards by tag, by slug list or by dataset rows, respecting the user\'s permissions. In breadcrumb mode it shows the path to the homepage.',
  ),
  behaviors: [Behavior.InteractiveChart],
  category: t('Navigation'),
  tags: [t('Navigation'), t('Homepage'), t('Menu'), t('Index')],
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
