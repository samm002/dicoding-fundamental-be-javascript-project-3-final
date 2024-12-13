const { InvariantError } = require('../../../exceptions');
const {
  GetAlbumLikePayloadSchema,
  LikeAlbumPayloadSchema,
} = require('./schemas');

const AlbumLikeValidator = {
  validateGetAlbumLikePayload: (payload) => {
    const validationResult = GetAlbumLikePayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateLikeAlbumPayload: (payload) => {
    const validationResult = LikeAlbumPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumLikeValidator;
