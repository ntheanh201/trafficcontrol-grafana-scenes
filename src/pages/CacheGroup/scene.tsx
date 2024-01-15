import {
  SceneTimeRange,
  SceneQueryRunner,
  EmbeddedScene,
  SceneFlexLayout,
  SceneFlexItem,
  PanelBuilders,
  SceneControlsSpacer,
  SceneRefreshPicker,
  SceneTimePicker,
} from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../constants';
import { CacheGroupCustomObject } from './CacheGroupCustomObject';

export function getCacheGroupScene() {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  const defaultCacheGroupBandwidthQuery = {
    refId: 'A',
    query: 'SELECT sum(value) FROM "monthly"."bandwidth.1min" WHERE $timeFilter GROUP BY time(60s), cachegroup',
    rawQuery: true,
    resultFormat: 'time_series',
    alias: '$tag_cachegroup',
  };

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

  const queryRunner1 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [defaultCacheGroupBandwidthQuery],
  });

  const queryRunner2 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [defaultCacheGroupConnectionQuery],
  });

  const cacheGroupCustomObject = new CacheGroupCustomObject({
    name: '',
  });

  queryRunner1.addActivationHandler(() => {
    const sub = cacheGroupCustomObject.subscribeToState((newState) => {
      queryRunner1.setState(
        !!newState.name
          ? {
              queries: [
                {
                  ...queryRunner1.state.queries[0],
                  query:
                    'SELECT sum(value) FROM "monthly"."bandwidth.1min" WHERE cachegroup=\'' +
                    newState.name +
                    "' and $timeFilter GROUP BY time(60s), hostname",
                  alias: '$tag_hostname',
                },
              ],
            }
          : {
              queries: [defaultCacheGroupBandwidthQuery],
            }
      );
      queryRunner1.runQueries();

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

  return new EmbeddedScene({
    $timeRange: timeRange,
    $data: queryRunner1,
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries()
            .setTitle('Total bandwidth (stacked)')
            .setCustomFieldConfig('fillOpacity', 20)
            .setOption('legend', { showLegend: true, calcs: ['max'] })
            .setUnit('Kbits')
            .build(),
        }),
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries()
            .setTitle('Connections (stacked)')
            .setCustomFieldConfig('fillOpacity', 20)
            .setData(queryRunner2)
            .setOption('legend', { showLegend: true, calcs: ['max'] })
            .setCustomFieldConfig('spanNulls', true)
            .build(),
        }),
      ],
    }),
    controls: [
      new SceneControlsSpacer(),
      cacheGroupCustomObject,
      new SceneTimePicker({ isOnCanvas: true }),
      new SceneRefreshPicker({
        intervals: ['5s', '1m', '1h'],
        isOnCanvas: true,
      }),
    ],
  });
}
