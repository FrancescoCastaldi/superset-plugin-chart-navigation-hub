import { ControlPanelConfig } from '@superset-ui/chart-controls';

const t = (str: string) => str;

const columnChoices = ({ datasource }: any) => ({
  choices: (datasource?.columns ?? []).map((c: any) => [
    c.column_name,
    c.verbose_name || c.column_name,
  ]),
});

const columnControl = (name: string, label: string, description: string) => [
  {
    name,
    config: {
      type: 'SelectControl',
      label: t(label),
      description: t(description),
      default: null,
      clearable: true,
      mapStateToProps: columnChoices,
      visibility: ({ controls }: any) => controls?.mode?.value === 'dataset',
    },
  },
];

const config: ControlPanelConfig = {
  controlPanelSections: [
    {
      label: t('Navigation Hub'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'mode',
            config: {
              type: 'SelectControl',
              label: t('Modalità'),
              default: 'tags',
              clearable: false,
              renderTrigger: true,
              choices: [
                ['tags', t('Tessere da tag Superset')],
                ['list', t('Tessere da elenco di slug')],
                ['dataset', t('Tessere da righe del dataset')],
                ['breadcrumb', t('Briciole verso la homepage')],
              ],
              description: t(
                'Tag e elenco leggono le dashboard a runtime e mostrano solo quelle a cui l\'utente ha accesso. Per queste modalità basta un dataset qualsiasi.',
              ),
            },
          },
        ],
        [
          {
            name: 'tags',
            config: {
              type: 'SelectControl',
              multi: true,
              freeForm: true,
              label: t('Tag'),
              default: [],
              renderTrigger: true,
              choices: [],
              description: t('Nomi dei tag Superset. Le dashboard con uno qualsiasi dei tag compaiono come tessere.'),
              visibility: ({ controls }: any) => controls?.mode?.value === 'tags',
            },
          },
        ],
        [
          {
            name: 'slugs',
            config: {
              type: 'SelectControl',
              multi: true,
              freeForm: true,
              label: t('Slug delle dashboard'),
              default: [],
              renderTrigger: true,
              choices: [],
              description: t('Slug (o id) nell\'ordine in cui devono comparire.'),
              visibility: ({ controls }: any) => controls?.mode?.value === 'list',
            },
          },
        ],
        columnControl('title_column', 'Colonna titolo', 'Titolo della tessera.'),
        columnControl('slug_column', 'Colonna slug dashboard', 'Slug della dashboard di destinazione. Le righe senza slug sono ignorate.'),
        columnControl('group_column', 'Colonna gruppo', 'Raggruppa le tessere (es. sezione).'),
        columnControl('description_column', 'Colonna descrizione', 'Testo sotto il titolo.'),
        columnControl('icon_column', 'Colonna icona', 'Nome icona: dashboard, chart, table, heart, users, calendar, map, shield, flask, clock.'),
        columnControl('order_column', 'Colonna ordine', 'Ordinamento numerico crescente.'),
        columnControl('status_column', 'Colonna stato', 'Stato mostrato come etichetta sulla tessera.'),
      ],
    },
    {
      label: t('Aspetto'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'columns',
            config: {
              type: 'SliderControl',
              label: t('Colonne'),
              default: 3,
              min: 1,
              max: 6,
              step: 1,
              renderTrigger: true,
            },
          },
        ],
        [
          {
            name: 'group_by',
            config: {
              type: 'SelectControl',
              label: t('Raggruppa per'),
              default: 'none',
              clearable: false,
              renderTrigger: true,
              choices: [
                ['none', t('Nessun gruppo')],
                ['tag', t('Tag')],
                ['group', t('Colonna gruppo')],
              ],
            },
          },
        ],
        [
          {
            name: 'overrides_json',
            config: {
              type: 'TextAreaControl',
              language: 'json',
              label: t('Override per slug (JSON)'),
              default: '',
              renderTrigger: true,
              rows: 8,
              description: t(
                'Esempio: {"report-1": {"title": "Report 1", "order": 1, "group": "Group A", "icon": "heart"}, "draft": {"hidden": true}}',
              ),
            },
          },
        ],
        [
          {
            name: 'home_label',
            config: {
              type: 'TextControl',
              label: t('Etichetta Home (briciole)'),
              default: 'Home',
              renderTrigger: true,
              visibility: ({ controls }: any) => controls?.mode?.value === 'breadcrumb',
            },
          },
        ],
        [
          {
            name: 'fallback_home_slug',
            config: {
              type: 'TextControl',
              label: t('Slug homepage di riserva (briciole)'),
              default: '',
              renderTrigger: true,
              description: t('Usato se l\'API /api/v1/homepage/ non è installata.'),
              visibility: ({ controls }: any) => controls?.mode?.value === 'breadcrumb',
            },
          },
        ],
      ],
    },
  ],
};

export default config;
