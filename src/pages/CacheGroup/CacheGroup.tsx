import React, { useMemo } from 'react';
import { SceneApp, SceneAppPage } from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';
import { getBasicScene } from '../Home/scenes';
import { getCacheGroupScene } from './scene';

const getTab1Scene = () => {
  return getCacheGroupScene(false, 'CacheStats');
};

const getTab2Scene = () => {
  return getBasicScene(false, '__house_locations');
};

const getScene = () =>
  new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'Cache Groups',
        subTitle: 'This scene showcases a basic tabs functionality.',
        // Important: Mind the page route is ambiguous for the tabs to work properly
        url: prefixRoute(`${ROUTES.CacheGroup}`),
        hideFromBreadcrumbs: true,
        getScene: getTab1Scene,
        tabs: [
          new SceneAppPage({
            title: 'Server names',
            url: prefixRoute(`${ROUTES.CacheGroup}`),
            getScene: getTab1Scene,
          }),
          new SceneAppPage({
            title: 'House locations',
            url: prefixRoute(`${ROUTES.CacheGroup}/tab-two`),
            getScene: getTab2Scene,
          }),
        ],
      }),
    ],
  });

export const CacheGroupPage = () => {
  const scene = useMemo(() => getScene(), []);

  return <scene.Component model={scene} />;
};
