import buildQuery from '../src/plugin/buildQuery';
import transformProps from '../src/plugin/transformProps';
import controlPanel from '../src/plugin/controlPanel';
import { tileFromDashboard } from '../src/utils/tiles';

const queries = (formData: Record<string, unknown>) =>
  (buildQuery(formData as any) as any).queries[0];

test('buildQuery asks for a COUNT(*) outside dataset mode', () => {
  const q = queries({ hub_mode: 'tags' });
  expect(q.columns).toEqual([]);
  expect(q.metrics[0].sqlExpression).toBe('COUNT(*)');
  expect(q.row_limit).toBe(1);
});

test('buildQuery asks for the mapped columns in dataset mode, without duplicates', () => {
  const q = queries({
    hub_mode: 'dataset',
    slug_column: 's',
    title_column: 't',
    group_column: 's',
    description_column: null,
  });
  expect(q.columns).toEqual(['t', 's']);
  expect(q.metrics).toEqual([]);
  expect(q.row_limit).toBe(1000);
});

test('transformProps reads camelCase form data and builds dataset tiles', () => {
  const props = transformProps({
    width: 400,
    height: 300,
    formData: {
      hubMode: 'dataset',
      slugColumn: 's',
      titleColumn: 't',
      gridColumns: 9,
      groupBy: 'group',
    },
    queriesData: [{ data: [{ s: 'a', t: 'Alpha' }, { s: '', t: 'x' }] }],
  } as any);
  expect(props.formData.mode).toBe('dataset');
  expect(props.formData.columns).toBe(6); // limitato a 6
  expect(props.datasetTiles).toEqual([
    expect.objectContaining({ slug: 'a', title: 'Alpha' }),
  ]);
});

test('transformProps tolerates snake_case and missing values', () => {
  const props = transformProps({
    width: 1,
    height: 1,
    formData: { hub_mode: 'tags', hub_tags: ['x', 2], grid_columns: 'oops' },
    queriesData: [],
  } as any);
  expect(props.formData.tags).toEqual(['x', '2']);
  expect(props.formData.slugs).toEqual([]);
  expect(props.formData.columns).toBe(3);
  expect(props.datasetTiles).toEqual([]);
});

test('control names avoid the standard formData keys mode, tags and columns', () => {
  const names = (controlPanel.controlPanelSections as any[])
    .flatMap(section => section.controlSetRows.flat())
    .map((control: any) => control.name);
  expect(names).toEqual(
    expect.arrayContaining(['hub_mode', 'hub_tags', 'hub_slugs', 'grid_columns']),
  );
  expect(names).not.toEqual(expect.arrayContaining(['mode']));
  expect(names).not.toEqual(expect.arrayContaining(['tags']));
  expect(names).not.toEqual(expect.arrayContaining(['columns']));
});

test('tileFromDashboard uses the slug as title when the title is missing', () => {
  expect(tileFromDashboard({ slug: 'x' } as any)).toMatchObject({ slug: 'x', title: 'x' });
  expect(tileFromDashboard({} as any)).toBeNull();
});

test('transformProps hands the host theme to the component', () => {
  const props = transformProps({ width: 10, height: 10, formData: {}, queriesData: [{ data: [] }], theme: { colorPrimary: '#123456' } } as any);
  expect(props.theme).toEqual({ colorPrimary: '#123456' });
});
