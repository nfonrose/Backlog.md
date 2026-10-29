# Utilisation de la version Custom via un Binaire Natif (Méthode la plus fiable)

Ce document explique comment compiler votre version modifiée de `backlog.md` en un binaire natif autonome et configurer un alias pour l'utiliser partout. C'est la méthode la plus robuste car elle évite les problèmes de résolution de chemins liés à l'exécution directe des fichiers TypeScript via `bun run`.

## 1. Compilation du binaire natif

Allez dans le répertoire du projet source et compilez le binaire. L'utilisation de `--compile` permet d'embarquer le runtime Bun et les assets web (HTML/CSS) directement dans un seul fichier exécutable.

```bash
cd /Users/teevity/Dev/misc/4.backlogMD/Backlog.md

# Build du CSS (nécessaire pour l'UI web)
bun run build:css

# Compilation du binaire natif
# On injecte une version spécifique pour la distinguer de la version officielle
bun build --compile --minify \
  --define __EMBEDDED_VERSION__="\"1.14.4-prt\"" \
  --outfile dist/backlog-native \
  src/cli.ts
```

## 2. Configuration de l'alias

Pour utiliser cette version partout sans conflit avec la commande `backlog` officielle :

1. Ouvrez votre fichier de configuration `.zshrc` (ou `.bashrc`) :
   ```bash
   nano ~/.zshrc
   ```

2. Ajoutez l'alias suivant :
   ```zsh
   # Alias vers la version custom de Backlog.md
   alias prt-backlog="/Users/teevity/Dev/misc/4.backlogMD/Backlog.md/dist/backlog-native"
   ```

3. Rechargez votre configuration :
   ```bash
   source ~/.zshrc
   ```

## 3. Utilisation

Désormais, vous pouvez utiliser `prt-backlog` depuis n'importe quel dossier :

```bash
# Vérifier la version
prt-backlog --version
# Sortie : 1.14.4-prt

# Lancer l'interface web dans votre dossier de tâches
cd /votre/dossier/de/taches
prt-backlog browser -p 7521
```

## Pourquoi cette méthode est préférable ?

Cette méthode par binaire natif est supérieure à l'utilisation d'un alias pointant directement vers le fichier source (`bun src/cli.ts`) pour plusieurs raisons :

1. **Isolation des Chemins** : Le binaire natif embarque ses propres ressources (comme le fichier `index.html` de l'interface web). Il n'essaie pas de les chercher sur le disque par rapport au répertoire où vous vous trouvez, ce qui règle les problèmes de "page blanche" ou de chargement par erreur du projet source de l'outil au lieu de votre projet de tâches actuel.
2. **Stabilité de la Version** : Le numéro de version est injecté au moment de la compilation. Cela évite que l'outil ne tente de lire le `package.json` de votre répertoire de travail actuel, ce qui causerait des erreurs de version (souvent affichant `0.0.0`).
3. **Indépendance du Runtime** : Le binaire contient son propre moteur d'exécution. Vous n'avez pas de risques de conflits de "shebang" (Node vs Bun) ou de problèmes liés aux variables d'environnement globales.
4. **Performance** : Le binaire démarre instantanément car il est déjà compilé et minifié, contrairement au script `.ts` qui nécessite une étape de transpilation à chaque lancement.
