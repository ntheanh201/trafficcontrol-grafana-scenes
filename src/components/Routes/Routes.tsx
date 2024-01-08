import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { HomePage } from '../../pages/Home';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { ServerPluginPage } from 'pages/Server';
import { DeliveryServicePage } from 'pages/DeliveryService';
import { CacheGroupPage } from 'pages/CacheGroup';

export const Routes = () => {
  return (
    <Switch>
      <Route path={prefixRoute(`${ROUTES.CacheGroup}`)} component={CacheGroupPage} />
      <Route path={prefixRoute(`${ROUTES.DeliveryService}`)} component={DeliveryServicePage} />
      <Route path={prefixRoute(`${ROUTES.Home}`)} component={HomePage} />
      <Route path={prefixRoute(`${ROUTES.Server}`)} component={ServerPluginPage} />
      <Redirect to={prefixRoute(ROUTES.Home)} />
    </Switch>
  );
};
