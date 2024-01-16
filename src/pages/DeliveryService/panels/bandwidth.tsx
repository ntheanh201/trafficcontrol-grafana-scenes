import { SceneQueryRunner, PanelBuilders } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { DeliveryServiceCustomObject } from '../DSCustomObject';

export const getBandwidthPanel = ({ customObject }: { customObject: DeliveryServiceCustomObject }) => {
  const defaultBandwidthQuery = {
    refId: 'A',
    query: `SELECT mean(value) FROM "monthly"."kbps.ds.1min" WHERE cachegroup = 'total'  and $timeFilter GROUP BY time(60s), deliveryservice ORDER BY asc`,
    rawQuery: true,
    resultFormat: 'time_series',
    alias: '$tag_deliveryservice',
    measurement: 'bw',
  };

  const queryRunner1 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.DELIVERYSERVICE_STATS,
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
                    'SELECT mean(value) FROM "monthly"."kbps.ds.1min" WHERE deliveryservice=\'' +
                    newState.name +
                    `' and cachegroup = 'total' and $timeFilter GROUP BY time(60s), deliveryservice ORDER BY asc`,
                  tags: {
                    deliveryservice: newState.name,
                  },
                },
              ],
            }
          : {
              queries: [defaultBandwidthQuery],
            }
      );
      queryRunner1.runQueries();
    });

    return () => {
      sub.unsubscribe();
    };
  });

  return PanelBuilders.timeseries()
    .setTitle('Bandwidth')
    .setOption('legend', { showLegend: true, calcs: ['max'] })
    .setCustomFieldConfig('axisCenteredZero', true)
    .setUnit('bps')
    .build();
};
