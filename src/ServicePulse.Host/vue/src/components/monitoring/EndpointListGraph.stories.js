import EndpointListGraph from './EndpointListGraph.vue';

export default {
    component: EndpointListGraph,
    title: 'D3Graph',
    tags: ['autodocs'],
    //👇 Our events will be mapped in Storybook UI
    argTypes: {  
    }
  
};

//stories


export const Default = {
    args: {
    
    },
  };

  export const QueueLength = {
    args: {
     type:"queue-length"
    },
  };
  export const Throughput = {
    args: {
     type:"throughput"
    },
  };
  export const Retries = {
    args: {
     type:"retries"
    },
  };
  export const ProcessingTime = {
    args: {
     type:"processing-time"
    },
  };
  export const CriticalTime = {
    args: {
     type:"critical-time"
    },
  };