#!/usr/bin/env bash
# Instala a extensão para testes: cria um link da pasta do projeto para a pasta
# de extensões do usuário. Editar os arquivos aqui já altera a versão instalada.
set -euo pipefail

cd "$(dirname "$0")/.."
UUID="pomodoro-timer@lucasprado"
SRC="$PWD/$UUID"
DEST="$HOME/.local/share/gnome-shell/extensions/$UUID"

glib-compile-schemas "$SRC/schemas"

mkdir -p "$(dirname "$DEST")"
if [ -e "$DEST" ] && [ ! -L "$DEST" ]; then
    echo "Erro: $DEST já existe e não é um link. Remova-o antes de continuar." >&2
    exit 1
fi
ln -sfn "$SRC" "$DEST"

echo "Extensão instalada em $DEST"
echo "No Wayland, saia da sessão e entre de novo, depois ative com:"
echo "  gnome-extensions enable $UUID"
