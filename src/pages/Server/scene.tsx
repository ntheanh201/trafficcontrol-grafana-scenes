import {
  SceneTimeRange,
  EmbeddedScene,
  SceneFlexLayout,
  SceneFlexItem,
  SceneControlsSpacer,
  SceneRefreshPicker,
  SceneTimePicker,
} from '@grafana/scenes';
import { ServerCustomObject } from './ServerCustomObject';
import {
  getBandwidthPanel,
  getConnectionsPanel,
  getCPUPanel,
  getMemoryPanel,
  getLoadAveragePanel,
  getReadWriteTimePanel,
  getWrapCountPanel,
  getNetstatPanel,
} from './panels';

export function getServerScene() {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  const customObject = new ServerCustomObject({
    name: '',
  });

  return new EmbeddedScene({
    $timeRange: timeRange,
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          height: 250,
          body: getBandwidthPanel({ customObject }),
        }),
        new SceneFlexItem({
          height: 250,
          body: getConnectionsPanel({ customObject }),
        }),
        new SceneFlexLayout({
          direction: 'row',
          height: 250,
          children: [
            new SceneFlexItem({
              width: '50%',
              body: getCPUPanel({ customObject }),
            }),
            new SceneFlexItem({
              width: '50%',
              body: getMemoryPanel({ customObject }),
            }),
          ],
        }),
        new SceneFlexLayout({
          direction: 'row',
          height: 250,
          children: [
            new SceneFlexItem({
              width: '50%',
              body: getLoadAveragePanel({ customObject }),
            }),
            new SceneFlexItem({
              width: '50%',
              body: getReadWriteTimePanel({ customObject }),
            }),
          ],
        }),
        new SceneFlexLayout({
          direction: 'row',
          height: 250,
          children: [
            new SceneFlexItem({
              width: '50%',
              body: getWrapCountPanel({ customObject }),
            }),
            new SceneFlexItem({
              width: '50%',
              body: getNetstatPanel({ customObject }),
            }),
          ],
        }),
      ],
    }),
    controls: [
      new SceneControlsSpacer(),
      customObject,
      new SceneTimePicker({ isOnCanvas: true }),
      new SceneRefreshPicker({
        intervals: ['5s', '1m', '1h'],
        isOnCanvas: true,
      }),
    ],
  });
}
