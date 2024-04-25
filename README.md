# ServicePulse ![Current Version](https://img.shields.io/github/release/particular/servicepulse.svg?style=flat&label=current%20version)

ServicePulse provides real-time production monitoring for distributed applications. It keeps track of the health of a system's endpoints, monitors for processing errors, sends failed messages for reprocessing, and ensures the specific environment's needs are met, all in one consolidated dashboard.

ServicePulse is part of the [Particular Service Platform](https://particular.net/service-platform), which includes [NServiceBus](https://particular.net/nservicebus) and tools to build, monitor, and debug distributed systems.

See the [ServicePulse documentation](https://docs.particular.net/servicepulse/) for more information.

## Setting up the project for development

### Setting up ServiceControl Main and ServiceControl Monitoring instances

ServicePulse mainly presents data provided by [ServiceControl](https://docs.particular.net/servicecontrol) and [ServiceControl Monitoring](https://docs.particular.net/servicecontrol/monitoring-instances/) instances.

The URLs for both services can be set in `ServicePulse.Host/vue/public/app/js/app.constants.js` under the `scConfig` constant.

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
Because of that, we have [extra recommendations](/docs/frontend/frontend-ide.md) to help you be even more successful at front-end development.
 
#### Step 1 - run the Vue.js development server 

Navigate to `ServicePulse\src\ServicePulse.Host\vue` and:

- run `npm install` to install all the npm dependencies
- run the following command `npm run dev` (this will host a dev server on port 5173 and start watching for changes in `/vue` directory)

If `npm run dev` fails with an error related to git submodules not being correctly configured, run the `npm install` command again to ensure all required dependencies are available, and then run `npm run dev`.

#### Step 2 - open the browser

After doing the above steps, navigate to the URL presented by the execution of the Vue.js application to see the ServicePulse application.

### Provided npm scripts

#### Vue.js

- `dev` - runs `vite` that starts the development server doing hot reload over source files
- `build` - runs build script that outputs files to `..\app` folder
- `lint` - checks with eslint all vue, ts, and js files
- `type-check` - runs TypeScript in no emit mode

> [!NOTE]
> Webpack observes files and updates the artifacts whenever they are changed; however, at the moment, not every bit of code is processed by Webpack. Only monitoring and configuration-related files are.

### Configuring automated tests

For information on running automated tests, please follow [ServicePulse.Host.Tests/Readme](https://github.com/Particular/ServicePulse/blob/master/src/ServicePulse.Host.Tests/README.md).

## Running from ServicePulse.Host.exe

It is possible to run ServicePulse directly via `ServicePulse.Host.exe`.

### Step 1 - reserve URL ACL

ServicePulse.Host.exe depends on a self-hosted web server. A URL ACL reservation needs to be set up before the project can run. Either run Visual Studio with Administrative privileges or run the following command to add the required URL ACL reservation:

```
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

## Docker image deployment

Dockerfiles for ServicePulse resides within the [`src`](https://github.com/Particular/ServicePulse/tree/master/src) folder. There are 2 docker files:

- 1 for a [Windows image](https://github.com/Particular/ServicePulse/blob/master/src/dockerfile.iis)
- 1 for a [Linux image](https://github.com/Particular/ServicePulse/blob/master/src/dockerfile.nginx)

### Building & staging docker images

The docker files are all built as part of the [release workflow](https://github.com/Particular/ServicePulse/blob/master/.github/workflows/release.yml), pushed to the Docker hub, and tagged with the version of ServicePulse being deployed. More details are available in the [documentation](https://docs.particular.net/servicepulse/containerization/).

For example, If we were deploying version 1.30.1 of ServicePulse, the build configurations after the Deploy step will build the following 2 containers for ServicePulse and tag them `1.30.1`:

- `particular/servicepulse:1.30.1`
- `particular/servicepule-windows:1.30.1`

These images are tagged with the specific version of ServicePulse being built and pushed to the corresponding public `particular/servicepulse{-os}` repositories. At this point, the docker images are considered staged. If someone is watching the feed directly, they can install the staged images by explicitly specifying the exact tag, e.g., `docker pull particular/servicepulse:1.30.1`.

### Promoting docker images to production

When a ServicePulse release is promoted to production, one of the steps is to take the staged images and re-tag them as the following:

- `particular/servicepulse:1.30.1` => `particular/servicepulse:1`
  - This is so that customers interested in updates within a major can install the specific major only and not worry about breaking changes between major versions being automatically rolled out. Useful for auto-upgrading containers in a _production_ environment.
- `particular/servicepulse:1.30.1` => `particular/servicepulse:latest`
  - Primarily for developers wanting to use the latest version (`docker-compose up -d --build --force-recreate --renew-anon-volumes`
  - This is only true if the release's major version is the same as the current latest major version.
    - If a fix is being backported to a previous major, then the `:latest` tag will not be updated.
    - If a release targets the current latest major or is a new major after the previous latest, then the `:latest` tag is updated to match the version being released.

Once the tagging has been completed, the images are considered to be publicly released.
