import { SceneQueryRunner, PanelBuilders } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { CacheGroupCustomObject } from '../CacheGroupCustomObject';

export const getConnectionsPanel = ({ customObject }: { customObject: CacheGroupCustomObject }) => {
  const defaultCacheGroupConnectionQuery = {
    refId: 'A',
    query: 'SELECT mean("value") FROM "measurement" WHERE $timeFilter GROUP BY time($__interval) fill(null)',
    rawQuery: false,
    resultFormat: 'time_series',
    policy: 'monthly',
    orderByTime: 'ASC',
    groupBy: [
      {
        type: 'time',
        params: ['$__interval'],
      },
      {
        type: 'tag',
        params: ['hostname::tag'],
      },
      {
        type: 'fill',
        params: ['null'],
      },
    ],
    select: [
      [
        {
          type: 'field',
          params: ['value'],
        },
        {
          type: 'mean',
          params: [],
        },
      ],
    ],
    measurement: 'connections.1min',
  };

  const queryRunner2 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [defaultCacheGroupConnectionQuery],
  });

  queryRunner2.addActivationHandler(() => {
    const sub = customObject.subscribeToState((newState) => {
      queryRunner2.setState(
        !!newState.name
          ? {
              queries: [
                {
                  ...queryRunner2.state.queries[0],
                  tags: [
                    {
                      key: 'cachegroup::tag',
                      value: newState.name,
                      operator: '=',
                    },
                  ],
                },
              ],
            }
          : {
              queries: [defaultCacheGroupConnectionQuery],
            }
      );
      queryRunner2.runQueries();
    });

    return () => {
      sub.unsubscribe();
    };
  });

  return PanelBuilders.timeseries()
    .setTitle('Connections (stacked)')
    .setCustomFieldConfig('fillOpacity', 20)
    .setData(queryRunner2)
    .setOption('legend', { showLegend: true, calcs: ['max'] })
    .setCustomFieldConfig('spanNulls', true)
    .build();
};
