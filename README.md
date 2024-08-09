# ServicePulse ![Current Version](https://img.shields.io/github/release/particular/servicepulse.svg?style=flat&label=current%20version)

ServicePulse provides real-time production monitoring for distributed applications. It monitors the health of a system's endpoints, detects processing errors, sends failed messages for reprocessing, and ensures the specific environment's needs are met, all in one consolidated dashboard.

ServicePulse is part of the [Particular Service Platform](https://particular.net/service-platform), which includes [NServiceBus](https://particular.net/nservicebus) and tools to build, monitor, and debug distributed systems.

See the [ServicePulse documentation](https://docs.particular.net/servicepulse/) for more information.

## Setting up the project for development

### Setting up ServiceControl Main and ServiceControl Monitoring instances

ServicePulse mainly presents data provided by [ServiceControl](https://docs.particular.net/servicecontrol) and [ServiceControl Monitoring](https://docs.particular.net/servicecontrol/monitoring-instances/) instances.

The URLs for both services can be set in `src/Frontend/public/js/app.constants.js`.

### Setting up package managers

ServicePulse uses [npm](https://www.npmjs.com/) and [Bower](https://bower.io/) as package managers. For the solution to work, dependencies must be downloaded before launching the ServicePulse website.

#### Install dependencies

Install the following dependencies if you don't have them installed yet.

- [Git for Windows](https://gitforwindows.org/)
- [Node.js](https://nodejs.org/en/download/)
  - **NOTE:** It is good practice when installing or updating node.js on your local environment also to check and make sure that the node.js version for the `ci.yml` and `release.yml` workflows match the version of your local environment. Look for the step `name: Set up Node.js`

### Set development environment

#### Step 0 - Using a suitable IDE for frontend development

Even though Visual Studio or Rider seem to be adequate IDEs for front-end development, they tend to be unreliable with the latest front-end frameworks, linting, and formatting.
Because of that, we have [extra recommendations](/docs/frontend/frontend-ide.md) to help you succeed even more at front-end development.

#### Step 1 - run the Vue.js development server

Navigate to `ServicePulse\src\Frontend` and:

- run `npm install` to install all the npm dependencies
- run the following command `npm run dev` (this will host a dev server on port 5173 and start watching for changes in `/Frontend` directory)

If `npm run dev` fails with an error related to git submodules not being correctly configured, run the `npm install` command again to ensure all required dependencies are available, and then run `npm run dev`.

#### Step 2 - open the browser

After doing the above steps, navigate to the URL presented by the execution of the Vue.js application to see the ServicePulse application.

### Running automated tests

The frontend automated tests utilize Vitest as the testing framework and testing-library for testing utilities. Vitest provide two modes: `watch mode` in the development environment and `run mode` in the CI environment by default. `Watch mode` instantly re-runs relevant tests upon file save, providing immediate feedback during development.

Before running test, ensure you've set up the development server. Navigate to `ServicePulse\src\Frontend` and run `npm install` to install all the npm dependencies.

#### Running component tests

Navigate to `ServicePulse\src\Frontend` and run:

```console
npm run test:component
```

This command runs all the component test files `*.spcs.ts` in the directory `ServicePulse\src\Frontend\src` and its subdirectories. With `watch mode` enabled it allows for efficient test development, as only the relevant tests are re-run on file save.

#### Running application tests

Navigate to `ServicePulse\src\Frontend` and run:

```console
npm run test:application
```

Similar to component tests, this command runs all the application test files `*.spcs.ts` in the directory `ServicePulse\src\Frontend\test` and its subdirectories.

#### Running test coverage

Navigate to `ServicePulse\src\Frontend` and run:

```console
npm run test:coverage
```

This command generates a report indicating the percentage of statements, branches, function, and lines covered by tests. Additionally, it identifies uncovered line numbers.

### Provided npm scripts

#### Vue.js

- `dev` - runs `vite` that starts the development server doing hot reload over source files
- `build` - runs build script that outputs files to `..\app` folder
- `lint` - checks with eslint all vue, ts, and js files
- `type-check` - runs TypeScript in no emit mode

#### Vitest

- `test:application` - runs all the application tests located in the `Frontend/test` folder.
- `test:component` - runs tests all the component tests located in the `Frontend/src` folder and any subdirectories.
- `test:coverage` - runs the test coverage report on the files defined in `vitest.config.ts`

## Running from ServicePulse.Host.exe

It is possible to run ServicePulse directly via `ServicePulse.Host.exe`.

### Step 1 - reserve URL ACL

ServicePulse.Host.exe depends on a self-hosted web server. A URL ACL reservation must be set up before the project can run. Either run Visual Studio with Administrative privileges or run the following command to add the required URL ACL reservation:

```cmd
add urlacl url=URL
```

Where `URL` is the configured URL on the local machine.

### Step 2 - build ServicePulse site

Execute the build script from the command line:

```cmd
PowerShell -File .\build.ps1
```

> [!NOTE]
> It might be necessary to change the PowerShell execution policy using `Set-ExecutionPolicy Unrestricted -scope UserPolicy`

### Step 3 - run `ServicePulse.Host.exe`

Build and run the `ServicePulse.Host` project in the IDE.

## Supported browser versions

ServicePulse is supported on the following desktop browser versions:

- Chrome [latest major version](https://chromereleases.googleblog.com/)
- Edge with EdgeHTML v17+
- Firefox ESR [current version](https://www.mozilla.org/en-US/firefox/enterprise/)
- Safari [latest major version](https://developer.apple.com/safari/)

## Container image development

A Dockerfile for ServicePulse resides within the [`src/ServicePulse`](https://github.com/Particular/ServicePulse/tree/master/src/ServicePulse) folder. The container images are all built as part of the [release workflow](https://github.com/Particular/ServicePulse/blob/master/.github/workflows/release.yml) and staged in the [Github Container Registry](https://github.com/Particular/ServicePulse/pkgs/container/servicepulse). For branches with PRs, the image will be tagged with the PR number, e.g. `pr-1234`.
