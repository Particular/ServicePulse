import D3Graph from "./D3Graph.vue";
import { expect } from "@storybook/jest";
export default {
    component: D3Graph,
    title: "Monitoring/EndpointList/D3Graph",
    tags: ["autodocs"],
    //👇 Our events will be mapped in Storybook UI
    argTypes: {},
};

//stories

export const Default = {
    args:

    {
        plotdata: {
            average: 0.0,
            points:[0.0,0.0,0.0,3.0,1.0,1.0,1.0,2.0,1.0,0.0,2.0,1.0,1.0,1.0,1.0,1.0,2.0,1.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0]
        },
        minimumyaxis: 10,
        avglabelcolor: '#EA7E00',
        isdurationgraph: false,
        metricsuffix: 'MSGS',
        csclass: 'graph queue-length pull-left ng-isolate-scope',
        endpointname: 'Test-Receiver',
        colname: 'queuelength'
    }
};