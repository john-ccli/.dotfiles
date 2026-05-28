#!/bin/bash

# Install Homebrew for package management
if ! which brew >/dev/null 2>&1; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install stow for managing config
brew install stow
for dir in */; do stow "$dir"; done

# Install Zsh and a better terminal (ghostty)
brew install zsh zsh-autosuggestions zsh-syntax-highlighting zsh-history-substring-search starship
brew install --cask ghostty
brew install --cask font-hack-nerd-font

# Install git and related tools
brew install git      # version control
brew install lazygit  # terminal UI for git
brew install gpg      # for signing commits

# Install tools for searching and previewing files
brew install fzf      # fuzzy finder
brew install bat      # better cat with syntax highlighting
brew install ripgrep  # faster grep alternative
brew install fd       # faster find alternative

# Install mise for runtime management (e.g., Node.js, Python)
brew install mise
mise install

# Install Obsidian for knowledge management
brew install --cask obsidian
mkdir -p ~/notes

# Install Visual Studio Code for development
brew install --cask visual-studio-code
mkdir -p ~/workspace