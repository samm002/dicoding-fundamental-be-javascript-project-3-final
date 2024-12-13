const fs = require('fs');

class StorageService {
  constructor(folder, validator) {
    this._folder = folder;
    this._validator = validator;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(headers, file, meta) {
    this._validator.validateAlbumCoverPayload(headers);

    const filename = `${Date.now()}-${meta.filename}`;
    const path = `${this._folder}/${filename}`;

    const filestream = fs.createWriteStream(path);

    const fileAccessPath = `http://${process.env.HOST}:${process.env.PORT}/public/images/${filename}`;

    return new Promise((resolve, reject) => {
      filestream.on('error', (error) => reject(error));
      file.pipe(filestream);
      file.on('end', () => resolve(fileAccessPath));
    });
  }
}

module.exports = StorageService;
