const { InvariantError } = require('../../exceptions');
const AlbumCoverSchema = require('./schema');

const UploadValidator = {
  validateAlbumCoverPayload: (headers) => {
    const validationResult = AlbumCoverSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UploadValidator;
