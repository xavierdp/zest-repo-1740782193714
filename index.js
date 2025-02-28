#!/usr/bin/env node

/**
 * GitHub Flow CLI
 * 
 * CLI application for creating and managing GitHub repositories
 * using the Flow Server GitHub plugin.
 */

// Import dependencies
const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const github = require('./github-service');

// Configure CLI
program
  .name('github-flow')
  .description('CLI pour créer et effacer des dépôts GitHub')
  .version('1.0.0');

// Create repository command
program
  .command('create')
  .description('Créer un nouveau dépôt GitHub')
  .option('-n, --name <name>', 'Nom du dépôt')
  .option('-d, --description <description>', 'Description du dépôt')
  .option('-p, --private', 'Dépôt privé', false)
  .option('-i, --init', 'Initialiser avec un README', true)
  .option('-g, --gitignore <template>', 'Template .gitignore')
  .option('-l, --license <license>', 'Template de licence')
  .action(async (options) => {
    try {
      // If name is not provided, prompt for it
      if (!options.name) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Nom du dépôt:',
            validate: (input) => input.trim() !== '' ? true : 'Le nom du dépôt est requis'
          }
        ]);
        options.name = answers.name;
      }
      
      console.log(chalk.blue('Création du dépôt...'));
      
      const repository = await github.repositories.create({
        name: options.name,
        description: options.description,
        private: options.private,
        autoInit: options.init,
        gitignoreTemplate: options.gitignore,
        licenseTemplate: options.license
      });
      
      console.log(chalk.green('✓ Dépôt créé avec succès!'));
      console.log(chalk.white('Nom:'), repository.name);
      console.log(chalk.white('Visibilité:'), repository.private ? 'Privé' : 'Public');
      console.log(chalk.white('URL:'), repository.html_url);
      console.log(chalk.white('Description:'), repository.description || 'Aucune description');
      console.log(chalk.white('Date de création:'), new Date(repository.created_at).toLocaleString());
    } catch (error) {
      console.error(chalk.red('Erreur lors de la création du dépôt:'), error.message);
      process.exit(1);
    }
  });

// List repositories command
program
  .command('list')
  .description('Lister les dépôts GitHub')
  .option('-l, --limit <number>', 'Nombre maximum de dépôts à afficher', parseInt)
  .option('-s, --sort <field>', 'Champ de tri (created, updated, pushed, full_name)', 'full_name')
  .option('-d, --direction <direction>', 'Direction de tri (asc, desc)', 'asc')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Récupération des dépôts...'));
      
      const repositories = await github.repositories.list({
        sort: options.sort,
        direction: options.direction
      });
      
      // Apply limit if provided
      const limitedRepos = options.limit ? repositories.slice(0, options.limit) : repositories;
      
      console.log(chalk.green(`✓ ${limitedRepos.length} dépôts trouvés:`));
      
      // Display repositories
      limitedRepos.forEach((repo, index) => {
        console.log(chalk.white(`\n${index + 1}. ${repo.name}`));
        console.log(chalk.white('   Visibilité:'), repo.private ? 'Privé' : 'Public');
        console.log(chalk.white('   URL:'), repo.html_url);
        console.log(chalk.white('   Description:'), repo.description || 'Aucune description');
        console.log(chalk.white('   Dernière mise à jour:'), new Date(repo.updated_at).toLocaleString());
      });
    } catch (error) {
      console.error(chalk.red('Erreur lors de la récupération des dépôts:'), error.message);
      process.exit(1);
    }
  });

