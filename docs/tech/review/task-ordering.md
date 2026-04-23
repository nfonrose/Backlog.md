# Mécanisme d'ordonnancement des tâches (Ordinals)

Ce document décrit le fonctionnement du champ `ordinal` utilisé pour définir l'ordre manuel des tâches et des drafts dans Backlog.md.

## Concept de base

Le champ `ordinal` est une valeur numérique optionnelle ajoutée au frontmatter YAML des fichiers Markdown (`.md`). Contrairement à une simple liste indexée (1, 2, 3), le système utilise des nombres espacés pour permettre des insertions sans avoir à renuméroter l'ensemble des tâches.

## Logique de tri

L'ordre d'affichage (notamment dans la vue Kanban et les listes) suit cette hiérarchie de priorité :

1.  **Ordinal (si présent)** : Les tâches avec un `ordinal` sont toujours placées avant celles qui n'en ont pas. Entre elles, elles sont triées par valeur croissante (plus le nombre est petit, plus la tâche est haute).
2.  **Priorité** : Si deux tâches n'ont pas d'ordinal (ou ont le même), elles sont triées par priorité (`high` > `medium` > `low` > `undefined`).
3.  **ID de tâche** : En dernier recours, les tâches sont triées par leur identifiant numérique (ex: `back-1` avant `back-10`).

## Gestion des insertions (Midpoint Strategy)

Lorsqu'une tâche est déplacée manuellement via l'interface web ou l'API, le nouvel `ordinal` est calculé en fonction de sa position cible :

-   **Insertion au début** : Si la première tâche a un ordinal `N`, la nouvelle tâche reçoit `N / 2`.
-   **Insertion à la fin** : Si la dernière tâche a un ordinal `M`, la nouvelle tâche reçoit `M + 1000`.
-   **Insertion entre deux tâches** : Si la tâche précédente a un ordinal `P` et la suivante un ordinal `S`, la nouvelle tâche reçoit la moyenne : `P + (S - P) / 2`.
-   **Liste vide** : La première tâche reçoit par défaut l'ordinal `1000`.

L'incrément par défaut (`DEFAULT_ORDINAL_STEP`) est fixé à **1000**. Cet espacement important permet de nombreuses insertions successives avant de tomber sur des nombres décimaux ou d'atteindre une collision.

## Séquençage et Dépendances

Le concept d'ordinal est intimement lié au mécanisme de **séquençage** (layers) basé sur les dépendances :

-   **Tâches non séquencées** : Une tâche sans dépendances, sans dépendants, et **sans ordinal** est considérée comme "Unsequenced". Elle apparaît souvent dans un bac à part.
-   **Ancrage dans la Séquence 1** : Dès qu'on assigne un `ordinal` à une tâche isolée, elle est considérée comme faisant partie de la "Séquence 1" (le premier niveau d'exécution).
-   **Ordre dans la séquence** : Pour les tâches appartenant à une même couche de dépendances (ex: plusieurs tâches pouvant être faites en parallèle), l'ordinal définit leur ordre d'affichage relatif au sein de cette couche.

## Rebalancement

Le système inclut une logique de résolution de conflits (`resolveOrdinalConflicts`). Si les écarts entre les ordinals deviennent trop petits (inférieurs à `1e-6`), ou si des collisions sont détectées, le système peut recalculer les ordinals pour restaurer un espacement sain (généralement en ré-appliquant le pas de 1000).

## Utilisation via le CLI

Il est possible de définir manuellement un ordinal via le CLI :

```bash
backlog task edit <id> --ordinal 2500
```

*Note : Pour les agents IA, il est recommandé d'utiliser des multiples de 1000 pour laisser de la place aux utilisateurs humains.*

## Analyse I - Vers un fichier d'ordonnancement séparé ?

L'un des défis actuels est que la modification de l'ordre peut entraîner des changements dans plusieurs fichiers de tâches simultanément (lors d'un rebalancement ou d'un re-séquençage), ce qui crée du "bruit" dans l'historique Git. Une solution envisagée serait de centraliser l'ordre dans un fichier unique (ex: `backlog/order.yml`).

### Avantages

1.  **Réduction du bruit Git** : Déplacer une tâche ne modifierait que le fichier central d'ordonnancement. Les fichiers `task.md` resteraient inchangés, préservant ainsi la clarté de leur historique (focalisé sur le contenu).
2.  **Vue d'ensemble** : Un fichier central permettrait de voir l'ordre complet du projet en un seul coup d'œil sans avoir à scanner tous les fichiers.
3.  **Performance** : Le chargement de l'ordre pourrait être plus rapide car il ne nécessiterait pas de parser le frontmatter de chaque fichier.

### Inconvénients et Risques

