/**
 * Configuration for GitHub Flow CLI
 */

// Load environment variables
require('dotenv').config();

module.exports = {
  // GitHub plugin configuration
  github: {
    // GitHub personal access token
    token: process.env.GITHUB_TOKEN,
    
    // GitHub username
    username: process.env.GITHUB_USERNAME
  }
};
