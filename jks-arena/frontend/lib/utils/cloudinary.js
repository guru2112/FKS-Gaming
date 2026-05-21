import cloudinaryLib from "cloudinary";

const cloudinary = cloudinaryLib.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadImageBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", ...options },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

function deleteImage(publicId) {
  if (!publicId) return Promise.resolve(null);
  return cloudinary.uploader
    .destroy(publicId, { resource_type: "image" })
    .catch((err) => {
      console.error("Cloudinary delete error:", err.message);
      return null;
    });
}

export default cloudinary;
export { uploadImageBuffer, deleteImage };
