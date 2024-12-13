class AlbumLikeHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async getAlbumTotalLikeHandler(request, h) {
    const { id: albumId } = request.params;

    this._validator.validateGetAlbumLikePayload({ albumId });

    const { likes, fromCache } = await this._service.getAlbumTotalLike(albumId);

    const response = h.response({
      status: 'success',
      data: { likes },
    });

    if (fromCache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async likeAlbumHandler(request, h) {
    const { userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    this._validator.validateLikeAlbumPayload({ albumId, userId });

    await this._service.likeAlbum(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'like album success',
    });

    response.code(201);

    return response;
  }

  async dislikeAlbumHandler(request, h) {
    const { userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    this._validator.validateLikeAlbumPayload({ albumId, userId });

    await this._service.dislikeAlbum(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'dislike album success',
    });

    return response;
  }
}

module.exports = AlbumLikeHandler;
