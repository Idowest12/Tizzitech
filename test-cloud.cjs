const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
  cloud_name: undefined,
  api_key: undefined,
  api_secret: undefined
});
try {
  cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    .then(console.log)
    .catch(err => console.error("Catch", err.message));
} catch (e) {
  console.error("Throw", e.message);
}
