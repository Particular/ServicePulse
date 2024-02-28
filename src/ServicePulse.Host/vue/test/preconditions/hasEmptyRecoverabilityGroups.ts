import {SetupFactoryOptions} from '../driver'

export const hasRecoverabilityGroups = ({ driver }: SetupFactoryOptions) => {
  driver.mockEndpoint(`http://localhost:33333/api/recoverability/groups/Endpoint%20Name`, {
    body: JSON.stringify([])
  });
  return JSON.stringify([]);
};
