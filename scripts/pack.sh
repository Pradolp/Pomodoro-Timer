#!/usr/bin/env bash
# Gera o .zip para enviar ao extensions.gnome.org (fica na pasta dist/).
set -euo pipefail

cd "$(dirname "$0")/.."
UUID="pomodoro-timer@lucasprado"

mkdir -p dist
gnome-extensions pack "$UUID" \
    --force \
    --out-dir dist \
    --extra-source=timer.js

echo "Pacote gerado em dist/$UUID.shell-extension.zip"
