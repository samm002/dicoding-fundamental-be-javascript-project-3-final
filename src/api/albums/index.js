const generateByteFromMegaByte = require('../../utils/generateByteFromMegaByte');
const AlbumHandler = require('./handlers');
const albumRoutes = require('./routes');

module.exports = {
  name: 'albums',
  version: '3.0.0',
  register: async (server, { service, validator }) => {
    const albumHandler = new AlbumHandler(service, validator);
    server.route(albumRoutes(albumHandler, generateByteFromMegaByte));
  },
};
