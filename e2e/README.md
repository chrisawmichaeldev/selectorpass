# SelectorPass E2E Tests

Automated end-to-end tests for the SelectorPass Chrome extension using Playwright and TypeScript.

## Setup

```bash
cd e2e
npm install
npm run install  # Install Playwright browsers
```

## Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests with browser visible
npm run test:headed

# Run tests with debug mode
npm run test:debug

# Open Playwright UI
npm run test:ui
```

## Test Structure

- `tests/extension-helper.ts` - Helper class for common extension operations
- `tests/critical.spec.ts` - Critical functionality tests
- `playwright.config.ts` - Playwright configuration with extension loading

## Key Features

- **Extension Loading**: Automatically loads the SelectorPass extension
- **TypeScript Support**: Full type safety and IntelliSense
- **Sequential Testing**: Prevents race conditions in extension state
- **Local Server**: Serves demo.html for form filling tests
- **Screenshots/Videos**: Captures failures for debugging

## Test Categories

- **CRITICAL**: Core functionality (master password, encryption, credentials)
- **HIGH**: Advanced features (domain management, encryption controls)
- **MEDIUM**: UX features (auto-sort, cross-tab sync)

## Adding New Tests

1. Create new `.spec.ts` file in `tests/` directory
2. Import `ExtensionHelper` for common operations
3. Use proper TypeScript types from `@playwright/test`
4. Follow existing test patterns for consistency

## Debugging

- Use `test:debug` to step through tests
- Check `test-results/` for screenshots and videos
- Use `page.pause()` to inspect state during test execution