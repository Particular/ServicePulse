import CustomCheck from "@/resources/CustomCheck";
import { SetupFactoryOptions } from "../driver";

//const content = JSON.stringify([]);

export const hasNoFailingCustomChecks = ({ driver }: SetupFactoryOptions) => {
  const serviceControlInstanceUrl = window.defaultConfig.service_control_url;
  driver.mockEndpoint(`${serviceControlInstanceUrl}customchecks`, {
    body: [
      <CustomCheck>{
        id: "CustomChecks/6131fa95-9414-1898-9c83-c5b18587945b",
        custom_check_id: "Audit Message Ingestion",
        category: "ServiceControl.Audit Health",
        status: "Fail",
        failure_reason: "I dont know the reason",
        reported_at: "2025-01-10T05:06:30.4074087Z",
        originating_endpoint: {
          name: "Particular.ServiceControl.Audit",
          host_id: "ff605b55-6fbb-af56-5753-73c1ff73e601",
          host: "JAYANTHI-LAPTOP",
        },
      },
    ],
    headers: {
      "Total-Count": "1",
    },
  });

  //return content;
};
// [
//   {
//       "id": "CustomChecks/6131fa95-9414-1898-9c83-c5b18587945b",
//       "custom_check_id": "Audit Message Ingestion",
//       "category": "ServiceControl.Audit Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:06:30.4074087Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl.Audit",
//           "host_id": "ff605b55-6fbb-af56-5753-73c1ff73e601",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/36752f09-8a72-752e-e48f-6c378329d43b",
//       "custom_check_id": "Error Message Ingestion",
//       "category": "ServiceControl Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:42:00.531067Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/02564a68-8c3e-92f6-d977-ce45d7ce46ed",
//       "custom_check_id": "ServiceControl.Audit database",
//       "category": "Storage space",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:51:44.4635095Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl.Audit",
//           "host_id": "ff605b55-6fbb-af56-5753-73c1ff73e601",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/5443ee67-c22a-521f-5dc1-b979f831151a",
//       "custom_check_id": "Audit Database Index Lag",
//       "category": "ServiceControl.Audit Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:51:47.7264687Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl.Audit",
//           "host_id": "ff605b55-6fbb-af56-5753-73c1ff73e601",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/93b62dc3-e1bf-abfd-4268-8d36fef2b0c6",
//       "custom_check_id": "ServiceControl database",
//       "category": "Storage space",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:03.8512021Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/7e09172e-7c59-9a0c-52da-e2ecc1784e15",
//       "custom_check_id": "Saga Audit Configuration",
//       "category": "Configuration",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:03.850927Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/7940dbbf-3019-cb8a-3add-b9ff9c57edb7",
//       "custom_check_id": "Error Database Index Errors",
//       "category": "ServiceControl Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:03.8522051Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/4dc66bce-632b-5404-bc3d-e1943d99c301",
//       "custom_check_id": "Error Database Index Lag",
//       "category": "ServiceControl Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:05.8153025Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/3eab20ba-3c24-b354-d298-aae5412c0125",
//       "custom_check_id": "ServiceControl Remotes",
//       "category": "Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:10.1360722Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/c7011287-308f-c7b7-f50a-cca3c3fe17da",
//       "custom_check_id": "ServiceControl Primary Instance",
//       "category": "Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:18.4970695Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/66675ab0-b69a-6a5a-6a56-da7709464fba",
//       "custom_check_id": "Message Ingestion Process",
//       "category": "ServiceControl Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:29.398929Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/418dafe7-1dd2-886b-65d1-2b3e71e4feb2",
//       "custom_check_id": "Error Message Ingestion Process",
//       "category": "ServiceControl Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:29.3984912Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl",
//           "host_id": "9f822d11-b097-a4df-3db5-e069e5d356fe",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   },
//   {
//       "id": "CustomChecks/a406f1a7-412c-dd2c-7f90-9aa32da0698b",
//       "custom_check_id": "Audit Message Ingestion Process",
//       "category": "ServiceControl Health",
//       "status": "pass",
//       "reported_at": "2025-01-10T05:52:31.4929675Z",
//       "originating_endpoint": {
//           "name": "Particular.ServiceControl.Audit",
//           "host_id": "ff605b55-6fbb-af56-5753-73c1ff73e601",
//           "host": "JAYANTHI-LAPTOP"
//       }
//   }
// ]
