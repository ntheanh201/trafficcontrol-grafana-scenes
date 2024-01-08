import {
  SceneTimeRange,
  //   CustomVariable,
  SceneQueryRunner,
  EmbeddedScene,
  //   SceneVariableSet,
  SceneFlexLayout,
  SceneFlexItem,
  PanelBuilders,
  //   VariableValueSelectors,
  //   SceneControlsSpacer,
  //   SceneTimePicker,
  //   SceneRefreshPicker,
} from '@grafana/scenes';
import { INFLUXDB_DATASOURCES_REF } from '../../constants';
// import { CustomSceneObject } from 'pages/Home/CustomSceneObject';

// const which = 'CDN_in_a_Box_Edge';

export function getCacheGroupScene(templatised = true, seriesToShow = 'CacheStats') {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  // Variable definition, using Grafana built-in TestData datasource
  //   const customVariable = new CustomVariable({
  //     name: 'seriesToShow',
  //     label: 'Series to show',
  //     value: '__server_names',
  //     query: 'Server Names : __server_names, House locations : __house_locations',
  //   });

  // Query runner definition, using Grafana built-in TestData datasource
  const queryRunner = new SceneQueryRunner({
    datasource: INFLUXDB_DATASOURCES_REF.CACHE_STATS,
    queries: [
      {
        refId: 'A',
        expr: 'SELECT sum(value)*1000 FROM "monthly"."bandwidth.1min" GROUP BY time(60s), hostname',
        range: true,
        format: 'time_series',
      },
    ],
    maxDataPoints: 1887,
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

  console.log('cacheQueryRunner: ', queryRunner);

  return new EmbeddedScene({
    $timeRange: timeRange,
    // $variables: new SceneVariableSet({ variables: templatised ? [customVariable] : [] }),
    $data: queryRunner,
    body: new SceneFlexLayout({
      children: [
        new SceneFlexItem({
          minHeight: 300,
          body: PanelBuilders.timeseries().setTitle(seriesToShow).build(),
        }),
      ],
    }),
    // controls: [
    //   new VariableValueSelectors({}),
    //   new SceneControlsSpacer(),
    //   customObject,
    //   new SceneTimePicker({ isOnCanvas: true }),
    //   new SceneRefreshPicker({
    //     intervals: ['5s', '1m', '1h'],
    //     isOnCanvas: true,
    //   }),
    // ],
  });
}
