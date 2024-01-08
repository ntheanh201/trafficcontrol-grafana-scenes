import React from 'react';
import { getScene } from './ServerScene';

export const ServerPluginPage = () => {
  const scene = getScene();

  return <scene.Component model={scene} />;
};
