const path = require('path');

const routes = () => [
  // Route for accessing static local files
  {
    method: 'GET',
    path: '/public/images/{param*}',
    handler: {
      directory: {
        path: path.resolve(path.resolve(__dirname, '../../../public/images')),
      },
    },
  },
];

module.exports = routes;
