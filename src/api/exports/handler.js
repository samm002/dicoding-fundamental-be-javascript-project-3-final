class ExportHandler {
  constructor(service, validator, playlistService) {
    this._service = service;
    this._validator = validator;
    this._playlistService = playlistService;
  }

  async exportPlaylistSongHandler(request, h) {
    this._validator.validateExportNotesPayload(request.payload);

    const { userId } = request.auth.credentials;
    const { playlistId } = request.params;
    const { targetEmail } = request.payload;

    await this._playlistService.verifyPlaylistExist(playlistId);
    await this._playlistService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail,
    };

    await this._service.sendMessage(`${process.env.QUEUE_NAME}`, JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'request added to queue',
    });

    response.code(201);

    return response;
  }
}

module.exports = ExportHandler;
