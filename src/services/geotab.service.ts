import GeotabHelper from '../utils/helpers/geotab.helper';

export class GeotabService extends GeotabHelper {
  constructor(username, password, database, server) {
    super(username, password, database, server);
  }

  async getZonesByZoneTypeId(zoneTypeId) {
    try {
      const api = await super.getApi();
      const zones = await api.call('Get', {
        typeName: 'Zone',
        search: {
          zoneTypes: [{ id: zoneTypeId }],
          // fromDate: moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS'),
          // groups: [{ id: 'GroupCompanyId' }],
        },
      });

      return zones;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
