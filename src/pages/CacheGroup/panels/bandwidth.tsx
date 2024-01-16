import { SceneQueryRunner, PanelBuilders } from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../../constants';
import { CacheGroupCustomObject } from '../CacheGroupCustomObject';

export const getBandwidthPanel = ({ customObject }: { customObject: CacheGroupCustomObject }) => {
  const defaultCacheGroupBandwidthQuery = {
    refId: 'A',
    query: 'SELECT sum(value) FROM "monthly"."bandwidth.1min" WHERE $timeFilter GROUP BY time(60s), cachegroup',
    rawQuery: true,
    resultFormat: 'time_series',
    alias: '$tag_cachegroup',
  };

  const queryRunner1 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [defaultCacheGroupBandwidthQuery],
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
    });

    return () => {
      sub.unsubscribe();
    };
  });

  return PanelBuilders.timeseries()
    .setTitle('Total bandwidth (stacked)')
    .setData(queryRunner1)
    .setCustomFieldConfig('fillOpacity', 20)
    .setOption('legend', { showLegend: true, calcs: ['max'] })
    .setUnit('Kbits')
    .build();
};
