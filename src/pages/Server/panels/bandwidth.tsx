import { SceneQueryRunner, PanelBuilders } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { ServerCustomObject } from '../ServerCustomObject';

export const getBandwidthPanel = ({ customObject }: { customObject: ServerCustomObject }) => {
  const defaultBandwidthQuery = {
    refId: 'A',
    query: `SELECT mean(value) FROM "monthly"."bandwidth.1min" WHERE $timeFilter GROUP BY time(60s)`,
    rawQuery: true,
    resultFormat: 'time_series',
    alias: 'bandwidth',
  };

  const queryRunner1 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [defaultBandwidthQuery],
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
                    'SELECT mean(value) FROM "monthly"."bandwidth.1min" WHERE hostname= \'' +
                    newState.name +
                    `' and $timeFilter GROUP BY time(60s)`,
                },
              ],
            }
          : {
              queries: [defaultBandwidthQuery],
            }
      );
      queryRunner1.runQueries();

      return () => {
        sub.unsubscribe();
      };
    });
  });

  return PanelBuilders.timeseries()
    .setTitle('Bandwidth')
    .setData(queryRunner1)
    .setCustomFieldConfig('fillOpacity', 20)
    .setOption('legend', { showLegend: true, calcs: ['max'] })
    .setUnit('kbps')
    .build();
};