// Get repository command
program
  .command('get')
  .description('Obtenir les détails d\'un dépôt GitHub')
  .argument('<owner>', 'Propriétaire du dépôt')
  .argument('<repo>', 'Nom du dépôt')
  .action(async (owner, repo) => {
    try {
      console.log(chalk.blue(`Récupération du dépôt ${owner}/${repo}...`));
      
      const repository = await github.repositories.get({
        owner,
        repo
      });
      
      console.log(chalk.green('✓ Dépôt trouvé:'));
      console.log(chalk.white('Nom:'), repository.name);
      console.log(chalk.white('Propriétaire:'), repository.owner.login);
      console.log(chalk.white('Visibilité:'), repository.private ? 'Privé' : 'Public');
      console.log(chalk.white('URL:'), repository.html_url);
      console.log(chalk.white('Description:'), repository.description || 'Aucune description');
      console.log(chalk.white('Langage principal:'), repository.language || 'Non spécifié');
      console.log(chalk.white('Étoiles:'), repository.stargazers_count);
      console.log(chalk.white('Forks:'), repository.forks_count);
      console.log(chalk.white('Issues ouvertes:'), repository.open_issues_count);
      console.log(chalk.white('Date de création:'), new Date(repository.created_at).toLocaleString());
      console.log(chalk.white('Dernière mise à jour:'), new Date(repository.updated_at).toLocaleString());
    } catch (error) {
      console.error(chalk.red(`Erreur lors de la récupération du dépôt ${owner}/${repo}:`), error.message);
      process.exit(1);
    }
  });

// Delete repository command
program
  .command('delete')
  .description('Supprimer un dépôt GitHub')
  .argument('[owner]', 'Propriétaire du dépôt')
  .argument('[repo]', 'Nom du dépôt')
  .option('-f, --force', 'Forcer la suppression sans confirmation', false)
  .action(async (owner, repo, options) => {
    try {
      // If owner or repo is not provided, prompt for them
      if (!owner || !repo) {
        // Get authenticated user if owner is not provided
        if (!owner) {
          const user = await github.users.getAuthenticated();
          owner = user.login;
        }
        
        // If repo is not provided, list repositories and prompt for selection
        if (!repo) {
          const repositories = await github.repositories.list();
          
          if (repositories.length === 0) {
            console.log(chalk.yellow('Aucun dépôt trouvé.'));
            return;
          }
          
          const answers = await inquirer.prompt([
            {
              type: 'list',
              name: 'repo',
              message: 'Sélectionnez un dépôt à supprimer:',
              choices: repositories.map(r => ({
                name: `${r.name} (${r.private ? 'Privé' : 'Public'})`,
                value: r.name
              }))
            }
          ]);
          
          repo = answers.repo;
        }
      }
      
      // Confirm deletion
      if (!options.force) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Êtes-vous sûr de vouloir supprimer le dépôt ${owner}/${repo}? Cette action est irréversible.`,
            default: false
          }
        ]);
        
        if (!answers.confirm) {
          console.log(chalk.yellow('Suppression annulée.'));
          return;
        }
      }
      
      console.log(chalk.blue(`Suppression du dépôt ${owner}/${repo}...`));
      
      await github.repositories.delete({
        owner,
        repo
      });
      
      console.log(chalk.green(`✓ Dépôt ${owner}/${repo} supprimé avec succès!`));
    } catch (error) {
      console.error(chalk.red('Erreur lors de la suppression du dépôt:'), error.message);
      process.exit(1);
    }
  });

// User info command
program
  .command('user')
  .description('Obtenir les informations de l\'utilisateur authentifié')
  .action(async () => {
    try {
      console.log(chalk.blue('Récupération des informations utilisateur...'));
      
      const user = await github.users.getAuthenticated();
      
      console.log(chalk.green('✓ Informations utilisateur:'));
      console.log(chalk.white('Nom d\'utilisateur:'), user.login);
      console.log(chalk.white('Nom:'), user.name || 'Non spécifié');
      console.log(chalk.white('Email:'), user.email || 'Non spécifié');
      console.log(chalk.white('Bio:'), user.bio || 'Non spécifiée');
      console.log(chalk.white('Dépôts publics:'), user.public_repos);
      console.log(chalk.white('Followers:'), user.followers);
      console.log(chalk.white('Following:'), user.following);
      console.log(chalk.white('Date de création:'), new Date(user.created_at).toLocaleString());
    } catch (error) {
      console.error(chalk.red('Erreur lors de la récupération des informations utilisateur:'), error.message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.help();
}
