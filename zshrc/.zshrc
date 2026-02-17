source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /opt/homebrew/share/zsh-history-substring-search/zsh-history-substring-search.zsh
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

source <(mise activate zsh)
source <(starship init zsh)
source <(fzf --zsh)

export FZF_DEFAULT_COMMAND='fd --type file --color=always --follow --hidden --exclude .git --exclude node_modules'
export FZF_CTRL_T_COMMAND="$FZF_DEFAULT_COMMAND"
export FZF_DEFAULT_OPTS="--ansi"

alias lg=lazygit
alias mid='date +%Y%m%d%H%M'