1.  **Conflits Git centralisés** : Si deux développeurs réordonnent des tâches dans leurs branches respectives, la fusion (merge) provoquera systématiquement un conflit sur le fichier central. Ces conflits peuvent être plus complexes à résoudre manuellement qu'une simple modification d'ordinal dans un fichier isolé.
2.  **Désynchronisation (Orphelins)** : Si une tâche est supprimée ou renommée dans une branche, mais que le fichier central n'est pas mis à jour correctement, on se retrouve avec des références mortes. Le système doit garantir une intégrité parfaite entre les fichiers `.md` présents et le fichier d'ordre.
3.  **Complexité du multi-branche** :
    -   Lorsqu'une tâche est créée dans une branche A, elle est ajoutée au fichier d'ordre de A.
    -   Si une autre tâche est créée dans une branche B, elle est ajoutée au fichier d'ordre de B.
    -   Lors du merge, Git verra deux versions différentes du fichier d'ordre. Contrairement aux fichiers de tâches qui sont distincts, ici le point de collision est garanti.

### Scénarios de gestion des conflits

Dans le système actuel (ordinals dans les fichiers), deux tâches créées sur deux branches différentes peuvent avoir le même ordinal. Le tri secondaire par ID (ex: `back-100` vs `back-101`) résout l'ambiguïté sans conflit Git.

Avec un fichier central, le conflit se manifesterait ainsi :
- **Branche A** : `order: [T1, T2, T-NEW-A]`
- **Branche B** : `order: [T1, T2, T-NEW-B]`
- **Merge** : Conflit sur la ligne après `T2`.

### Conclusion de l'analyse

Le passage à un fichier séparé est techniquement possible et améliorerait la propreté de l'historique des tâches. Cependant, il transfère la complexité vers la gestion des fusions Git. 

