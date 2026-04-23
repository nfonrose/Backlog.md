# Centralisation de l'ordonnancement des tâches

Ce document décrit le fonctionnement technique, les bénéfices et les comportements de transition de la fonctionnalité de centralisation des ordinals (`centralized_tasks_ordinals`).

## Vue d'ensemble de la fonctionnalité

L'objectif principal est de réduire le "bruit" dans l'historique Git lors de la manipulation des tâches sur le tableau Kanban. Par défaut, déplacer une tâche peut provoquer la mise à jour des champs `ordinal` et `updated_date` de plusieurs fichiers `.md` simultanément (à cause du rebalancement de la colonne).

Avec la centralisation activée :
1. Les valeurs `ordinal` sont stockées dans un fichier YAML unique : `backlog/task-ordinals.yml`.
2. Les fichiers `.md` des tâches ne contiennent plus de champ `ordinal` dans leur frontmatter.
3. Lors d'un réordonnancement, si seul l'ordinal change (sans changement de statut ou de milestone), les fichiers `.md` ne sont pas modifiés (pas de mise à jour de `updated_date`).

## Comportement lors du passage à `true` (Activation)

Lorsqu'un projet existant active `centralized_tasks_ordinals : true` :
- **Migration automatique** : Au premier chargement de la configuration, Backlog.md scanne tous les fichiers `.md` existants. S'ils contiennent un `ordinal`, celui-ci est extrait et copié dans `backlog/task-ordinals.yml`.
- **Nettoyage paresseux (Lazy Cleanup)** : Les fichiers `.md` ne sont pas nettoyés massivement. C'est lors de la prochaine sauvegarde individuelle d'une tâche (édition ou déplacement) que le champ `ordinal` est supprimé du frontmatter Markdown.
- **Priorité** : Si un ordinal est présent à la fois dans le fichier YAML et dans le frontmatter `.md`, la valeur du fichier central prime.

## Comportement lors du passage à `false` (Désactivation)

Si un utilisateur décide de désactiver la centralisation (`centralized_tasks_ordinals : false`) :

1. **Retour au frontmatter** : Les nouvelles positions (ordinals) calculées suite à des déplacements seront à nouveau écrites directement dans les fichiers `.md`.
2. **Persistance de l'ordre existant** :
    - Le système ne supprimera pas automatiquement le fichier `backlog/task-ordinals.yml`.
    - Cependant, comme l'option est à `false`, le `FileSystem` n'ira plus lire ce fichier pour fusionner les données lors du chargement des tâches.
    - **Attention** : Si une tâche a perdu son `ordinal` dans son fichier `.md` (parce qu'elle a été sauvegardée pendant que la centralisation était active), elle perdra sa position relative et reviendra au tri par défaut (ID ou priorité) jusqu'à ce qu'un nouvel ordinal lui soit assigné manuellement.
3. **Recommandation pour la réversion** : Avant de passer l'option à `false`, il est conseillé d'effectuer un réordonnancement manuel des tâches importantes pour forcer la réécriture des ordinals dans les fichiers `.md`.

## Détails techniques et Intégrité

- **Tri YAML** : Le fichier `task-ordinals.yml` est maintenu trié par ID de tâche (ordre alphabétique) pour minimiser les conflits Git lors des merges.
- **Idempotence** : Le système vérifie si le contenu Markdown résultant d'une sauvegarde est identique à l'existant avant d'écrire sur le disque. Cela garantit la préservation du `mtime` (date de modification système) du fichier.
- **Dépendances** : L'ordinal reste le critère de tri n°1 pour les couches de séquences (layers), assurant la cohérence entre la vue Kanban et les calculs de dépendances.
