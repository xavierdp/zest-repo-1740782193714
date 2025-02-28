# Flow Server GitHub Plugin

A plugin for Flow Server Framework to interact with GitHub API.

## Features

- Create GitHub repositories
- List repositories
- Get repository details
- Update repositories
- Delete repositories
- Get user information

## Installation

```bash
npm install flow-server-plugin-github
```

## Usage

```javascript
const githubPlugin = require('flow-server-plugin-github');
const FlowServer = require('flow-server');

// Create Flow Server instance
const server = new FlowServer({
  plugins: {
    github: {
      token: 'your-github-token',
      username: 'your-github-username'
    }
  }
});

// Register GitHub plugin
server.use(githubPlugin);

// Use GitHub repository service
const repoService = server.services.get('github.repository');
const userService = server.services.get('github.user');

// Create a repository
repoService.create({
  name: 'my-repo',
  description: 'My awesome repository',
  private: false,
  autoInit: true
}).then(repo => {
  console.log('Repository created:', repo.html_url);
});
```

## CLI Tool

This repository also includes a CLI tool for managing GitHub repositories:

```bash
# Create a repository
node index.js create --name my-repo --description "My repository" --init

# List repositories
node index.js list

# Delete a repository
node index.js delete username repo-name
```

## License

MIT
