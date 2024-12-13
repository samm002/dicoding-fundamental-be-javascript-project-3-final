require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');
const path = require('path');

const { ClientError, ServerError } = require('./utils/exceptions');
const generateSecondFromHour = require('./utils/generateSecondFromHour');
const TokenManager = require('./utils/tokenize/TokenManager');

const authentications = require('./api/authentication');
const AuthenticationService = require('./api/authentication/services');
const AuthenticationValidator = require('./utils/validators/authentications');

const users = require('./api/users');
const UserService = require('./api/users/services');
const UserValidator = require('./utils/validators/users');

const albums = require('./api/albums');
const AlbumService = require('./api/albums/services');
const AlbumValidator = require('./utils/validators/albums');

const songs = require('./api/songs');
const SongService = require('./api/songs/services');
const SongValidator = require('./utils/validators/songs');

const playlists = require('./api/playlists');
const PlaylistService = require('./api/playlists/services');
const PlaylistValidator = require('./utils/validators/playlists');

const playlistSongs = require('./api/playlists/playlist_songs');
const PlaylistSongService = require('./api/playlists/playlist_songs/services');
const PlaylistSongValidator = require('./utils/validators/playlists/playlist_songs');

const playlistCollaborators = require('./api/playlists/playlist_collaborators');
const PlaylistCollaboratorService = require('./api/playlists/playlist_collaborators/services');
const PlaylistCollaboratorValidator = require('./utils/validators/playlists/playlist_collaborators');

const playlistSongActivities = require('./api/playlists/playlist_song_activities');
const PlaylistSongActivitiesService = require('./api/playlists/playlist_song_activities/services');
const PlaylistSongActivitiesValidator = require('./utils/validators/playlists/playlist_song_activities');

const _exports = require('./api/exports');
const messageBroker = require('./configs/messageBroker');
const ExportValidator = require('./utils/validators/exports');

const uploads = require('./api/uploads');
const StorageService = require('./api/uploads/services/localStorageService');
const UploadValidator = require('./utils/validators/uploads');

const albumLikes = require('./api/albums/album_likes');
const AlbumLikeService = require('./api/albums/album_likes/services');
const AlbumLikeValidator = require('./utils/validators/albums/album_likes');

const Cache = require('./configs/cache');

const init = async () => {
  const cache = new Cache();
  const storageService = new StorageService(path.resolve(__dirname, '../public/images'), UploadValidator);
  const authenticationService = new AuthenticationService();
  const userService = new UserService();
  const albumService = new AlbumService(storageService);
  const albumLikeService = new AlbumLikeService(cache, albumService, userService);
  const songService = new SongService(albumService);
  const playlistService = new PlaylistService(userService);
  const playlistCollaboratorService = new PlaylistCollaboratorService(playlistService, userService);
  const playlistSongActivitiesService = new PlaylistSongActivitiesService(
    playlistService,
    songService,
    userService,
    playlistCollaboratorService,
  );
  const playlistSongService = new PlaylistSongService(
    playlistService,
    songService,
    userService,
    playlistCollaboratorService,
    playlistSongActivitiesService,
  );

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // JWT external plugins (built in)
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('access_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: generateSecondFromHour(process.env.ACCESS_TOKEN_EXPIRE),
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
  });

  server.auth.strategy('refresh_jwt', 'jwt', {
    keys: process.env.REFRESH_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: generateSecondFromHour(process.env.REFRESH_TOKEN_EXPIRE),
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
  });

  await server.register([
    {
      plugin: users,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: playlistCollaborators,
      options: {
        service: playlistCollaboratorService,
        validator: PlaylistCollaboratorValidator,
      },
    },
    {
      plugin: playlistSongs,
      options: {
        service: playlistSongService,
        validator: PlaylistSongValidator,
        playlistService,
        playlistSongActivitiesService,
      },
    },
    {
      plugin: playlistSongActivities,
      options: {
        service: playlistSongActivitiesService,
        validator: PlaylistSongActivitiesValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: messageBroker,
        validator: ExportValidator,
        playlistService,
      },
    },
    {
      plugin: uploads,
    },
    {
      plugin: albumLikes,
      options: {
        service: albumLikeService,
        validator: AlbumLikeValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.code);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      if (response instanceof ServerError) {
        const newResponse = h.response({
          status: 'error',
          message: response.message,
        });

        newResponse.code(response.code);
        return newResponse;
      }

      console.error(response);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server is running on ${server.info.uri}`);
};

init();
