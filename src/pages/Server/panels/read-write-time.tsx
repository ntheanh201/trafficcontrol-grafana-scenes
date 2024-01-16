import { PanelBuilders, SceneQueryRunner } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { ServerCustomObject } from '../ServerCustomObject';

export const getReadWriteTimePanel = ({ customObject }: { customObject: ServerCustomObject }) => {
  const defaultQueries = [
    {
      refId: 'A',
      query: `SELECT non_negative_derivative(sum("read_time"), 10s) AS "read_time" FROM "diskio" WHERE $timeFilter GROUP BY time($interval) fill(null)`,
      rawQuery: true,
      resultFormat: 'time_series',
      alias: '$col',
    },
    {
      refId: 'B',
      query: `SELECT non_negative_derivative(sum("write_time"), 10s) AS "write_time" FROM "diskio" WHERE $timeFilter GROUP BY time($interval) fill(null)`,
      rawQuery: true,
      resultFormat: 'time_series',
      alias: '$col',
    },
  ];

  const qr = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.TELEGRAF,
    queries: [...defaultQueries],
  });

  qr.addActivationHandler(() => {
    const sub = customObject.subscribeToState((newState) => {
      qr.setState(
        !!newState.name
          ? {
              queries: [
                {
                  ...qr.state.queries[0],
                  query:
                    'SELECT mean(value) FROM "monthly"."bandwidth.1min" WHERE hostname= \'' +
                    newState.name +
                    `' and $timeFilter GROUP BY time(60s)`,
                },
              ],
            }
          : {
              queries: [...defaultQueries],
            }
      );
      qr.runQueries();

      return () => {
        sub.unsubscribe();
      };
    });
  });

  return PanelBuilders.timeseries()
    .setTitle('Read/Write Time')
    .setData(qr)
    .setCustomFieldConfig('spanNulls', true)
    .setCustomFieldConfig('fillOpacity', 20)
    .setUnit('ns')
    .build();
};
