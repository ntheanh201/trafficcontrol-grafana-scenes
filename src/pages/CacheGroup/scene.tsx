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

const which = 'CDN_in_a_Box_Edge';

export function getCacheGroupScene() {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  // Variable definition
  //   const customVariable = new CustomVariable({
  //     name: 'seriesToShow',
  //     label: 'Series to show',
  //     value: '__server_names',
  //     query: 'Server Names : __server_names, House locations : __house_locations',
  //   });

  // Query runner definition
  const queryRunner1 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [
      {
        refId: 'A',
        query:
          'SELECT sum(value) FROM "monthly"."bandwidth.1min" WHERE cachegroup=\'' +
          // todo
          which +
          "' and $timeFilter GROUP BY time(60s), cachegroup",
        rawQuery: true,
        resultFormat: 'time_series',
        alias: '$tag_cachegroup',
      },
    ],
  });

  const queryRunner2 = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [
      {
        refId: 'A',
        query: 'SELECT mean("value") FROM "measurement" WHERE $timeFilter GROUP BY time($__interval) fill(null)',
        rawQuery: false,
        resultFormat: 'time_series',
        policy: 'monthly',
        orderByTime: 'ASC',
        tags: [
          {
            key: 'cachegroup::tag',
            // TODO
            value: which,
            operator: '=',
          },
        ],
        groupBy: [
          {
            type: 'time',
            params: ['$__interval'],
          },
          {
            type: 'tag',
            params: ['hostname::tag'],
          },
          {
            type: 'fill',
            params: ['null'],
          },
        ],
        select: [
          [
            {
              type: 'field',
              params: ['value'],
            },
            {
              type: 'mean',
              params: [],
            },
          ],
        ],
        measurement: 'connections.1min',
      },
    ],
  });

  // Custom object definition
  //   const customObject = new CustomSceneObject({
  //     counter: 5,
  //   });

  // Query runner activation handler that will update query runner state when custom object state changes
  //   queryRunner.addActivationHandler(() => {
  //     const sub = customObject.subscribeToState((newState) => {
  //       queryRunner.setState({
  //         queries: [
  //           {
  //             ...queryRunner.state.queries[0],
  //             seriesCount: newState.counter,
  //           },
  //         ],
  //       });
  //       queryRunner.runQueries();
  //     });

  //     return () => {
  //       sub.unsubscribe();
  //     };
  //   });

  return new EmbeddedScene({
    $timeRange: timeRange,
    // $variables: new SceneVariableSet({ variables: templatised ? [customVariable] : [] }),
    $data: queryRunner1,
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries()
            .setTitle('Total bandwidth (stacked)')
            .setOption('legend', { showLegend: true, calcs: ['max'] })
            .setUnit('Kbits')
            .build(),
        }),
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries()
            .setTitle('Connections (stacked)')
            .setData(queryRunner2)
            .setOption('legend', { showLegend: true, calcs: ['max'] })
            .setCustomFieldConfig('spanNulls', true)
            .build(),
        }),
      ],
    }),
    controls: [
      //   new VariableValueSelectors({}),
      new SceneControlsSpacer(),
      //   customObject,
      new SceneTimePicker({ isOnCanvas: true }),
      new SceneRefreshPicker({
        intervals: ['5s', '1m', '1h'],
        isOnCanvas: true,
      }),
    ],
  });
}
