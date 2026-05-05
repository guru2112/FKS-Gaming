const cloudinary = require("cloudinary").v2;
const multer = require("multer");

let isConfigured = false;

function normalizeEnvValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/^['"]|['"]$/g, "");
}

function ensureCloudinaryConfig() {
  if (isConfigured) return;

  const cloudName = normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME);
  const apiKey = normalizeEnvValue(process.env.CLOUDINARY_API_KEY);
  const apiSecret = normalizeEnvValue(process.env.CLOUDINARY_API_SECRET);

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed."));
    }
    return cb(null, true);
  },
});

function uploadImageBuffer(buffer, options) {
  ensureCloudinaryConfig();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed."));
        }
        return resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function deleteImage(publicId) {
  if (!publicId) return null;
  ensureCloudinaryConfig();
  return cloudinary.uploader.destroy(publicId);
}

module.exports = {
  imageUpload,
  uploadImageBuffer,
  deleteImage,
};
