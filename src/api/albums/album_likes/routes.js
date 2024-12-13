const albumLikeRoutes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.likeAlbumHandler(request, h),
    options: {
      auth: 'access_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.dislikeAlbumHandler(request, h),
    options: {
      auth: 'access_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (request, h) => handler.getAlbumTotalLikeHandler(request, h),
  },
];

module.exports = albumLikeRoutes;
