# Contributing to RentChain Frontend

Thank you for your interest in contributing to RentChain! This guide will help you get started.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Fork and Clone

1. Fork the repository
2. Clone your fork locally
3. Add the upstream remote

```bash
git clone https://github.com/yourusername/rentchain-frontend.git
cd rentchain-frontend
git remote add upstream https://github.com/rentchain/rentchain-frontend.git
```

### Setup Development Environment

```bash
npm install
cp .env.example .env
npm run dev
```

## Development Workflow

### Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests

### Make Your Changes

1. Write clean, readable code
2. Follow the existing code style
3. Add tests for new features
4. Update documentation as needed
5. Ensure all tests pass

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic
- Use TailwindCSS for styling

### Commit Messages

Follow the Conventional Commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance

Example:

```
feat(search): add location-based filtering

Add ability to filter properties by location radius.
Includes map integration and distance calculations.

Closes #123
```

### Testing

Write tests for all new features:

```bash
npm test
npm run test:coverage
```

Ensure coverage stays above 70%.

### Linting

```bash
npm run lint
npm run lint:fix
```

## Pull Request Process

1. Update your branch with the latest upstream changes
2. Ensure all tests pass
3. Update the README if needed
4. Create a pull request with a clear description
5. Link related issues
6. Request review from maintainers

### PR Checklist

- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Responsive design verified
- [ ] Accessibility checked

## Code Review

- Be respectful and constructive
- Respond to feedback promptly
- Make requested changes
- Re-request review after updates

## Reporting Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser and OS information

### Feature Requests

Include:
- Problem being solved
- Proposed solution
- Alternative solutions considered
- Additional context

## Questions?

- Open a discussion on GitHub
- Join our Discord community
- Email dev@rentchain.xyz

Thank you for contributing to RentChain!
