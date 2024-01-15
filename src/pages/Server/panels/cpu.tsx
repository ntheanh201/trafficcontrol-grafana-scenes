import { PanelBuilders, SceneQueryRunner } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { ServerCustomObject } from '../ServerCustomObject';

export const getCPUPanel = ({ customObject }: { customObject: ServerCustomObject }) => {
  const defaultQuery = {
    refId: 'A',
    query: `SELECT mean("usage_system") AS "cpu_system", mean("usage_iowait") AS "cpu_iowait", mean("usage_user") AS "cpu_user", mean("usage_guest") AS "cpu_guest", mean("usage_steal") AS "cpu_steal" FROM "cpu" WHERE $timeFilter GROUP BY time($interval) fill(null)`,
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
    .setTitle('CPU Usage')
    .setData(qr)
    .setUnit('%')
    .setCustomFieldConfig('spanNulls', true)
    .build();
};
