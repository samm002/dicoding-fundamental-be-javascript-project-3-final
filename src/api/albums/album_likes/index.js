const AlbumLikeHandler = require('./handlers');
const albumLikeRoutes = require('./routes');

module.exports = {
  name: 'album_likes',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const albumLikeHandler = new AlbumLikeHandler(service, validator);
    server.route(albumLikeRoutes(albumLikeHandler));
  },
};
