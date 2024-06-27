# ServicePulse

This document describes basic usage and information related to the ServicePulse image. The complete documentation of ServicePulse the application can be found on the [Particular Software documentation site](https://docs.particular.net/servicepulse/).

## Usage

The following is the most basic way to create a ServicePulse container using [Docker](https://www.docker.com/):

```shell
docker run -p 9090:90 particular/servicepulse:latest
```

### Environment Variables

- **`SERVICECONTROL_URL`**: _Default_: `http://localhost:33333/api/`. The url to your ServiceControl instance
- **`MONITORING_URLS`**: _Default_: `['http://localhost:33633/']`. A JSON array of URLs to your monitoring instances

It may be desireable to run the ServiceControl services in an isolated network. When doing so ServicePulse must be configured to connect to those services using environment variables:

```shell
docker run -p 9090:90 -e SERVICECONTROL_URL="http://servicecontrol:33333/api/" -e MONITORING_URLS="['http://servicecontrol-monitoring:33633']" particular/servicepulse:latest
```

Or as part of a https://docs.docker.com/compose/compose-file/05-services/:

```yaml
services:
    servicepulse:
        ports:
            - 9090:90
        environment:
            - SERVICECONTROL_URL=http://servicecontrol:33333/api/
            - MONITORING_URLS=['http://servicecontrol-monitoring:33633']
        image: particular/servicepulse:latest
```

### Image tagging

#### `latest` tag

This tag is primarily for developers wanting to use the latest version, e.g. `docker-compose up -d --build --force-recreate --renew-anon-volumes`.

If a release targets the current latest major or is a new major after the previous latest, then the `:latest` tag applied to the image pushed to [Docker Hub](https://hub.docker.com/r/particular/servicepulse).

If the release is a patch release to a previous major, then the `:latest` tag will not be added to the image pushed to Docker Hub.

The `:latest` tag is never added to images pushed to [the GitHub Container Registry](https://github.com/Particular/ServicePulse/pkgs/container/servicepulse).

#### Version tags

We use [SemVer](http://semver.org/) for versioning. Release images pushed to [Docker Hub](https://hub.docker.com/r/particular/servicepulse) will be tagged with the release version. Staged images pushed to [the GitHub Container Registry](https://github.com/Particular/ServicePulse/pkgs/container/servicepulse) will not have a version tag.

#### Pull request tag

Pre-release image versions generated from [GitHub pull requests](https://github.com/Particular/ServicePulse/pulls) will only be available in the GitHub Container Registry and are tagged using the pull request number using the following convention: `pr-1234`. The pull request tag is only added to images pushed to [the GitHub Container Registry](https://github.com/Particular/ServicePulse/pkgs/container/servicepulse) and are not added to images pushed to [Docker Hub](https://hub.docker.com/r/particular/servicepulse).

#### Major version tag

The latest release within a major version will be tagged with the major version number only on images pushed to [Docker Hub](https://hub.docker.com/r/particular/servicepulse). This allows users to target a specific major version to help avoid the risk of incurring breaking changes between major versions. Useful for auto-upgrading containers in a _production_, for instance:

If `particular/servicepulse:1.30.1` is the latest release in the version 1 major release, the image will also be tagged `particular/servicepulse:1`.

The major version tag is never added to images pushed to [the GitHub Container Registry](https://github.com/Particular/ServicePulse/pkgs/container/servicepulse).

#### Minor version tag

The latest release within a minor version will be tagged with `{major}.{minor}` on images pushed to Docker Hub. This allows users to target the latest patch within a specific minor version.

## Built With

This image is built from the stable Alpine version of the [nginx official Docker image](https://hub.docker.com/_/nginx/).

## Contributing

Please read [our documentation](https://docs.particular.net/platform/contributing) for details on how to contribute to Particular Software projects.

## Authors

This software, including this container image, is built and maintained by the team at [Particular Software](https://particular.net). See also the list of [contributors](https://github.com/Particular/ServicePulse/graphs/contributors) who participated in this project.

## License

This project is licensed under the Reciprocal Public License 1.5 (RPL1.5) and commercial licenses are available - see the [LICENSE.md](https://github.com/Particular/ServicePulse/blob/master/LICENSE.md) file for details.