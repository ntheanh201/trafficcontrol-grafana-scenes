import { SceneQueryRunner, PanelBuilders } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { DeliveryServiceCustomObject } from '../DSCustomObject';

export const getBandwidthByCGPanel = ({ customObject }: { customObject: DeliveryServiceCustomObject }) => {
  const defaultBandwidthByCacheGroupQuery = {
    refId: 'A',
    query: `SELECT mean(value) FROM "monthly"."kbps.cg.1min" WHERE cachegroup != 'all' and $timeFilter GROUP BY time(60s), cachegroup`,
    rawQuery: true,
    resultFormat: 'time_series',
    alias: '$tag_cachegroup',
  };

  const queryRunner3 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.DELIVERYSERVICE_STATS,
    queries: [defaultBandwidthByCacheGroupQuery],
  });

  queryRunner3.addActivationHandler(() => {
    const sub = customObject.subscribeToState((newState) => {
      queryRunner3.setState(
        !!newState.name
          ? {
              queries: [
                {
                  ...queryRunner3.state.queries[0],
                  query:
                    'SELECT mean(value) FROM "monthly"."kbps.cg.1min" WHERE deliveryservice=\'' +
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

  return PanelBuilders.timeseries()
    .setTitle('Bandwidth by CacheGroup')
    .setData(queryRunner3)
    .setOption('legend', { showLegend: true, calcs: ['max'] })
    .setCustomFieldConfig('axisCenteredZero', true)
    .setCustomFieldConfig('spanNulls', true)
    .setUnit('bps')
    .build();
};
