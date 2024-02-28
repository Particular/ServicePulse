type GoToOptions = {
  device?: "desktop" | "mobile";
};

type GoTo = (path: string, options?: GoToOptions) => Promise<void>;

export type MockEndpointOptions = {
  body: string | unknown[] | Record<string | number, unknown>;
  method?: "get" | "post" | "patch" | "put" | "delete";
  status?: number;
  headers?: { [key: string]: string };
};

type MockEndpoint = (path: string, options: MockEndpointOptions) => void;

export type SetupFactoryOptions = {  
  driver: Driver;
};

type SetupFactory = ({ driver }: SetupFactoryOptions) => any;

type SetUp = <Factory extends SetupFactory>(factory: Factory) => Promise<ReturnType<Factory>>;

import {getQueriesForElement} from '@testing-library/dom'

export type Driver = {    
  goTo: GoTo;
  mockEndpoint: MockEndpoint;
  setUp: SetUp;
}
