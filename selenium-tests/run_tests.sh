#!/bin/bash

# Selenium Test Runner Script for StudyHub-IL
# This script helps run the Selenium tests with various options

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

print_info "StudyHub-IL Selenium Test Runner"
echo "=================================="

# Check if we're in the selenium-tests directory
if [ ! -f "requirements.txt" ]; then
    print_error "Please run this script from the selenium-tests directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Copying from .env.example..."
    cp .env.example .env
    print_info "Please edit .env file with your configuration"
fi

# Check if dependencies are installed
if ! python3 -c "import selenium" 2>/dev/null; then
    print_warning "Selenium not found. Installing dependencies..."
    pip install -r requirements.txt
fi

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

# Parse command line arguments
TEST_FILE=""
HEADLESS=false
HTML_REPORT=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--headless)
            HEADLESS=true
            shift
            ;;
        -r|--report)
            HTML_REPORT=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -t|--test)
            TEST_FILE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: ./run_tests.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -h, --headless        Run tests in headless mode"
            echo "  -r, --report          Generate HTML report"
            echo "  -v, --verbose         Verbose output"
            echo "  -t, --test FILE       Run specific test file"
            echo "  --help                Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./run_tests.sh                          # Run all tests"
            echo "  ./run_tests.sh -h -r                    # Headless with report"
            echo "  ./run_tests.sh -t test_01_user_authentication.py"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set headless mode in environment if requested
if [ "$HEADLESS" = true ]; then
    export HEADLESS_MODE=true
    print_info "Running in headless mode"
fi

# Build pytest command
PYTEST_CMD="pytest"

if [ -n "$TEST_FILE" ]; then
    PYTEST_CMD="$PYTEST_CMD $TEST_FILE"
    print_info "Running specific test: $TEST_FILE"
else
    print_info "Running all tests"
fi

if [ "$VERBOSE" = true ]; then
    PYTEST_CMD="$PYTEST_CMD -v -s"
else
    PYTEST_CMD="$PYTEST_CMD -v"
fi

if [ "$HTML_REPORT" = true ]; then
    PYTEST_CMD="$PYTEST_CMD --html=report.html --self-contained-html"
    print_info "HTML report will be generated: report.html"
fi

# Check if servers are running
print_info "Checking if application servers are running..."

if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    print_warning "Frontend (http://localhost:5173) is not responding"
    print_warning "Please start the frontend: cd client && npm run dev"
fi

if ! curl -s http://localhost:4000 > /dev/null 2>&1; then
    print_warning "Backend (http://localhost:4000) is not responding"
    print_warning "Please start the backend: cd server && npm run dev"
fi

echo ""
print_info "Starting tests..."
echo "=================================="

# Run the tests
if $PYTEST_CMD; then
    echo ""
    echo "=================================="
    print_info "All tests completed successfully! ✓"
    
    if [ "$HTML_REPORT" = true ]; then
        print_info "HTML report generated: report.html"
    fi
    
    print_info "Screenshots saved in: screenshots/"
    exit 0
else
    echo ""
    echo "=================================="
    print_error "Some tests failed! ✗"
    
    if [ "$HTML_REPORT" = true ]; then
        print_info "Check HTML report for details: report.html"
    fi
    
    print_info "Check screenshots in: screenshots/"
    exit 1
fi
