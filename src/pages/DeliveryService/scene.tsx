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
import { DeliveryServiceCustomObject } from './DSCustomObject';

export function getDeliveryServiceScene() {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  const defaultBandwidthQuery = {
    refId: 'A',
    query: `SELECT mean(value)*1000 FROM "monthly"."kbps.ds.1min" WHERE cachegroup = 'total'  and $timeFilter GROUP BY time(60s), deliveryservice ORDER BY asc`,
    rawQuery: true,
    resultFormat: 'time_series',
    alias: '$tag_deliveryservice',
  };

  const defaultTPSQueries = [
    {
      refId: 'A',
      query: `SELECT mean(value) FROM \"monthly\".\"tps_2xx.ds.1min\" WHERE $timeFilter GROUP BY time(60s) ORDER BY asc`,
      rawQuery: true,
      resultFormat: 'time_series',
    },
    {
      refId: 'B',
      query: `SELECT mean(value) FROM \"monthly\".\"tps_3xx.ds.1min\" WHERE $timeFilter GROUP BY time(60s) ORDER BY asc`,
      rawQuery: true,
      resultFormat: 'time_series',
    },
    {
      refId: 'C',
      query: `SELECT mean(value) FROM \"monthly\".\"tps_4xx.ds.1min\" WHERE $timeFilter GROUP BY time(60s) ORDER BY asc`,
      rawQuery: true,
      resultFormat: 'time_series',
    },
    {
      refId: 'D',
      query: `SELECT mean(value) FROM \"monthly\".\"tps_5xx.ds.1min\" WHERE $timeFilter GROUP BY time(60s) ORDER BY asc`,
      rawQuery: true,
      resultFormat: 'time_series',
    },
  ];

  const defaultBandwidthByCacheGroupQuery = {
    refId: 'A',
    query: `SELECT mean(value)*1000 FROM "monthly"."kbps.cg.1min" WHERE cachegroup != 'all' and $timeFilter GROUP BY time(60s), cachegroup`,
    rawQuery: true,
    resultFormat: 'time_series',
    alias: '$tag_cachegroup',
  };

  const queryRunner1 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.DELIVERYSERVICE_STATS,
    queries: [defaultBandwidthQuery],
  });

  const queryRunner2 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.DELIVERYSERVICE_STATS,
    queries: [...defaultTPSQueries],
  });

  const queryRunner3 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.DELIVERYSERVICE_STATS,
    queries: [defaultBandwidthByCacheGroupQuery],
  });

  const customObject = new DeliveryServiceCustomObject({
    name: '',
  });

  queryRunner1.addActivationHandler(() => {
    const sub = customObject.subscribeToState((newState) => {
      queryRunner1.setState(
        !!newState.name
          ? {
              queries: [
                {
                  ...queryRunner1.state.queries[0],
                  query:
                    'SELECT mean(value)*1000 FROM "monthly"."kbps.ds.1min" WHERE deliveryservice=\'' +
                    newState.name +
                    `' and cachegroup = 'total' and $timeFilter GROUP BY time(60s), deliveryservice ORDER BY asc`,
                },
              ],
            }
          : {
              queries: [defaultBandwidthQuery],
            }
      );
      queryRunner1.runQueries();

      queryRunner2.setState(
        !!newState.name
          ? {
              queries: [
                {
                  refId: 'A',
                  query:
                    'SELECT mean(value) FROM "monthly"."tps_2xx.ds.1min" WHERE $timeFilter AND deliveryservice=\'' +
                    newState.name +
                    "' GROUP BY time(60s) ORDER BY asc",
                  rawQuery: true,
                  resultFormat: 'time_series',
                },
                {
                  refId: 'B',
                  query:
                    'SELECT mean(value) FROM "monthly"."tps_3xx.ds.1min" WHERE $timeFilter AND deliveryservice=\'' +
                    newState.name +
                    "' GROUP BY time(60s) ORDER BY asc",
                  rawQuery: true,
                  resultFormat: 'time_series',
                },
                {
                  refId: 'C',
                  query:
                    'SELECT mean(value) FROM "monthly"."tps_4xx.ds.1min" WHERE $timeFilter AND deliveryservice=\'' +
                    newState.name +
                    "' GROUP BY time(60s) ORDER BY asc",
                  rawQuery: true,
                  resultFormat: 'time_series',
                },
                {
                  refId: 'D',
                  query:
                    'SELECT mean(value) FROM "monthly"."tps_5xx.ds.1min" WHERE $timeFilter AND deliveryservice=\'' +
                    newState.name +
                    "' GROUP BY time(60s) ORDER BY asc",
                  rawQuery: true,
                  resultFormat: 'time_series',
                },
              ],
            }
          : {
              queries: [...defaultTPSQueries],
            }
      );
      queryRunner2.runQueries();

      queryRunner3.setState(
        !!newState.name
          ? {
              queries: [
                {
                  ...queryRunner3.state.queries[0],
                  query:
                    'SELECT mean(value)*1000 FROM "monthly"."kbps.cg.1min" WHERE deliveryservice=\'' +
                    newState.name +
                    "' and cachegroup != 'all' and $timeFilter GROUP BY time(60s), cachegroup",
                },
              ],
            }
          : {
              queries: [defaultBandwidthByCacheGroupQuery],
            }
      );
      queryRunner3.runQueries();
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
            .setTitle('Bandwidth')
            .setOption('legend', { showLegend: true, calcs: ['max'] })
            .setUnit('Kbits')
            .build(),
        }),
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries()
            .setTitle('TPS')
            .setData(queryRunner2)
            .setOption('legend', { showLegend: true, calcs: ['max'] })
            .setCustomFieldConfig('spanNulls', true)
            .build(),
        }),
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries()
            .setTitle('Bandwidth by CacheGroup')
            .setData(queryRunner3)
            .setOption('legend', { showLegend: true, calcs: ['max'] })
            .setCustomFieldConfig('spanNulls', true)
            .build(),
        }),
      ],
    }),
    controls: [
      new SceneControlsSpacer(),
      customObject,
      new SceneTimePicker({ isOnCanvas: true }),
      new SceneRefreshPicker({
        intervals: ['5s', '1m', '1h'],
        isOnCanvas: true,
      }),
    ],
  });
}
