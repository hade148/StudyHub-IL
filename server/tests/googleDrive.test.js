const { isDriveConfigured } = require('../src/utils/googleDrive');

describe('Google Drive Utility Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('isDriveConfigured', () => {
    it('should return false when credentials are not set', () => {
      delete process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
      delete process.env.GOOGLE_DRIVE_PRIVATE_KEY;
      
      // Re-import to get fresh module
      const { isDriveConfigured: freshIsDriveConfigured } = require('../src/utils/googleDrive');
      expect(freshIsDriveConfigured()).toBe(false);
    });

    it('should return false when only client email is set', () => {
      process.env.GOOGLE_DRIVE_CLIENT_EMAIL = 'test@example.com';
      delete process.env.GOOGLE_DRIVE_PRIVATE_KEY;
      
      const { isDriveConfigured: freshIsDriveConfigured } = require('../src/utils/googleDrive');
      expect(freshIsDriveConfigured()).toBe(false);
    });

    it('should return false when only private key is set', () => {
      delete process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
      process.env.GOOGLE_DRIVE_PRIVATE_KEY = 'test-key';
      
      const { isDriveConfigured: freshIsDriveConfigured } = require('../src/utils/googleDrive');
      expect(freshIsDriveConfigured()).toBe(false);
    });

    it('should return true when both credentials are set', () => {
      process.env.GOOGLE_DRIVE_CLIENT_EMAIL = 'test@example.com';
      process.env.GOOGLE_DRIVE_PRIVATE_KEY = 'test-key';
      
      const { isDriveConfigured: freshIsDriveConfigured } = require('../src/utils/googleDrive');
      expect(freshIsDriveConfigured()).toBe(true);
    });
  });
});
