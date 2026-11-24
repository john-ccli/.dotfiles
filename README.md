# .dotfiles

This repo contains a very opinionated set of tooling designed to get one up and running as fast as possible.

## TL;DR

- It is designed for MacOS. It will never work on Windows.
- It requires [brew](https://brew.sh/).
- It uses [stow](https://www.gnu.org/software/stow/manual/stow.html) to symlink config files to where they need to be.

## 🚀 Quick Start (Recommended)

You can get started right away by running a vibe-coded bootstrap script which will allow you to choose which packages you want to deploy:

```sh
./bootstrap.rb
```

Note that different packages will have **required** dependencies and **suggested** dependencies.
