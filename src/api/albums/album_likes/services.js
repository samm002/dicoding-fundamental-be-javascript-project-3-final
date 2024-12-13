const pool = require('../../../configs/database');
const IdGenerator = require('../../../utils/generateId');
const { InvariantError, NotFoundError } = require('../../../utils/exceptions');

class AlbumLikeService {
  constructor(cache, albumService, userService) {
    this._pool = pool;
    this._cache = cache;
    this._albumService = albumService;
    this._userService = userService;
    this._idGenerator = new IdGenerator('album_like');
  }

  async getAlbumTotalLike(albumId) {
    try {
      const result = await this._cache.get(`album_likes:${albumId}`);
      const parsedResult = JSON.parse(result);

      return {
        likes: parsedResult.likes,
        fromCache: true,
      };
    } catch (error) {
      const query = {
        text: `SELECT COUNT(*) AS likes FROM user_album_likes
          WHERE album_id = $1`,
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError(
          'Failed getting album like information, album not found',
        );
      }

      const likeCount = Number(result.rows[0].likes);
      const likeCountResult = {
        likes: likeCount,
      };

      await this._cache.set(
        `album_likes:${albumId}`,
        JSON.stringify(likeCountResult),
      );

      return {
        likes: likeCountResult.likes,
        fromCache: false,
      };
    }
  }

  async likeAlbum(albumId, userId) {
    await this.verifyValidLike(albumId, userId, 'like');

    const id = this._idGenerator.generateId();

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to like album');
    }

    await this._cache.delete(`album_likes:${albumId}`);

    return result.rows[0].id;
  }

  async dislikeAlbum(albumId, userId) {
    await this.verifyValidLike(albumId, userId, 'dislike');

    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to dislike album, album not found');
    }

    await this._cache.delete(`album_likes:${albumId}`);

    return result.rows[0];
  }

  // Only allow like if user haven't like before
  async verifyValidLike(albumId, userId, action) {
    await this._albumService.verifyAlbumExist(albumId);
    await this._userService.verifyUserExist(userId);

    const query = {
      text: `SELECT id 
        FROM user_album_likes
        WHERE album_id = $1 AND user_id = $2`,
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      if (action === 'like') {
        throw new InvariantError('User has liked the album');
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (action === 'dislike') {
        throw new InvariantError('User has not liked the album');
      }
    }
  }
}

module.exports = AlbumLikeService;
