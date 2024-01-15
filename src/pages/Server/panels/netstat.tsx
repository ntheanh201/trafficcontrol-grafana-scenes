import { PanelBuilders, SceneQueryRunner } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { ServerCustomObject } from '../ServerCustomObject';

export const getNetstatPanel = ({ customObject }: { customObject: ServerCustomObject }) => {
  const defaultQuery = {
    refId: 'A',
    query: `SELECT mean(value) FROM "monthly"."bandwidth.1min" WHERE $timeFilter GROUP BY time(60s)`,
    rawQuery: true,
    resultFormat: 'time_series',
    alias: 'bandwidth',
  };

  const qr = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
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
    .setTitle('Netstat')
    .setData(qr)
    .setOption('legend', { showLegend: true, calcs: ['max'] })
    .setUnit('kbps')
    .build();
};
