const Joi = require('joi');

const GetAlbumLikePayloadSchema = Joi.object({
  albumId: Joi.string().required(),
});

const LikeAlbumPayloadSchema = Joi.object({
  albumId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = { GetAlbumLikePayloadSchema, LikeAlbumPayloadSchema };
