const ExportHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { service, validator, playlistService }) => {
    const exportHandler = new ExportHandler(service, validator, playlistService);
    server.route(routes(exportHandler));
  },
};
