source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /opt/homebrew/share/zsh-history-substring-search/zsh-history-substring-search.zsh
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
autoload -Uz compinit && compinit

source <(mise activate zsh)
source <(starship init zsh)
source <(fzf --zsh)

export FZF_DEFAULT_COMMAND='fd --type file --color=always --follow --hidden --exclude .git --exclude node_modules'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_DEFAULT_OPTS="--ansi"

alias lg=lazygit
alias mid='date +%Y%m%d%H%M'

# Node.js
export NODE_USE_SYSTEM_CA=1 # Needed so VPN re-packaged traffic doesn't look like a self-signed cert

# Vite+ bin (https://viteplus.dev)
. "$HOME/.vite-plus/env"

# Added by LM Studio CLI (lms)
export PATH="$PATH:/Users/jlynn/.lmstudio/bin"
# End of LM Studio CLI section


# Added by codebase-memory-mcp install
export PATH="/Users/jlynn/.local/bin:$PATH"

# Google
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

# opencode
export PATH=/Users/jlynn/.opencode/bin:$PATH

# My own scripts
export PATH="$HOME/.local/bin:$PATH"

