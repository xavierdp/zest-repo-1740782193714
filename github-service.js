/**
 * GitHub Service
 * 
 * Service for interacting with GitHub API
 */

// Import GitHub plugin
const githubPlugin = require('../../new-way3/flow-server-plugin-github');
const config = require('./config');

// Initialize GitHub plugin
const github = githubPlugin();

// Mock Flow Server for plugin initialization
const flowServer = {
  config: {
    get: (path) => {
      if (path === 'plugins.github.token') return config.github.token;
      if (path === 'plugins.github.username') return config.github.username;
      return undefined;
    }
  },
  services: new Map()
};

// Initialize GitHub plugin
github.init(flowServer);

// Get GitHub services
const repositoryService = flowServer.services.get('github.repository');
const userService = flowServer.services.get('github.user');

module.exports = {
  // Repository methods
  repositories: {
    /**
     * Create a new repository
     * @param {Object} options Repository options
     * @returns {Promise<Object>} Created repository
     */
    create: async (options) => {
      return repositoryService.create(options);
    },
    
    /**
     * List repositories for the authenticated user
     * @param {Object} options List options
     * @returns {Promise<Array>} List of repositories
     */
    list: async (options = {}) => {
      return repositoryService.list(options);
    },
    
    /**
     * Get a repository by owner and name
     * @param {Object} options Repository options
     * @returns {Promise<Object>} Repository
     */
    get: async (options) => {
      return repositoryService.get(options);
    },
    
    /**
     * Update a repository
     * @param {Object} options Repository options
     * @returns {Promise<Object>} Updated repository
     */
    update: async (options) => {
      return repositoryService.update(options);
    },
    
    /**
     * Delete a repository
     * @param {Object} options Repository options
     * @returns {Promise<void>}
     */
    delete: async (options) => {
      return repositoryService.delete(options);
    }
  },
  
  // User methods
  users: {
    /**
     * Get a user by username
     * @param {Object} options User options
     * @returns {Promise<Object>} User
     */
    get: async (options) => {
      return userService.get(options);
    },
    
    /**
     * Get the authenticated user
     * @returns {Promise<Object>} Authenticated user
     */
    getAuthenticated: async () => {
      return userService.getAuthenticated();
    }
  }
};
