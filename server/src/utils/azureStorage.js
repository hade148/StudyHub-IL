const { BlobServiceClient } = require('@azure/storage-blob');

/**
 * Azure Blob Storage utility for handling file uploads and downloads
 */
class AzureStorageService {
  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'studyhub-files';
    this.blobServiceClient = null;
    this.containerClient = null;
    
    if (this.connectionString) {
      this.initialize();
    }
  }

  /**
   * Initialize Azure Blob Storage client
   */
  initialize() {
    try {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      console.log('✅ Azure Blob Storage initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Azure Blob Storage:', error.message);
    }
  }

  /**
   * Check if Azure Storage is configured
   */
  isConfigured() {
    return this.connectionString && this.containerClient !== null;
  }

  /**
   * Upload a file to Azure Blob Storage
   * @param {Buffer} fileBuffer - File buffer to upload
   * @param {string} fileName - Name of the file in blob storage
   * @param {string} contentType - MIME type of the file
   * @returns {Promise<string>} - URL of the uploaded blob
   */
  async uploadFile(fileBuffer, fileName, contentType) {
    if (!this.isConfigured()) {
      throw new Error('Azure Storage is not configured');
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      
      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: { blobContentType: contentType }
      });

      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure:', error);
      throw new Error('Failed to upload file to Azure Storage');
    }
  }

  /**
   * Delete a file from Azure Blob Storage
   * @param {string} fileName - Name of the file to delete
   * @returns {Promise<boolean>} - True if deleted successfully
   */
  async deleteFile(fileName) {
    if (!this.isConfigured()) {
      throw new Error('Azure Storage is not configured');
    }

    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.delete();
      return true;
    } catch (error) {
      console.error('Error deleting file from Azure:', error);
      // Don't throw error if file doesn't exist
      if (error.statusCode === 404) {
        return true;
      }
      throw new Error('Failed to delete file from Azure Storage');
    }
  }

  /**
   * Get file URL from Azure Blob Storage
   * @param {string} fileName - Name of the file
   * @returns {string} - URL of the blob
   */
  getFileUrl(fileName) {
    if (!this.isConfigured()) {
      throw new Error('Azure Storage is not configured');
    }

    const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
    return blockBlobClient.url;
  }

  /**
   * Extract blob name from URL or path
   * @param {string} urlOrPath - Azure blob URL or local path
   * @returns {string} - Blob name
   */
  extractBlobName(urlOrPath) {
    // If it's an Azure URL, extract the blob name
    // Check for full Azure blob storage URL pattern
    const azureBlobPattern = /^https:\/\/[a-z0-9]+\.blob\.core\.windows\.net\/[^/]+\/(.+)$/i;
    const match = urlOrPath.match(azureBlobPattern);
    
    if (match) {
      // Return the captured blob name (group 1)
      return match[1];
    }
    
    // If it's a local path, extract the filename
    if (urlOrPath.includes('/')) {
      const parts = urlOrPath.split('/');
      return parts[parts.length - 1];
    }
    return urlOrPath;
  }
}

// Export singleton instance
module.exports = new AzureStorageService();
