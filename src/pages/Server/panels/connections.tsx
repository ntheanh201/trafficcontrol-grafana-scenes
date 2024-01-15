import { SceneQueryRunner, PanelBuilders } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { ServerCustomObject } from '../ServerCustomObject';

export const getConnectionsPanel = ({ customObject }: { customObject: ServerCustomObject }) => {
  const defaultConnectionsQuery = [
    {
      refId: 'A',
      query: `SELECT mean(value) FROM "monthly"."connections.1min" WHERE $timeFilter GROUP BY time(60s)`,
      rawQuery: true,
      resultFormat: 'time_series',
      alias: 'connections',
    },
  ];

  const queryRunner2 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [...defaultConnectionsQuery],
  });

  queryRunner2.addActivationHandler(() => {
    const sub = customObject.subscribeToState((newState) => {
      queryRunner2.setState(
        !!newState.name
          ? {
              queries: [
                {
                  ...queryRunner2.state.queries[0],
                  query:
                    'SELECT mean(value) FROM "monthly"."connections.1min" WHERE hostname= \'' +
                    newState.name +
                    `' and $timeFilter GROUP BY time(60s)`,
                },
              ],
            }
          : {
              queries: [...defaultConnectionsQuery],
            }
      );
      queryRunner2.runQueries();

      return () => {
        sub.unsubscribe();
      };
    });
  });

  return PanelBuilders.timeseries()
    .setTitle('Connections')
    .setData(queryRunner2)
    .setCustomFieldConfig('fillOpacity', 20)
    .setOption('legend', { showLegend: true, calcs: ['max'] })
    .setCustomFieldConfig('spanNulls', true)
    .build();
};