Pour mitiger cela, une approche hybride pourrait être envisagée :
- Garder les `ordinals` dans les fichiers pour la robustesse au merge.
- Optimiser les algorithmes de re-séquençage pour qu'ils ne modifient les ordinals que de manière chirurgicale, en évitant de ré-attribuer des valeurs à toute une colonne si ce n'est pas strictement nécessaire (en utilisant davantage l'espacement de 1000).

## Analyse II - Un fichier séparé stockant les valeurs du champ ordinal

L'hypothèse ici est de déplacer la donnée `ordinal` du frontmatter des fichiers `.md` vers un fichier centralisé nommé **`backlog/task-ordinals.yml`**, tout en maintenant la cohérence du système.

### Architecture technique proposée

1.  **Stockage Centralisé** : Un fichier YAML simple associant les IDs de tâches à leur valeur ordinale.
    ```yaml
    # backlog/task-ordinals.yml
    BACK-1: 1000
    BACK-2: 2000
    DRAFT-5: 1500
    ```
2.  **Couche d'Abstraction (FileSystem)** :
    -   Lors du `loadTask`, le `FileSystem` lirait d'abord le fichier Markdown, puis irait "fusionner" la valeur ordinale provenant de `task-ordinals.yml`.
    -   Lors du `saveTask`, l'ordinal ne serait plus écrit dans le frontmatter du fichier `.md`.
    -   Une nouvelle méthode `saveOrdinals(map: Map<string, number>)` permettrait de mettre à jour le fichier central en une seule opération I/O.

3.  **Mécanisme de Migration et Rétro-compatibilité** :
    -   **Lecture hybride** : Si une tâche a un `ordinal` dans son frontmatter ET dans le fichier central, le fichier central prime.
    -   **Migration automatique** : Au premier démarrage, Backlog.md pourrait extraire tous les ordinals existants pour initialiser le fichier central, puis les supprimer des fichiers `.md` (optionnellement).

### Avantages détaillés

-   **Atomicité des changements d'ordre** : Un `git commit` pour un réordonnancement ne contient qu'une seule modification dans un seul fichier.
-   **Découplage Contenu/Ordre** : Le contenu d'une tâche (description, AC, status) est séparé de sa position relative dans une liste. Cela évite de "salir" le `git blame` d'une tâche juste parce qu'elle a été déplacée.

### Gestion des conflits en multi-branche

C'est le point le plus critique. Imaginons deux branches modifiant l'ordre :

**Scénario de conflit Git :**
- `main` a `[T1: 1000, T2: 2000]`
- `feature-A` déplace T2 avant T1 : `[T2: 500, T1: 1000]`
- `feature-B` insère T3 entre T1 et T2 : `[T1: 1000, T3: 1500, T2: 2000]`
- **Merge** : Git signalera un conflit sur **`task-ordinals.yml`**.

**Résolution :**
- Contrairement aux ordinals dispersés où Git pourrait ne pas voir de conflit (si les lignes modifiées sont éloignées), ici le conflit est explicite.
- **Avantage** : On force l'utilisateur à prendre une décision consciente sur l'ordre final.
- **Inconvénient** : Cela demande un effort manuel de résolution de conflit YAML.

### Stratégie de mitigation des conflits

Pour rendre le fichier central plus "Merge Friendly", on pourrait :
1.  **Formatage ligne par ligne** : Trier le fichier YAML par ID de tâche (ordre alphabétique) pour que les insertions de nouvelles tâches ne provoquent pas de conflits avec les modifications d'ordinals de tâches existantes.
2.  **Tri automatique au chargement** : Le système doit être résilient si deux tâches finissent par avoir le même ordinal suite à un merge (fallback sur le tri par ID).

### Conclusion de l'Analyse II

L'externalisation de l'ordre est une excellente solution pour la **propreté des commits**. Le coût principal est le risque accru de **conflits Git sur le fichier d'ordre** lors des merges fréquents. Pour un usage solo ou en petite équipe avec peu de réordonnancements massifs, le bénéfice en termes de clarté de l'historique Git est largement supérieur aux inconvénients.

> **Note d'implémentation** : Ce mécanisme a été implémenté via l'option `centralized_tasks_ordinals`. Lorsqu'elle est activée, les ordinals sont stockés dans `backlog/task-ordinals.yml` et automatiquement retirés des fichiers `.md` lors de la sauvegarde.

## Analyse III - Tri de la colonne "Done" par récence (Recency First)

Actuellement, l'ordre des tâches dans la colonne **Done** (ou toute colonne marquée comme terminée) suit la même logique que les colonnes actives : l'ordinal prime. Cela peut être frustrant car une tâche terminée récemment peut se retrouver noyée en bas de colonne si elle avait un ordinal élevé.

### État actuel de l'implémentation

Dans `src/web/lib/lanes.ts`, la fonction `sortTasksForStatus` utilise déjà une logique spécifique pour les colonnes "Done", mais elle ne s'applique que si aucun `ordinal` n'est défini :
1.  **Ordinal** (Priorité 1)
2.  **Date de mise à jour / création** (Priorité 2, seulement si pas d'ordinal)

### Proposition : Inversion des priorités pour "Done"

Pour que les dernières tâches traitées apparaissent en haut, il est proposé de modifier la logique de tri uniquement pour les colonnes terminées :

1.  **Date de mise à jour** (Priorité 1, descendante) : La tâche modifiée le plus récemment (passée à Done) arrive en haut.
2.  **Ordinal** (Priorité 2) : Utilisé comme tri secondaire.

### Impact sur le "Drag & Drop"

Si on trie par date, le déplacement manuel d'une carte dans la colonne Done devient contre-intuitif car la position est dictée par le temps. Deux options sont possibles :

-   **Option A (Stricte)** : Désactiver le réordonnancement manuel dans la colonne Done. L'ordre est purement chronologique.
-   **Option B (Hybride)** : Lorsqu'on déplace une tâche manuellement dans Done, on met à jour son `updatedDate` pour qu'elle corresponde à la position temporelle souhaitée (peu recommandé car falsifie l'historique réel).
-   **Option C (Sélective)** : Garder le tri par ordinal par défaut, mais ajouter un bouton "Trier par récence" dans l'UI web pour cette colonne spécifique.

### Recommandation technique

La solution la plus simple et la moins perturbante est de modifier `sortTasksForStatus` pour que pour les colonnes `isDoneStatus`, on ignore l'ordinal et on trie par `updatedDate` (descendante). 

```typescript
// src/web/lib/lanes.ts (pseudo-code)
if (isDoneStatus) {
    return b.updatedDate - a.updatedDate; // Les plus récentes en premier
}
```

Cela assure une cohérence avec l'export Markdown (`src/board.ts`) qui utilise déjà un tri préférentiel par date pour les colonnes.

## Analyse - Configuration des options

Pour permettre aux utilisateurs de choisir leur mode de fonctionnement sans imposer de changement de rupture, nous proposons l'introduction de deux nouvelles options dans le fichier de configuration (`config.yml` ou `backlog.config.yml`) :

| Clé | Description | Par défaut |
|-----|-------------|------------|
| **`centralized_tasks_ordinals`** | Si `true`, l'ordre des tâches est stocké dans **`backlog/task-ordinals.yml`** au lieu des fichiers `.md`. | `false` |
| `sort_done_by_recency` | Si `true`, la colonne Done (et assimilées) est triée par date de mise à jour descendante. | `false` (pour préserver l'ordre manuel actuel) |

### Implémentation de la configuration

1.  **Modification du Type `BacklogConfig`** : Ajouter les champs dans `src/types/index.ts`.
2.  **Parsing** : Mettre à jour `FileSystem.parseConfig` et `serializeConfig` dans `src/file-system/operations.ts`.
3.  **Logique Conditionnelle** :
    -   Dans `FileSystem.loadTask` / `saveTask`, vérifier **`config.centralizedTasksOrdinals`**.
    -   Dans `src/web/lib/lanes.ts` (fonction `sortTasksForStatus`), injecter la configuration pour décider du mode de tri.

Cette approche permet une transition douce et offre une flexibilité maximale aux équipes selon leur flux de travail (plus ou moins de merges Git, importance de l'historique visuel des tâches terminées).
