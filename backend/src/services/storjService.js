const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const s3Client = new S3Client({
  endpoint: process.env.STORJ_ENDPOINT,
  region: 'us-east-1', // Storj requires a region value
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY,
    secretAccessKey: process.env.STORJ_SECRET_KEY,
  },
  forcePathStyle: true,
});

/**
 * Upload profile image to Storj
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File MIME type
 * @param {string} userId - User ID for naming
 * @returns {string} - Public URL of uploaded image
 */
const uploadProfileImage = async (buffer, mimetype, userId) => {
  const ext = mimetype.split('/')[1] || 'jpg';
  const filename = `profiles/${userId}-${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.STORJ_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const publicUrl = `${process.env.STORJ_ENDPOINT}/${process.env.STORJ_BUCKET}/${filename}`;
  return publicUrl;
};

/**
 * Delete profile image from Storj
 * @param {string} imageUrl - Full URL of image to delete
 */
const deleteProfileImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Extract the key from URL
    const url = new URL(imageUrl);
    const key = url.pathname.replace(`/${process.env.STORJ_BUCKET}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: process.env.STORJ_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting image from Storj:', error.message);
  }
};

module.exports = {
  uploadProfileImage,
  deleteProfileImage,
  s3Client,
};
