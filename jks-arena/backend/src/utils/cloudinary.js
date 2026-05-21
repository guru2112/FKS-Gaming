const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a Buffer to Cloudinary as a data-uri stream.
 * Returns { secure_url, public_id } on success.
 */
function uploadImageBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", ...options },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by public_id.
 */
function deleteImage(publicId) {
  if (!publicId) return Promise.resolve(null);
  return cloudinary.uploader
    .destroy(publicId, { resource_type: "image" })
    .catch((err) => {
      console.error("Cloudinary delete error:", err.message);
      return null;
    });
}

module.exports = cloudinary;
module.exports.uploadImageBuffer = uploadImageBuffer;
module.exports.deleteImage = deleteImage;
