const { google } = require('googleapis');
const fs = require('fs');

/**
 * Google Drive service for uploading summary files
 * Uses a service account for authentication
 */

// Create OAuth2 client for Google Drive
const createDriveAuth = () => {
  // Check if credentials are configured
  if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL || !process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
    console.log('Google Drive credentials not configured');
    return null;
  }

  // Use options object format for googleapis v167+ compatibility
  // The newer version requires this format instead of positional parameters
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  return auth;
};

/**
 * Get Google Drive client
 * @returns {google.drive_v3.Drive|null} Google Drive client or null if not configured
 */
const getDriveClient = () => {
  const auth = createDriveAuth();
  if (!auth) {
    return null;
  }

  return google.drive({ version: 'v3', auth });
};

/**
 * Upload a file to Google Drive
 * @param {Object} options Upload options
 * @param {string} options.filePath Path to the file to upload
 * @param {string} options.fileName Name for the file in Drive
 * @param {string} options.mimeType MIME type of the file
 * @returns {Promise<Object>} Object with file ID and web view link
 */
const uploadFileToDrive = async ({ filePath, fileName, mimeType }) => {
  const drive = getDriveClient();
  
  if (!drive) {
    throw new Error(
      'Google Drive not configured. Please set GOOGLE_DRIVE_CLIENT_EMAIL and GOOGLE_DRIVE_PRIVATE_KEY environment variables. ' +
      'Optionally set GOOGLE_DRIVE_FOLDER_ID to specify a target folder. ' +
      'See .env.example for configuration details.'
    );
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const fileMetadata = {
    name: fileName,
    ...(folderId && { parents: [folderId] })
  };

  const media = {
    mimeType,
    body: fs.createReadStream(filePath)
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink'
    });

    // Make the file accessible via link
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink
    };
  } catch (error) {
    // Preserve original error context for debugging
    const errorMessage = error.response?.data?.error?.message || error.message;
    const driveError = new Error(`Failed to upload file to Google Drive: ${errorMessage}`);
    driveError.originalError = error;
    throw driveError;
  }
};

/**
 * Delete a file from Google Drive
 * @param {string} fileId Google Drive file ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteFileFromDrive = async (fileId) => {
  const drive = getDriveClient();
  
  if (!drive) {
    console.log('Google Drive not configured, skipping file deletion');
    return false;
  }

  try {
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    return false;
  }
};

/**
 * Get file information from Google Drive
 * @param {string} fileId Google Drive file ID
 * @returns {Promise<Object|null>} File metadata or null if not found
 */
const getFileInfo = async (fileId) => {
  const drive = getDriveClient();
  
  if (!drive) {
    return null;
  }

  try {
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, webViewLink, webContentLink'
    });
    return response.data;
  } catch (error) {
    console.error('Error getting file info from Google Drive:', error);
    return null;
  }
};

/**
 * Check if Google Drive is configured
 * @returns {boolean} True if configured
 */
const isDriveConfigured = () => {
  return !!(process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY);
};

/**
 * Verify Google Drive credentials are valid
 * @returns {Promise<Object>} Object with status and message
 */
const verifyDriveCredentials = async () => {
  if (!isDriveConfigured()) {
    return {
      success: false,
      message: 'Google Drive credentials not configured'
    };
  }

  const drive = getDriveClient();
  if (!drive) {
    return {
      success: false,
      message: 'Failed to create Drive client'
    };
  }

  try {
    // Try to access Drive API to verify credentials
    await drive.files.list({ pageSize: 1, fields: 'files(id)' });
    return {
      success: true,
      message: 'Google Drive credentials verified successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: `Google Drive credential verification failed: ${error.message}`,
      error: error
    };
  }
};

module.exports = {
  uploadFileToDrive,
  deleteFileFromDrive,
  getFileInfo,
  isDriveConfigured,
  getDriveClient,
  verifyDriveCredentials
};
