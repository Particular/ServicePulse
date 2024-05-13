type GoTo = (path: string) => Promise<void>;

export type MockEndpointOptions = {
  body: any;
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

export type Driver = {
  goTo: GoTo;
  mockEndpoint: MockEndpoint;
  setUp: SetUp;
};
