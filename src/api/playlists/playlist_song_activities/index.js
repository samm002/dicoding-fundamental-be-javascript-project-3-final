const PlaylistSongActivitiesHandler = require('./handlers');
const playlistSongActivitiesRoutes = require('./routes');

module.exports = {
  name: 'playlist_song_activities',
  version: '2.0.0',
  register: async (server, { service, validator }) => {
    const playlistSongActivitiesHandler = new PlaylistSongActivitiesHandler(service, validator);
    server.route(playlistSongActivitiesRoutes(playlistSongActivitiesHandler));
  },
};
