import {
  SceneTimeRange,
  EmbeddedScene,
  SceneFlexLayout,
  SceneFlexItem,
  SceneControlsSpacer,
  SceneRefreshPicker,
  SceneTimePicker,
} from '@grafana/scenes';
import { DeliveryServiceCustomObject } from './DSCustomObject';
import { getBandwidthPanel } from './panels/bandwidth';
import { getTpsPanel } from './panels/tps';
import { getBandwidthByCGPanel } from './panels/bandwidth-cg';

export function getDeliveryServiceScene() {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  const customObject = new DeliveryServiceCustomObject({
    name: '',
  });

  return new EmbeddedScene({
    $timeRange: timeRange,
    body: new SceneFlexLayout({
      direction: 'column',
      children: [
        new SceneFlexItem({
          minHeight: 300,
          body: getBandwidthPanel({ customObject }),
        }),
        new SceneFlexItem({
          minHeight: 300,
          body: getTpsPanel({ customObject }),
        }),
        new SceneFlexItem({
          minHeight: 300,
          body: getBandwidthByCGPanel({ customObject }),
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
