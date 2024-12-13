class AlbumLikeHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async getAlbumsHandler(request, h) {
    const { name, year } = request.query;

    const albums = await this._service.getAlbums(name, year);

    const response = h.response({
      status: 'success',
      data: albums,
    });

    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);

    const response = h.response({
      status: 'success',
      data: album,
    });

    return response;
  }

  async createAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._service.createAlbum(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });

    response.code(201);

    return response;
  }

  async editAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Edit album success',
    });

    response.code(200);

    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Delete album success',
    });

    return response;
  }

  async uploadAlbumCoverHandler(request, h) {
    const { id: albumId } = request.params;
    const { cover } = request.payload;

    await this._service.uploadAlbumCover(albumId, cover);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });

    response.code(201);

    return response;
  }
}

module.exports = AlbumLikeHandler;
