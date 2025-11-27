#!/bin/bash
# Détecte l'OS et crée le symlink approprié vers le bon node_modules

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Détecter la plateforme
if [[ "$(uname -s)" == "Linux" ]]; then
    TARGET="node_modules.linux"
else
    TARGET="node_modules.win"
fi

# Supprimer le symlink existant si c'est un symlink
if [ -L "node_modules" ]; then
    rm node_modules
fi

# Créer le symlink
if [ -d "$TARGET" ]; then
    ln -s "$TARGET" node_modules
    echo "Switched to $TARGET"
else
    echo "$TARGET not found. Run: pnpm install"
    exit 1
fi
