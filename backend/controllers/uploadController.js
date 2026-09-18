const cloudinary = require('../config/cloudinary');

/**
 * Image ko Cloudinary pe upload karo (buffer se)
 * @param {Buffer} buffer - File ka buffer
 * @param {string} folder - Cloudinary folder name
 * @returns {object} Cloudinary response
 */
const uploadToCloudinary = (buffer, folder = 'rashan-sathi') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// @desc   Ek image upload karo
// @route  POST /api/upload/single
// @access Private
const uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Koi image nahi bheji gayi',
      });
    }

    const folder = req.body.folder || 'misc';
    const result = await uploadToCloudinary(req.file.buffer, `rashan-sathi/${folder}`);

    res.status(200).json({
      success: true,
      message: 'Image upload ho gayi ✅',
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        size: result.bytes,
        format: result.format,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Multiple images upload karo
// @route  POST /api/upload/multiple
// @access Private
const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Koi image nahi bheji gayi',
      });
    }

    const folder = req.body.folder || 'misc';
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, `rashan-sathi/${folder}`)
    );

    const results = await Promise.all(uploadPromises);

    const images = results.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      width: r.width,
      height: r.height,
      size: r.bytes,
      format: r.format,
    }));

    res.status(200).json({
      success: true,
      message: `${images.length} images upload ho gayin ✅`,
      images,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Image delete karo (Cloudinary se)
// @route  DELETE /api/upload/:publicId
// @access Private
const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID zaroori hai',
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return res.status(200).json({
        success: true,
        message: 'Image delete ho gayi',
      });
    }

    res.status(404).json({
      success: false,
      message: 'Image nahi mili ya pehle hi delete ho chuki hai',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadSingle, uploadMultiple, deleteImage };