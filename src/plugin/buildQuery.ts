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
 * Tag, list and breadcrumb modes read no rows, but still need a valid query,
 * so a COUNT(*) is requested. In dataset mode the mapped columns are requested.
 *
 * The controls are named hub_* and grid_columns: `mode`, `tags` and `columns`
 * clash with standard formData keys (in particular `columns` is the list
 * of query columns).
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
