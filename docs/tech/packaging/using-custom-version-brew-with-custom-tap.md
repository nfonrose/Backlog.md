# Packaging et Installation d'une Version Custom via Homebrew

Ce document explique comment packager votre version modifiée de `backlog.md` pour l'installer via Homebrew tout en conservant la possibilité d'utiliser la version officielle.

## Architecture de la Solution

Pour éviter les conflits avec la version officielle (`backlog-md`), nous allons :
1. Créer un **Tap** Homebrew personnel (un dépôt GitHub).
2. Créer une **Formula** nommée `backlog-custom`.
3. Utiliser le mécanisme de `link/unlink` de Homebrew pour basculer entre les deux versions si nécessaire, ou utiliser un alias différent.

## 1. Création du Tap Personnel

Un "Tap" est simplement un dépôt GitHub nommé `homebrew-<nom>`.

1. Créez un nouveau dépôt public sur GitHub nommé `homebrew-tap` (par exemple).
2. Sur votre machine, connectez-vous à ce tap :
   ```bash
   brew tap <votre-pseudo>/tap
   ```

## 2. Création de la Formula `backlog-custom`

Dans votre dépôt `homebrew-tap`, créez un fichier `Formula/backlog-custom.rb`.

Voici un modèle de formula qui compile le projet à partir de votre source (en supposant que vous pointez vers votre fork ou une archive de votre code) :

```ruby
class BacklogCustom < Formula
  desc "Version personnalisée de Backlog.md"
  homepage "https://github.com/<votre-pseudo>/Backlog.md"
  # Remplacez par l'URL de votre fork ou d'une release spécifique
  url "https://github.com/<votre-pseudo>/Backlog.md/archive/refs/heads/main.tar.gz"
  version "1.44.0-custom"
  # sha256 "L'EMPREINTE_SHA256_DU_TARBALL"

  depends_on "bun" => :build

  def install
    # Installation des dépendances et build du binaire binaire natif autonome
    # Le build:css est crucial pour que l'UI web fonctionne
    system "bun", "install"
    system "bun", "run", "build:css"
    
    # Compilation native pour macOS (ou autre plateforme)
    # L'utilisation de --compile fige les chemins et embarque les assets web
    system "bun", "build", "--compile", "--minify", 
           "--define", "__EMBEDDED_VERSION__=\"#{version}\"",
           "--outfile", "dist/backlog-custom", "src/cli.ts"
    
    # Installation du binaire dans le dossier bin de Homebrew
    bin.install "dist/backlog-custom"
  end

  test do
    system "#{bin}/backlog-custom", "--version"
  end
end
```

## 3. Installation

Une fois la formula prête et poussée sur votre dépôt GitHub :

```bash
brew install <votre-pseudo>/tap/backlog-custom
```

Vous disposez maintenant d'une commande `backlog-custom`.

## 4. Utilisation Coexistante avec la Version Officielle

### Option A : Commandes Distinctes (Recommandé)

Dans la formula ci-dessus, nous avons installé le binaire sous le nom `backlog-custom` :
`bin.install "dist/backlog" => "backlog-custom"`

- **Version officielle** : `backlog`
- **Votre version** : `backlog-custom`

C'est la méthode la plus sûre car elle permet d'utiliser les deux simultanément sans aucune manipulation.

### Option B : Utiliser `brew link` pour remplacer `backlog`

Si vous voulez que votre version custom réponde à la commande `backlog` :

1. Déliez la version officielle :
   ```bash
   brew unlink backlog-md
   ```
2. Modifiez votre formula pour installer le binaire sous le nom `backlog` :
   `bin.install "dist/backlog" => "backlog"`
3. Installez et liez votre version :
   ```bash
   brew install backlog-custom
   brew link backlog-custom
   ```

Pour revenir à la version officielle :
```bash
brew unlink backlog-custom
brew link backlog-md
```

## 5. Mise à jour de votre version

Lorsque vous faites des changements sur votre code :
1. Poussez vos changements sur votre fork.
2. Mettez à jour le `sha256` (si vous utilisez une URL fixe) ou incrémentez la `version` dans le fichier `.rb`.
3. Lancez :
   ```bash
   brew upgrade backlog-custom
   ```

---

**Note sur le développement local** :
Si vous voulez tester l'installation brew sans passer par GitHub, vous pouvez installer la formula directement via le chemin du fichier local :
```bash
brew install --build-from-source ./Formula/backlog-custom.rb
```
