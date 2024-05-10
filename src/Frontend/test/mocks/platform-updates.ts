import type Release from "@/resources/Release";

interface Assets {
  name: string;
  size: number;
  download: string;
}

export interface platformUpdates extends Release {
  assets: Assets[];
}

export const serviceControlNoPlatformUpdatesNeeded: platformUpdates[] = [
  {
    tag: "5.0.4",
    release: "https://github.com/Particular/ServiceControl/releases/tag/5.0.4",
    published: "2024-01-23T09:56:56Z",
    assets: [
      {
        name: "Particular.ServiceControl-5.0.4.exe",
        size: 210944576,
        download: "https://github.com/Particular/ServiceControl/releases/download/5.0.4/Particular.ServiceControl-5.0.4.exe",
      },
    ],
  },
  {
    tag: "4.33.2",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.33.2",
    published: "2024-01-23T15:47:12Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.33.2.exe",
        size: 218503936,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.33.2/Particular.ServiceControl-4.33.2.exe",
      },
    ],
  },
  {
    tag: "5.0.3",
    release: "https://github.com/Particular/ServiceControl/releases/tag/5.0.3",
    published: "2023-12-19T23:44:11Z",
    assets: [
      {
        name: "Particular.ServiceControl-5.0.3.exe",
        size: 210914368,
        download: "https://github.com/Particular/ServiceControl/releases/download/5.0.3/Particular.ServiceControl-5.0.3.exe",
      },
    ],
  },
  {
    tag: "5.0.2",
    release: "https://github.com/Particular/ServiceControl/releases/tag/5.0.2",
    published: "2023-12-19T13:31:02Z",
    assets: [
      {
        name: "Particular.ServiceControl-5.0.2.exe",
        size: 210914368,
        download: "https://github.com/Particular/ServiceControl/releases/download/5.0.2/Particular.ServiceControl-5.0.2.exe",
      },
    ],
  },
  {
    tag: "5.0.1",
    release: "https://github.com/Particular/ServiceControl/releases/tag/5.0.1",
    published: "2023-12-08T10:33:57Z",
    assets: [
      {
        name: "Particular.ServiceControl-5.0.1.exe",
        size: 210914368,
        download: "https://github.com/Particular/ServiceControl/releases/download/5.0.1/Particular.ServiceControl-5.0.1.exe",
      },
    ],
  },
  {
    tag: "4.33.1",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.33.1",
    published: "2023-12-08T10:00:43Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.33.1.exe",
        size: 218425824,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.33.1/Particular.ServiceControl-4.33.1.exe",
      },
    ],
  },
  {
    tag: "5.0.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/5.0.0",
    published: "2023-12-01T20:15:16Z",
    assets: [
      {
        name: "Particular.ServiceControl-5.0.0.exe",
        size: 210913856,
        download: "https://github.com/Particular/ServiceControl/releases/download/5.0.0/Particular.ServiceControl-5.0.0.exe",
      },
    ],
  },
  {
    tag: "4.33.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.33.0",
    published: "2023-11-20T20:07:51Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.33.0.exe",
        size: 218426576,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.33.0/Particular.ServiceControl-4.33.0.exe",
      },
    ],
  },
  {
    tag: "4.32.4",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.32.4",
    published: "2023-11-15T10:06:55Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.32.4.exe",
        size: 208523728,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.32.4/Particular.ServiceControl-4.32.4.exe",
      },
    ],
  },
  {
    tag: "4.32.3",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.32.3",
    published: "2023-11-06T11:33:37Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.32.3.exe",
        size: 208291904,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.32.3/Particular.ServiceControl-4.32.3.exe",
      },
    ],
  },
  {
    tag: "4.32.2",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.32.2",
    published: "2023-07-21T16:50:47Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.32.2.exe",
        size: 208290904,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.32.2/Particular.ServiceControl-4.32.2.exe",
      },
    ],
  },
  {
    tag: "4.32.1",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.32.1",
    published: "2023-07-05T07:00:57Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.32.1.exe",
        size: 208294512,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.32.1/Particular.ServiceControl-4.32.1.exe",
      },
    ],
  },
  {
    tag: "4.32.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.32.0",
    published: "2023-06-22T19:11:16Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.32.0.exe",
        size: 208281552,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.32.0/Particular.ServiceControl-4.32.0.exe",
      },
    ],
  },
  {
    tag: "4.31.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.31.0",
    published: "2023-06-07T01:38:57Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.31.0.exe",
        size: 208351048,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.31.0/Particular.ServiceControl-4.31.0.exe",
      },
    ],
  },
  {
    tag: "4.30.1",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.30.1",
    published: "2023-05-29T09:26:53Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.30.1.exe",
        size: 200771168,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.30.1/Particular.ServiceControl-4.30.1.exe",
      },
    ],
  },
  {
    tag: "4.30.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.30.0",
    published: "2023-04-14T12:46:46Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.30.0.exe",
        size: 200759440,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.30.0/Particular.ServiceControl-4.30.0.exe",
      },
    ],
  },
  {
    tag: "4.29.3",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.29.3",
    published: "2023-03-07T04:52:45Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.29.3.exe",
        size: 200022320,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.29.3/Particular.ServiceControl-4.29.3.exe",
      },
    ],
  },
  {
    tag: "4.29.1",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.29.1",
    published: "2023-02-24T22:58:52Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.29.1.exe",
        size: 199745856,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.29.1/Particular.ServiceControl-4.29.1.exe",
      },
    ],
  },
  {
    tag: "4.29.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.29.0",
    published: "2023-02-23T01:08:20Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.29.0.exe",
        size: 199697368,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.29.0/Particular.ServiceControl-4.29.0.exe",
      },
    ],
  },
  {
    tag: "4.28.4",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.28.4",
    published: "2023-02-10T18:38:48Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.28.4.exe",
        size: 199647800,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.28.4/Particular.ServiceControl-4.28.4.exe",
      },
    ],
  },
  {
    tag: "4.28.3",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.28.3",
    published: "2023-02-03T06:32:00Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.28.3.exe",
        size: 199646592,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.28.3/Particular.ServiceControl-4.28.3.exe",
      },
    ],
  },
  {
    tag: "4.27.7",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.27.7",
    published: "2023-02-02T09:36:05Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.27.7.exe",
        size: 198134184,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.27.7/Particular.ServiceControl-4.27.7.exe",
      },
    ],
  },
  {
    tag: "4.27.6",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.27.6",
    published: "2023-01-18T19:22:00Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.27.6.exe",
        size: 197958208,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.27.6/Particular.ServiceControl-4.27.6.exe",
      },
    ],
  },
  {
    tag: "4.27.4",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.27.4",
    published: "2022-12-21T18:23:30Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.27.4.exe",
        size: 197961632,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.27.4/Particular.ServiceControl-4.27.4.exe",
      },
    ],
  },
  {
    tag: "4.26.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.26.0",
    published: "2022-11-08T15:15:42Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.26.0.exe",
        size: 176393512,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.26.0/Particular.ServiceControl-4.26.0.exe",
      },
    ],
  },
  {
    tag: "4.25.2",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.25.2",
    published: "2022-09-07T23:55:39Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.25.2.exe",
        size: 97388096,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.25.2/Particular.ServiceControl-4.25.2.exe",
      },
    ],
  },
  {
    tag: "4.25.1",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.25.1",
    published: "2022-09-06T04:56:05Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.25.1.exe",
        size: 97516296,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.25.1/Particular.ServiceControl-4.25.1.exe",
      },
    ],
  },
  {
    tag: "4.23.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.23.0",
    published: "2022-08-05T20:51:49Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.23.0.exe",
        size: 99709160,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.23.0/Particular.ServiceControl-4.23.0.exe",
      },
    ],
  },
  {
    tag: "4.22.0",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.22.0",
    published: "2022-06-15T09:24:56Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.22.0.exe",
        size: 99463704,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.22.0/Particular.ServiceControl-4.22.0.exe",
      },
    ],
  },
  {
    tag: "4.21.8",
    release: "https://github.com/Particular/ServiceControl/releases/tag/4.21.8",
    published: "2022-03-03T12:33:24Z",
    assets: [
      {
        name: "Particular.ServiceControl-4.21.8.exe",
        size: 97310320,
        download: "https://github.com/Particular/ServiceControl/releases/download/4.21.8/Particular.ServiceControl-4.21.8.exe",
      },
    ],
  },
];

