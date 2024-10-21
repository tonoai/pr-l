# portal-libs

This repository contains the libraries used by the portal, designed to share common functionality across different modules.

## Libraries Overview
The libraries in this repository follow a workspace structure, allowing code sharing and modular development.

- **Workspace Structure**: The libraries use a workspace concept to facilitate shared code between modules.
- **Modular Design**: Each library is a standalone module located in the `modules` folder and is published as a separate npm package.

## Library Configuration
Each library contains the following key configuration files:

1. **package.json**
   - `name`: Uses the format `@pressingly-libs/library-name`.
   - `version`: Initial version set to `0.0.1`.
   - `description`: A short description outlining the library's purpose.
   - `dependencies`: includes both root dependencies and any specific dependencies required by the library.
   - `scripts`: Custom scripts may be added as needed.
2. **tsconfig.lib.json**
   - `extends`: Points to the root tsconfig.json file. `../../tsconfig.json.`
3. **nest-cli.json**: [Optional]
  - Configuration file for the NestJS CLI.
4. ...

## Managing Libraries
The libraries are managed by both the `pnpm` package manager and the `nest` CLI.

1. **Nest CLI**: The `nest-cli.json` file configures the libraries, allowing you to manage them via the NestJS CLI. This configuration can be generated automatically with nest new or created manually as needed.
2. **pnpm**: The workspace structure is also managed by pnpm, with the configuration defined in `pnpm-workspace.yaml`. This setup enables efficient dependency management and seamless library linking.

## Getting Started
To begin using the libraries in this repository:

1. **Install Dependencies**:

Run at the root of the repository to install all dependencies across libraries.
```bash
pnpm install
```

2. **Create a New Library**
   - Use the NestJS CLI command:  to generate a new library.
     - ```bash
       nest g lib <library-name>
       ```
     - It will generate a new library in the `libs` folder.
     - **We should**
       - Move the library to the `modules` folder.
       - Then Update the nest-cli.json file to reflect the new library path.
       - Finally remove `path` configuration from `tsconfig.json` to avoid conflicts with package name of each library.
   - Or use `pnpm` to create a new library manually.
     - ```bash
       `pnpm init -w modules/<library-name>`
       ```

3. **Build All Libraries** `pnpm build` or `nest build`
4. **Build a Specific Library** `nest build <library-name>` or go to the library folder and run `pnpm build` (must config build script in package.json)

By following this structure, you can easily create, manage, and share libraries across your portal projects.

