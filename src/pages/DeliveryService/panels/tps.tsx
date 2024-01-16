import { SceneQueryRunner, PanelBuilders } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { DeliveryServiceCustomObject } from '../DSCustomObject';

export const getTpsPanel = ({ customObject }: { customObject: DeliveryServiceCustomObject }) => {
  const defaultTPSQueries = [
    {
      refId: 'A',
      query: `SELECT mean(value) FROM \"monthly\".\"tps_2xx.ds.1min\" WHERE $timeFilter GROUP BY time(60s) ORDER BY asc`,
      rawQuery: true,
      resultFormat: 'time_series',
      measurement: 'tps_2xx',
      hide: false,
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

  const queryRunner2 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.DELIVERYSERVICE_STATS,
    queries: [...defaultTPSQueries],
  });

  queryRunner2.addActivationHandler(() => {
    const sub = customObject.subscribeToState((newState) => {
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
                  measurement: 'tps_2xx',
                  hide: false,
                  tags: {
                    deliveryservice: newState.name,
                  },
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
    });

    return () => {
      sub.unsubscribe();
    };
  });

  return PanelBuilders.timeseries()
  .setTitle('TPS')
  .setData(queryRunner2)
  .setOption('legend', { showLegend: true, calcs: ['max'] })
  .setCustomFieldConfig('axisCenteredZero', true)
  .setCustomFieldConfig('spanNulls', true)
  .build();
};