export const servicePulseNoPlatformUpdatesNeeded: platformUpdates[] = [
  {
    tag: "1.37.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.37.0",
    published: "2023-08-16T14:57:29Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.37.0.exe",
        size: 17340048,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.37.0/Particular.ServicePulse-1.37.0.exe",
      },
    ],
  },
  {
    tag: "1.36.4",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.36.4",
    published: "2023-06-20T15:49:51Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.36.4.exe",
        size: 17340312,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.36.4/Particular.ServicePulse-1.36.4.exe",
      },
    ],
  },
  {
    tag: "1.36.3",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.36.3",
    published: "2023-06-01T17:28:25Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.36.3.exe",
        size: 17340064,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.36.3/Particular.ServicePulse-1.36.3.exe",
      },
    ],
  },
  {
    tag: "1.36.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.36.0",
    published: "2023-05-30T17:32:02Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.36.0.exe",
        size: 17340112,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.36.0/Particular.ServicePulse-1.36.0.exe",
      },
    ],
  },
  {
    tag: "1.35.1",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.35.1",
    published: "2023-04-19T15:38:25Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.35.1.exe",
        size: 17293680,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.35.1/Particular.ServicePulse-1.35.1.exe",
      },
    ],
  },
  {
    tag: "1.35.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.35.0",
    published: "2023-04-03T19:33:39Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.35.0.exe",
        size: 17293656,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.35.0/Particular.ServicePulse-1.35.0.exe",
      },
    ],
  },
  {
    tag: "1.34.4",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.34.4",
    published: "2023-03-27T19:03:52Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.34.4.exe",
        size: 17293688,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.34.4/Particular.ServicePulse-1.34.4.exe",
      },
    ],
  },
  {
    tag: "1.33.1",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.33.1",
    published: "2022-11-29T13:20:13Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.33.1.exe",
        size: 15924640,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.33.1/Particular.ServicePulse-1.33.1.exe",
      },
    ],
  },
  {
    tag: "1.32.4",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.32.4",
    published: "2022-08-12T10:30:53Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.32.4.exe",
        size: 14829776,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.32.4/Particular.ServicePulse-1.32.4.exe",
      },
    ],
  },
  {
    tag: "1.32.3",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.32.3",
    published: "2022-08-10T21:22:04Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.32.3.exe",
        size: 14829736,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.32.3/Particular.ServicePulse-1.32.3.exe",
      },
    ],
  },
  {
    tag: "1.32.2",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.32.2",
    published: "2022-08-01T11:55:22Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.32.2.exe",
        size: 14804912,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.32.2/Particular.ServicePulse-1.32.2.exe",
      },
    ],
  },
  {
    tag: "1.32.1",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.32.1",
    published: "2022-07-14T13:24:26Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.32.1.exe",
        size: 14804888,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.32.1/Particular.ServicePulse-1.32.1.exe",
      },
    ],
  },
  {
    tag: "1.31.3",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.31.3",
    published: "2022-05-19T14:06:22Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.31.3.exe",
        size: 14782656,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.31.3/Particular.ServicePulse-1.31.3.exe",
      },
    ],
  },
  {
    tag: "1.31.2",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.31.2",
    published: "2022-04-28T12:49:51Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.31.2.exe",
        size: 14782624,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.31.2/Particular.ServicePulse-1.31.2.exe",
      },
    ],
  },
  {
    tag: "1.31.1",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.31.1",
    published: "2021-11-29T12:57:51Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.31.1.exe",
        size: 14691264,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.31.1/Particular.ServicePulse-1.31.1.exe",
      },
    ],
  },
  {
    tag: "1.31.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.31.0",
    published: "2021-11-29T11:16:05Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.31.0.exe",
        size: 14691240,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.31.0/Particular.ServicePulse-1.31.0.exe",
      },
    ],
  },
  {
    tag: "1.30.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.30.0",
    published: "2021-06-02T12:40:48Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.30.0.exe",
        size: 11756200,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.30.0/Particular.ServicePulse-1.30.0.exe",
      },
    ],
  },
  {
    tag: "1.29.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.29.0",
    published: "2021-05-06T12:16:46Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.29.0.exe",
        size: 11752040,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.29.0/Particular.ServicePulse-1.29.0.exe",
      },
    ],
  },
  {
    tag: "1.28.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.28.0",
    published: "2020-11-19T09:23:50Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.28.0.exe",
        size: 9964664,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.28.0/Particular.ServicePulse-1.28.0.exe",
      },
    ],
  },
  {
    tag: "1.27.1",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.27.1",
    published: "2020-10-29T12:35:38Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.27.1.exe",
        size: 9964096,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.27.1/Particular.ServicePulse-1.27.1.exe",
      },
    ],
  },
  {
    tag: "1.27.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.27.0",
    published: "2020-10-20T12:43:46Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.27.0.exe",
        size: 9964064,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.27.0/Particular.ServicePulse-1.27.0.exe",
      },
    ],
  },
  {
    tag: "1.26.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.26.0",
    published: "2020-09-28T08:13:08Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.26.0.exe",
        size: 9960128,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.26.0/Particular.ServicePulse-1.26.0.exe",
      },
    ],
  },
  {
    tag: "1.25.4",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.25.4",
    published: "2020-07-06T13:25:52Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.25.4.exe",
        size: 9953952,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.25.4/Particular.ServicePulse-1.25.4.exe",
      },
    ],
  },
  {
    tag: "1.25.3",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.25.3",
    published: "2020-06-01T17:49:48Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.25.3.exe",
        size: 10057096,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.25.3/Particular.ServicePulse-1.25.3.exe",
      },
    ],
  },
  {
    tag: "1.25.2",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.25.2",
    published: "2020-05-27T11:55:55Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.25.2.exe",
        size: 10057104,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.25.2/Particular.ServicePulse-1.25.2.exe",
      },
    ],
  },
  {
    tag: "1.25.1",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.25.1",
    published: "2020-05-04T12:30:48Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.25.1.exe",
        size: 10056632,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.25.1/Particular.ServicePulse-1.25.1.exe",
      },
    ],
  },
  {
    tag: "1.25.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.25.0",
    published: "2020-05-04T08:44:06Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.25.0.exe",
        size: 10056392,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.25.0/Particular.ServicePulse-1.25.0.exe",
      },
    ],
  },
  {
    tag: "1.24.3",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.24.3",
    published: "2020-03-11T10:12:27Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.24.3.exe",
        size: 9535360,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.24.3/Particular.ServicePulse-1.24.3.exe",
      },
    ],
  },
  {
    tag: "1.24.1",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.24.1",
    published: "2020-02-12T12:56:05Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.24.1.exe",
        size: 9535208,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.24.1/Particular.ServicePulse-1.24.1.exe",
      },
    ],
  },
  {
    tag: "1.24.0",
    release: "https://github.com/Particular/ServicePulse/releases/tag/1.24.0",
    published: "2020-02-11T11:58:31Z",
    assets: [
      {
        name: "Particular.ServicePulse-1.24.0.exe",
        size: 9534896,
        download: "https://github.com/Particular/ServicePulse/releases/download/1.24.0/Particular.ServicePulse-1.24.0.exe",
      },
    ],
  },
];
