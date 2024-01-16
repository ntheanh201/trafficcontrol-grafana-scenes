import {
  SceneTimeRange,
  EmbeddedScene,
  SceneFlexLayout,
  SceneFlexItem,
  SceneControlsSpacer,
  SceneRefreshPicker,
  SceneTimePicker,
} from '@grafana/scenes';
import { CacheGroupCustomObject } from './CacheGroupCustomObject';
import { getBandwidthPanel } from './panels/bandwidth';
import { getConnectionsPanel } from './panels/connections';

export function getCacheGroupScene() {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  const cacheGroupCustomObject = new CacheGroupCustomObject({
    name: '',
  });

  return new EmbeddedScene({
    $timeRange: timeRange,
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          minHeight: 300,
          body: getBandwidthPanel({ customObject: cacheGroupCustomObject }),
        }),
        new SceneFlexItem({
          minHeight: 300,
          body: getConnectionsPanel({ customObject: cacheGroupCustomObject }),
        }),
      ],
    }),
    controls: [
      new SceneControlsSpacer(),
      cacheGroupCustomObject,
      new SceneTimePicker({ isOnCanvas: true }),
      new SceneRefreshPicker({
        intervals: ['5s', '1m', '1h'],
        isOnCanvas: true,
      }),
    ],
  });
}
