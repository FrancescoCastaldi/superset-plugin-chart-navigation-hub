import { buildQueryContext, QueryFormData } from '@superset-ui/core';

const DATASET_COLUMN_KEYS = [
  'title_column',
  'slug_column',
  'group_column',
  'description_column',
  'icon_column',
  'order_column',
  'status_column',
];

/**
 * Tag, elenco e briciole non leggono righe: serve comunque una query valida,
 * quindi si chiede un COUNT(*). In modalità dataset si chiedono le colonne mappate.
 *
 * I controlli si chiamano hub_* e grid_columns: `mode`, `tags` e `columns`
 * collidono con chiavi standard di formData (in particolare `columns` è la lista
 * di colonne della query).
 */
export default function buildQuery(formData: QueryFormData) {
  const fd = formData as Record<string, any>;
  return buildQueryContext(formData, baseQueryObject => {
    if (fd.hub_mode === 'dataset') {
      const columns = [
        ...new Set(DATASET_COLUMN_KEYS.map(key => fd[key]).filter(Boolean)),
      ] as string[];
      return [
        {
          ...baseQueryObject,
          columns,
          metrics: [],
          orderby: [],
          row_limit: 1000,
          is_timeseries: false,
        },
      ];
    }
    return [
      {
        ...baseQueryObject,
        columns: [],
        metrics: [
          {
            expressionType: 'SQL',
            sqlExpression: 'COUNT(*)',
            label: 'hub_count',
          },
        ],
        orderby: [],
        row_limit: 1,
        is_timeseries: false,
      },
    ];
  });
}
