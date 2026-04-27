# Backlog.md - Private Development Environment

This project uses a [Lima](https://github.com/lima-vm/lima) VM to provide a secure, isolated development environment. This protects your host machine from potential supply chain vulnerabilities by ensuring that all code execution occurs within the Linux VM.

We have added the features described in 

## Prerequisites

- macOS (the config is optimized for `Virtualization.framework`)
- [Lima](https://github.com/lima-vm/lima) installed:
  ```bash
  brew install lima
  ```

## Getting Started

### 1. Create and Start the VM

Run the following command from the project root:

```bash
limactl start -y prt-dev-backlogmd-limavm.yaml
```

*When prompted, choose "Proceed with the current configuration".*

### 2. Enter the VM

Once the VM is running, you can enter it using:

```bash
lima
```

This will drop you into a bash shell inside the VM, automatically placed in the `/home/teevity/Backlog.md` directory.

### 3. Initialize the Project

Inside the VM, run:

```bash
bun install
```

## Development Workflow

### Running the CLI (Alternative: Native Binary)

If you encounter path resolution issues with `bun run cli` (like the UI showing the wrong project), use the compiled native binary. This is the most reliable method for development on macOS:

```bash
# 1. Build the binary
bun run build:css
bun build --compile --minify --define __EMBEDDED_VERSION__="\"1.14.4-prt\"" --outfile dist/backlog-native src/cli.ts

# 2. Use it directly or via alias
./dist/backlog-native browser -p 7521
```

### Running the Web UI

To start the Kanban board and web interface:

```bash
bun run cli browser
```

The UI will be accessible on your **host machine** at [http://localhost:6420](http://localhost:6420) thanks to automatic port forwarding.

### Running Tests

```bash
bun test
```

## Managing the VM

- **Exit the VM:** Type `exit` or press `Ctrl+D`.
- **Stop the VM:** `limactl stop prt-dev-backlogmd-limavm`
- **Delete the VM:** `limactl delete prt-dev-backlogmd-limavm` (This will NOT delete your code, as the project directory is mounted from your host).

## Security Notes

- **Isolation:** The code executes inside a Linux VM. Even if a dependency has a malicious `postinstall` script, it only has access to the VM environment.
- **Mounts:** The current project directory is mounted into the VM as `writable: true`. This allows you to use your favorite IDE (VS Code, Cursor, etc.) on your host machine while running the code inside the VM.
- **Port Forwarding:** Only port `6420` is explicitly forwarded to the host.


## Token usage tracking

### Session 1 (2026/04/24 Morning)

```
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                               │
│  Agent powering down. Goodbye!                                                                                                │
│                                                                                                                               │
│  Interaction Summary                                                                                                          │
│  Session ID:                 fcc1afe6-1404-4be5-9911-7b0077fa9571                                                             │
│  Tool Calls:                 222 ( ✓ 215 x 7 )                                                                                │
│  Success Rate:               96.8%                                                                                            │
│  User Agreement:             100.0% (222 reviewed)                                                                            │
│  Code Changes:               +1178 -184                                                                                       │
│                                                                                                                               │
│  Performance                                                                                                                  │
│  Wall Time:                  15h 12m 31s                                                                                      │
│  Agent Active:               21m 20s                                                                                          │
│    » API Time:               21m 3s (98.6%)                                                                                   │
│    » Tool Time:              17.7s (1.4%)                                                                                     │
│                                                                                                                               │
│                                                                                                                               │
│  Model Usage                                                                                                                  │
│  Use /model to view model quota information                                                                                   │
│                                                                                                                               │
│  Model                           Reqs  Input Tokens   Cache Reads Output Tokens                                               │
│  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  gemini-3-flash-preview           271    37,254,548    32,920,643        74,312                                               │
│    ↳ main                         267    37,206,570    32,920,643        73,831                                               │
│    ↳ utility_loop_detector          4        47,978             0           481                                               │
│  To resume this session: gemini --resume fcc1afe6-1404-4be5-9911-7b0077fa9571                                                 │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

**Points clés de cette session**

Le coût total : Environ 4,04 $ (soit environ 3,72 € HT).

L'effet de levier du Cache : C'est ici que c'est le plus impressionnant. Si tu n'avais pas de cache :

Le coût de l'input seul serait passé de 3,81 \$ (input + cache) à 18,63 $.

Le cache te fait donc économiser environ 14,80 $ sur cette seule session.

Intensité : Avec 271 requêtes et 74k tokens en sortie, c'est une session de travail extrêmement dense. L'utilisation du modèle de détection de boucles (utility_loop_detector) montre que le CLI surveille les automates pour éviter que l'agent ne s'emballe et ne vide ton portefeuille inutilement.



### Session 2 (2026/04/24 beginning of afternoon)

```
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                               │
│  Agent powering down. Goodbye!                                                                                                │
│                                                                                                                               │
│  Interaction Summary                                                                                                          │
│  Session ID:                 c66cc382-e637-4272-84bb-5eccee5124fa                                                             │
│  Tool Calls:                 56 ( ✓ 55 x 1 )                                                                                  │
│  Success Rate:               98.2%                                                                                            │
│  User Agreement:             100.0% (56 reviewed)                                                                             │
│  Code Changes:               +75 -35                                                                                          │
│                                                                                                                               │
│  Performance                                                                                                                  │
│  Wall Time:                  1h 24m 2s                                                                                        │
│  Agent Active:               7m 49s                                                                                           │
│    » API Time:               7m 48s (99.6%)                                                                                   │
│    » Tool Time:              1.7s (0.4%)                                                                                      │
│                                                                                                                               │
│                                                                                                                               │
│  Model Usage                                                                                                                  │
│  Use /model to view model quota information                                                                                   │
│                                                                                                                               │
│  Model                           Reqs  Input Tokens   Cache Reads Output Tokens                                               │
│  ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── │
│  gemini-2.5-flash-lite              1         2,921             0            13                                               │
│    ↳ utility_summarizer             1         2,921             0            13                                               │
│  gemini-3.1-pro-preview-cust…      15       429,687       337,705         1,784                                               │
│    ↳ main                          15       429,687       337,705         1,784                                               │
│  gemini-3-flash-preview            51     2,416,625     1,987,585        10,126                                               │
│    ↳ main                          49     2,371,583     1,987,585         9,734                                               │
│    ↳ subagent                       2        45,042             0           392                                               │
│  To resume this session: gemini --resume c66cc382-e637-4272-84bb-5eccee5124fa                                                 │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

```csv
Modèle                 , Coût New Input, Coût Cache Reads, Coût Output, Total Modèle
2.5 Flash-Lite         ,         ~$0,00,           $0,000,      ~$0,00,       $0,001
3.1 Pro (Large context),         $0,368,           $0,135,      $0,032,       $0,535
3 Flash                ,         $0,215,           $0,099,      $0,030,       $0,344
TOTAL SESSION          ,               ,                 ,            ,       $0,880
```

**Ce qu'il faut retenir**
Coût total : ~0,88 $ (soit environ 0,81 € HT).

L'intelligence coûte plus cher que le volume : Même si tu as balancé 5 fois plus de tokens sur le modèle Flash, c'est le modèle Pro qui pèse le plus lourd sur la facture ($0,53 vs $0,34). C'est normal : le prix du Pro est environ 8 fois supérieur au Flash.

Le danger des 200k : Ta session Pro est facturée au tarif "Large Context" ($4,00 l'input au lieu de $2,00). Si tu arrives à fragmenter tes requêtes Pro pour rester sous les 200k tokens de contexte, tu divises cette partie de la facture par deux.

C'est une architecture "multi-agents" assez propre : tu utilises le petit modèle pour résumer, le gros pour réfléchir et le moyen pour exécuter. C'est la meilleure stratégie pour garder une facture sous les 1 $.



### Session 3 (2026/04/26 mid of afternoon)

```
╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                                                                                        │
│  Agent powering down. Goodbye!                                                                                                                                                         │
│                                                                                                                                                                                        │
│  Interaction Summary                                                                                                                                                                   │
│  Session ID:                 7b8a181d-c97e-4038-a63b-0852fec57923                                                                                                                      │
│  Tool Calls:                 38 ( ✓ 38 x 0 )                                                                                                                                           │
│  Success Rate:               100.0%                                                                                                                                                    │
│  User Agreement:             100.0% (38 reviewed)                                                                                                                                      │
│  Code Changes:               +34 -2                                                                                                                                                    │
│                                                                                                                                                                                        │
│  Performance                                                                                                                                                                           │
│  Wall Time:                  12m 40s                                                                                                                                                   │
│  Agent Active:               2m 5s                                                                                                                                                     │
│    » API Time:               1m 54s (91.0%)                                                                                                                                            │
│    » Tool Time:              11.3s (9.0%)                                                                                                                                              │
│                                                                                                                                                                                        │
│                                                                                                                                                                                        │
│  Model Usage                                                                                                                                                                           │
│  Use /model to view model quota information                                                                                                                                            │
│                                                                                                                                                                                        │
│  Model                           Reqs  Input Tokens   Cache Reads Output Tokens                                                                                                        │
│  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  gemini-3-flash-preview            40     1,938,766     1,706,615         6,252                                                                                                        │
│    ↳ main                          39     1,930,879     1,706,615         6,138                                                                                                        │
│    ↳ utility_loop_detector          1         7,887             0           114                                                                                                        │
│  To resume this session: gemini --resume 7b8a181d-c97e-4038-a63b-0852fec57923                                                                                                          │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```





## Features added to the PRT custom fork

### BACK-414 - Implement sorting "Done" column by newest first

### BACK-415 - Implement centralized task ordinal storage

### BACK-416 - Create a child task from a parent one in the UI
