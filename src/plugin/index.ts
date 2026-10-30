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
    'Pagina indice a tessere: elenca le dashboard per tag, elenco di slug o righe di un dataset, rispettando i permessi dell\'utente. In modalità briciole mostra il percorso verso la homepage.',
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
