/**
 * Utility functions for file handling
 */

/**
 * Sanitize a filename to prevent security issues while preserving Unicode characters
 * Removes characters that are invalid in filenames across different platforms
 * @param {string} filename - The original filename
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // Remove only characters that are invalid in filenames across platforms
  // Keep Hebrew and other Unicode characters
  // Invalid chars: < > : " / \ | ? *
  const sanitized = filename.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
  
  // Ensure the filename doesn't start with special characters or contain '..'
  const safe = sanitized.replace(/^[._-]+/, '').replace(/\.\./g, '_');
  
  // Ensure we have at least some content
  return safe || 'file';
};

module.exports = {
  sanitizeFilename
};
