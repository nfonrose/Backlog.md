# Backlog.md - Private Development Environment

This project uses a [Lima](https://github.com/lima-vm/lima) VM to provide a secure, isolated development environment. This protects your host machine from potential supply chain vulnerabilities by ensuring that all code execution occurs within the Linux VM.

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

### Running the CLI

You can run the development version of the CLI using:

```bash
bun run cli
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
