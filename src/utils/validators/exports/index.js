const ExportNotesPayloadSchema = require('./schema');
const { InvariantError } = require('../../exceptions');

const ExportValidator = {
  validateExportNotesPayload: (payload) => {
    const validationResult = ExportNotesPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportValidator;
