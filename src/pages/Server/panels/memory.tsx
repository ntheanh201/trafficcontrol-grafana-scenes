import { PanelBuilders, SceneQueryRunner } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { ServerCustomObject } from '../ServerCustomObject';

export const getMemoryPanel = ({ customObject }: { customObject: ServerCustomObject }) => {
  const defaultQuery = {
    refId: 'A',
    query: `SELECT mean("used_percent") AS "mem_used" FROM "mem" WHERE $timeFilter GROUP BY time($interval) fill(null)`,
    rawQuery: true,
    resultFormat: 'time_series',
    alias: '$col',
  };

  const qr = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.TELEGRAF,
    queries: [defaultQuery],
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
              queries: [defaultQuery],
            }
      );
      qr.runQueries();

      return () => {
        sub.unsubscribe();
      };
    });
  });

  return PanelBuilders.timeseries()
    .setTitle('Memory Usage')
    .setData(qr)
    .setCustomFieldConfig('spanNulls', true)
    .setCustomFieldConfig('fillOpacity', 20)
    .setUnit('%')
    .build();
};
