const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: (request, h) => handler.exportPlaylistSongHandler(request, h),
    options: {
      auth: 'access_jwt',
    },
  },
];

module.exports = routes;
