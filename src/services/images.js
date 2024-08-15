const { Storage } = require("@google-cloud/storage");
const { BadRequestError } = require("../utils/errors");

// Creates a Storage instance using Google Cloud Storage to handle file uploads.
// This instance uses the credentials specified for the project.
const storage = new Storage({
  keyFilename: process.env.GOOGLE_STORAGE_SECRET_PATH,
});

// Defines the bucket where the uploads will be stored.
// A bucket is a storage location in Google Cloud Storage.
const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET_NAME);

// The `uploadMany` function is used to upload multiple files.
// It takes a list of files and attempts to upload each one.
const uploadMany = async (files = []) =>
  Promise.all(
    files.map(({ originalname, buffer }) => {
      // Prefixes the filename with the current timestamp in milliseconds
      // to prevent overwriting files with the same name.
      const filename = `${Date.now()}-${originalname}`;

      // Creates a file object in the bucket where the file will be stored.
      const blob = bucket.file(filename);

      // Opens a WriteStream to handle the file upload.
      // The `resumable: false` option ensures the upload is completed in one go.
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      // During the upload process, certain events are emitted.
      // We add event handlers to manage `error` and `finish` events.
      const url = new Promise((resolve, reject) => {
        // The `error` event is emitted if something goes wrong during the upload.
        // In this case, we reject the Promise with an error message.
        blobStream.on("error", (err) => {
          reject(new BadRequestError(err.message));
        });

        // The `finish` event is emitted when the file is successfully uploaded.
        // We resolve the Promise with the URL of the uploaded file.
        blobStream.on("finish", async () => {
          // This is the format of the public URL created in Cloud Storage.
          resolve(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
        });

        // After adding the event handlers, we start the file upload.
        // The event handlers will run when the upload is complete or if an error occurs.
        blobStream.end(buffer);
      });

      // The `url` Promise resolves with the file's URL or rejects with an error.
      return url;
    })
  );

// Exports the `uploadMany` function so it can be used in other files.
module.exports = {
  uploadMany,
};
