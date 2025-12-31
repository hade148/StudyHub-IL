# Selenium E2E Tests for StudyHub-IL

## Overview
This directory contains End-to-End (E2E) tests using Selenium WebDriver for the StudyHub-IL platform. These tests verify critical user flows and functionality.

## Test Suite

### Test Files
1. **test_01_user_authentication.py** - User registration, login, and logout
2. **test_02_summary_upload.py** - Summary file upload and management
3. **test_03_forum_interaction.py** - Forum posts creation and interaction
4. **test_04_tools_usage.py** - Educational tools navigation and usage
5. **test_05_profile_management.py** - User profile viewing and editing

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Google Chrome browser installed
- Node.js and npm (for running the application)

### Installation

1. **Install Python dependencies:**
```bash
cd selenium-tests
pip install -r requirements.txt
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start the application:**

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

Wait for both servers to start before running tests.

## Running Tests

### Run All Tests
```bash
pytest -v
```

### Run Specific Test File
```bash
pytest test_01_user_authentication.py -v
```

### Run with HTML Report
```bash
pytest --html=report.html --self-contained-html
```

### Run in Headless Mode
Set `HEADLESS_MODE=true` in `.env` file, then:
```bash
pytest -v
```

### Run Specific Test
```bash
pytest test_01_user_authentication.py::TestUserAuthentication::test_03_user_login_success -v
```

## Test Configuration

Edit `.env` file to configure:
- `BASE_URL` - Frontend URL (default: http://localhost:5173)
- `API_URL` - Backend API URL (default: http://localhost:4000)
- `TEST_EMAIL` - Test user email
- `TEST_PASSWORD` - Test user password
- `HEADLESS_MODE` - Run browser in headless mode (true/false)
- `SCREENSHOT_ON_FAILURE` - Take screenshots on test failure (true/false)

## Test Structure

Each test file follows this structure:
```python
class TestFeatureName:
    @pytest.fixture(autouse=True)
    def setup(self, authenticated_driver):
        # Setup code
        pass
    
    def test_01_test_name(self):
        # Test implementation
        pass
```

## Screenshots

Screenshots are automatically captured:
- On test failure (if `SCREENSHOT_ON_FAILURE=true`)
- At key points during test execution
- Stored in `screenshots/` directory

## Common Issues

### ChromeDriver not found
- The tests use `webdriver-manager` to automatically download ChromeDriver
- If issues persist, manually install ChromeDriver

### Connection refused
- Ensure both frontend and backend servers are running
- Check URLs in `.env` match your local setup

### Element not found errors
- UI might have changed - check selectors in test files
- Increase wait times in `conftest.py` if needed

### Login fails in tests
- Verify test user exists in database
- Check credentials in `.env` file
- Run server seed script: `cd server && npm run seed`

## Test Reports

### HTML Report
Generate detailed HTML report:
```bash
pytest --html=report.html --self-contained-html
```

### JUnit XML Report (for CI/CD)
```bash
pytest --junitxml=test-results.xml
```

## Continuous Integration

To run these tests in CI/CD:

1. Install Chrome and ChromeDriver in CI environment
2. Set environment variables
3. Start application servers
4. Run pytest with appropriate flags

Example GitHub Actions:
```yaml
- name: Run Selenium Tests
  run: |
    cd selenium-tests
    pip install -r requirements.txt
    pytest --junitxml=test-results.xml
```

## Best Practices

1. **Stable Selectors**: Tests use multiple selector strategies for robustness
2. **Explicit Waits**: Tests wait for elements to be available
3. **Screenshots**: Captured at key points for debugging
4. **Independent Tests**: Each test can run independently
5. **Cleanup**: Tests clean up after themselves

## Maintenance

### Updating Tests
When UI changes:
1. Update selectors in test files
2. Update wait times if needed
3. Re-run tests to verify

### Adding New Tests
1. Create new test file following naming convention: `test_XX_feature_name.py`
2. Use `authenticated_driver` fixture for logged-in tests
3. Follow existing test structure
4. Add documentation to this README

## Support

For issues or questions:
1. Check test output and screenshots
2. Review application logs
3. Verify environment configuration
4. Check that test user exists in database

## Test Coverage

Current test coverage includes:
- ✅ User authentication flows
- ✅ Summary upload and management
- ✅ Forum interaction
- ✅ Tools navigation
- ✅ Profile management
- ✅ Basic validation and error handling

## Future Enhancements

Potential additions:
- [ ] Content search tests
- [ ] Rating system tests
- [ ] Admin functionality tests
- [ ] Performance tests
- [ ] Accessibility tests
- [ ] Mobile responsiveness tests
