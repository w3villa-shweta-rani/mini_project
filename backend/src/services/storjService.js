const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  endpoint: process.env.STORJ_ENDPOINT,
  region: 'us-east-1',
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
 * @returns {string} - Storj key (not full URL)
 */
const uploadProfileImage = async (buffer, mimetype, userId) => {
  const ext = mimetype.split('/')[1] || 'jpg';
  const key = `profiles/${userId}-${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.STORJ_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);

  // Return the key, we'll generate presigned URL when needed
  return key;
};

/**
 * Get presigned URL for viewing an image
 * @param {string} key - The S3 key of the image
 * @returns {string} - Presigned URL valid for 1 hour
 */
const getPresignedUrl = async (key) => {
  if (!key) return null;
  
  // If it's already a full URL, extract the key
  if (key.startsWith('http')) {
    try {
      const url = new URL(key);
      key = url.pathname.replace(`/${process.env.STORJ_BUCKET}/`, '');
    } catch (e) {
      return null;
    }
  }

  const command = new GetObjectCommand({
    Bucket: process.env.STORJ_BUCKET,
    Key: key,
  });

  // Generate presigned URL valid for 1 hour
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return presignedUrl;
};

/**
 * Delete profile image from Storj
 * @param {string} key - Key or URL of image to delete
 */
const deleteProfileImage = async (key) => {
  if (!key) return;

  try {
    // If it's a full URL, extract the key
    if (key.startsWith('http')) {
      const url = new URL(key);
      key = url.pathname.replace(`/${process.env.STORJ_BUCKET}/`, '');
    }

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
  getPresignedUrl,
  s3Client,
};
