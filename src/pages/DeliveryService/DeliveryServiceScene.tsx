import React, { useMemo } from 'react';
import { SceneApp, SceneAppPage } from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';
import { getPrometheusScene } from './scene';

const getScene = () =>
  new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'Prometheus',
        subTitle: 'This scene showcases a basic tabs functionality.',
        url: prefixRoute(`${ROUTES.DeliveryService}`),
        hideFromBreadcrumbs: true,
        getScene: () => {
          return getPrometheusScene();
        },
      }),
    ],
  });

export const DeliveryServicePage = () => {
  const scene = useMemo(() => getScene(), []);

  return <scene.Component model={scene} />;
};
