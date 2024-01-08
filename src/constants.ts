import pluginJson from './plugin.json';

export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;

export enum ROUTES {
  Home = 'home',
  CacheGroup = 'cache-group',
  DeliveryService = 'delivery-service',
  Server = 'server',
}

export const DATASOURCE_REF = {
  uid: 'gdev-testdata',
  type: 'testdata',
};

export const PROMETHEUS_DATASOURCE_REF = {
  uid: 'prometheus',
  type: 'prometheus',
};

export const INFLUXDB_DATASOURCES_REF = {
  CACHE_STATS: {
    // uid: 'P6127926DB38D28AA',
    uid: 'cache_stats',
    type: 'influxdb',
  },
  DELIVERYSERVICE_STATS: {
    uid: 'deliveryservice_stats',
    type: 'influxdb',
  },
  DAILY_STATS: {
    uid: 'daily_stats',
    type: 'influxdb',
  },
};
