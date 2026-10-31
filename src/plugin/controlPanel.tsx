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
      visibility: ({ controls }: any) => controls?.hub_mode?.value === 'dataset',
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
            name: 'hub_mode',
            config: {
              type: 'SelectControl',
              label: t('Mode'),
              default: 'tags',
              clearable: false,
              // No renderTrigger: dataset mode changes the query.
              choices: [
                ['tags', t('Tiles from Superset tags')],
                ['list', t('Tiles from a slug list')],
                ['dataset', t('Tiles from dataset rows')],
                ['breadcrumb', t('Breadcrumb to the homepage')],
              ],
              description: t(
                'Tag and list modes read the dashboards at runtime and show only those the user can access. For these modes any dataset is enough.',
              ),
            },
          },
        ],
        [
          {
            name: 'hub_tags',
            config: {
              type: 'SelectControl',
              multi: true,
              freeForm: true,
              label: t('Tag'),
              default: [],
              renderTrigger: true,
              choices: [],
              description: t(
                'Exact Superset tag names (requires the TAGGING_SYSTEM flag). Dashboards with any of these tags appear as tiles.',
              ),
              visibility: ({ controls }: any) => controls?.hub_mode?.value === 'tags',
            },
          },
        ],
        [
          {
            name: 'hub_slugs',
            config: {
              type: 'SelectControl',
              multi: true,
              freeForm: true,
              label: t('Dashboard slugs'),
              default: [],
              renderTrigger: true,
              choices: [],
              description: t('Slug (o id) nell\'ordine in cui devono comparire.'),
              visibility: ({ controls }: any) => controls?.hub_mode?.value === 'list',
            },
          },
        ],
        columnControl('title_column', 'Title column', 'Tile title.'),
        columnControl('slug_column', 'Dashboard slug column', 'Slug of the target dashboard. Rows without a slug are ignored.'),
        columnControl('group_column', 'Group column', 'Groups the tiles (e.g. section).'),
        columnControl('description_column', 'Description column', 'Text under the title.'),
        columnControl('icon_column', 'Icon column', 'Icon name: dashboard, chart, table, heart, users, calendar, map, shield, flask, clock.'),
        columnControl('order_column', 'Order column', 'Ascending numeric order.'),
        columnControl('status_column', 'Status column', 'Status shown as a label on the tile.'),
      ],
    },
    {
      label: t('Aspetto'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'grid_columns',
            config: {
              type: 'SliderControl',
              label: t('Columns'),
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
              label: t('Group by'),
              default: 'none',
              clearable: false,
              renderTrigger: true,
              choices: [
                ['none', t('No group')],
                ['tag', t('Tag')],
                ['group', t('Group column')],
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
              label: t('Home label (breadcrumb)'),
              default: 'Home',
              renderTrigger: true,
              visibility: ({ controls }: any) => controls?.hub_mode?.value === 'breadcrumb',
            },
          },
        ],
        [
          {
            name: 'fallback_home_slug',
            config: {
              type: 'TextControl',
              label: t('Fallback homepage slug (breadcrumb)'),
              default: '',
              renderTrigger: true,
              description: t('Used when the /api/v1/homepage/ API is not installed.'),
              visibility: ({ controls }: any) => controls?.hub_mode?.value === 'breadcrumb',
            },
          },
        ],
      ],
    },
  ],
};

export default config;
