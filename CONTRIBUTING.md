# Contributing to TheSupaDevs

We love your input! We want to make contributing to TheSupaDevs as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start

1. **Fork the repo** and create your branch from `main`
2. **Clone your fork** locally
3. **Install dependencies**: `pnpm install`
4. **Set up environment** (see README.md)
5. **Make your changes**
6. **Test your changes** locally
7. **Submit a pull request**

## 🐛 Report Bugs Using GitHub Issues

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/drealdumore/thesupadevs/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## 💡 Suggest Features

We welcome feature suggestions! Please:

1. **Check existing issues** first to avoid duplicates
2. **Open a new issue** with the `enhancement` label
3. **Describe the feature** and why it would be useful
4. **Include mockups** or examples if applicable

## 🔧 Development Process

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/thesupadevs.git
cd thesupadevs

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
pnpm dev
```

### Code Style

- **TypeScript**: We use TypeScript for type safety
- **ESLint**: Run `pnpm lint` to check code style
- **Prettier**: Code is auto-formatted on commit
- **Tailwind CSS**: Use utility classes for styling
- **Component Structure**: Follow existing patterns

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new category filter
fix: resolve image loading issue
docs: update README setup instructions
style: improve button hover animations
refactor: optimize database queries
test: add unit tests for search functionality
```

## 📝 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**: `pnpm test`
4. **Check linting**: `pnpm lint`
5. **Update the README.md** with details of changes if applicable
6. **Request review** from maintainers

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## 🎯 Areas We Need Help With

### 🔥 High Priority
- **Performance optimizations**
- **Accessibility improvements**
- **Mobile responsiveness**
- **SEO enhancements**
- **Test coverage**

### 🚀 Features
- **Advanced search filters**
- **Resource bookmarking**
- **User profiles**
- **Resource ratings/reviews**
- **API endpoints**
- **Dark/light theme toggle**

### 🐛 Bug Fixes
- **Cross-browser compatibility**
- **Image loading issues**
- **Form validation edge cases**
- **Animation performance**

### 📚 Documentation
- **API documentation**
- **Component documentation**
- **Deployment guides**
- **Video tutorials**

## 🏗️ Project Architecture

### Key Technologies
- **Next.js 15**: App Router, Server Components
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations
- **Supabase**: Backend & Auth
- **shadcn/ui**: Component library

### Folder Structure
```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable components
├── lib/                # Utilities & types
└── styles/             # Global styles
```

### Component Guidelines
- Use **TypeScript** for all components
- Follow **shadcn/ui** patterns
- Add **proper props interfaces**
- Include **JSDoc comments** for complex logic
- Use **Framer Motion** for animations

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests
- **Unit tests** for utilities and hooks
- **Component tests** for UI components
- **Integration tests** for user flows
- **E2E tests** for critical paths

## 📋 Code Review Guidelines

### For Contributors
- **Keep PRs focused** and small
- **Write clear descriptions**
- **Respond to feedback** promptly
- **Test thoroughly** before submitting

### For Reviewers
- **Be constructive** and helpful
- **Focus on code quality** and maintainability
- **Check for accessibility** and performance
- **Approve when ready** or request changes

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issues
- `priority: low` - Low priority issues

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/thesupadevs)
- **Twitter**: [@drealdumore](https://twitter.com/drealdumore)
- **Email**: [samuel@thesupadevs.com](mailto:samuel@thesupadevs.com)
- **GitHub Discussions**: For questions and ideas

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards
- **Be respectful** and inclusive
- **Be collaborative** and helpful
- **Be patient** with newcomers
- **Give constructive feedback**
- **Focus on what's best** for the community

## 🎉 Recognition

Contributors will be:
- **Listed in README.md**
- **Mentioned in release notes**
- **Given contributor badge**
- **Invited to maintainer team** (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to TheSupaDevs!** 🚀

Every contribution, no matter how small, makes a difference. Let's build something amazing together!