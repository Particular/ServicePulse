(function (window, angular, d3) {
    'use strict';


    function controller($scope, serviceControlService, $routeParams, $compile) {
        
        function createTreeStructure(messages) {
            var map = {}, node, roots = [], i;

            for (i = 0; i < messages.length; i += 1) {
                map[messages[i].messageId] = i; // initialize the map
                messages[i].children = []; // initialize the children
            }

            for (i = 0; i < messages.length; i += 1) {
                node = messages[i];
                if (node.parentId && map[node.parentId] ) {
                    // if you have dangling branches check that map[node.parentId] exists
                    messages[map[node.parentId]].children.push(node);                    
                } else {
                    roots.push(node);
                }
            }
            return roots;
        }

        function mapMessage(message) {
            var parentid, saga = '';
            var header = message.headers.find(function(x) { return x.key === 'NServiceBus.RelatedTo';});
            if(header){
                parentid = header.value;   
            }
            var sagaHeader = message.headers.find(function(x) { return x.key === 'NServiceBus.OriginatingSagaType';});
            if(sagaHeader){
                saga = sagaHeader.value.split(', ')[0];
            }
            
            return {
                "nodeName": message.message_type,
                "id": message.id,
                "messageId": message.message_id,
                "parentId": parentid,
                "type": message.headers.findIndex(function(x) { return x.key === 'NServiceBus.DeliverAt'; }) > -1 ? 'Timeout message' : message.headers.find(function(x) { return x.key === 'NServiceBus.MessageIntent'; }).value === 'Publish' ? 'Event message' : 'Command message',
                "isError": message.headers.findIndex(function(x) { return x.key === 'NServiceBus.ExceptionInfo.ExceptionType'; }) > -1,
                "sagaName": saga,
                "link" : {
                    "name" : "Link "+message.id,
                    "nodeName" : message.id                    
                },
                "timeSent": new Date(message.time_sent)
            };
        }

        // Set the dimensions and margins of the diagram
        var margin = {top: 20, right: 90, bottom: 30, left: 90},
            width = 3600 - margin.left - margin.right;
            
        var rectNode = { width : 250, height : 90, textMargin : 5 }

        
        var i = 0,
            duration = 750,
            root, treemap, svg, parentSvg;
        
        var currentMessageId = $routeParams.messageId;

        function drawTree(treeData) {
            // Assigns parent, children, height, depth
            root = d3.hierarchy(treeData, function (d) {
                return d.children;
            });
                        
            // append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
            parentSvg = d3.select("#tree-container").append("svg")
                .attr('viewBox', '-1000 -10 2000 2000');
                
            svg = parentSvg.append("g")
                .attr("transform", "scale(.7,.7)");

            var zoom = d3.zoom()
                .scaleExtent([1 / 2, 8])
                .on("zoom", zoomed);
            
            svg.append('defs').append('marker')
                .attr('id', 'end-arrow')
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 0)
                .attr('refY', 0)
                .attr('markerWidth', 6)
                .attr('markerHeight', 6)
                .attr('orient', 'auto')
                .attr('class', 'arrow')
                .append('path')
                .attr('d', 'M10,-5L0,0L10,5');

            // declares a tree layout and assigns the size
            treemap = d3.tree().nodeSize([rectNode.width + 20, rectNode.height]);
            
            root.x0 = width / 2;
            root.y0 = 0;

            parentSvg.call(zoom);
            
            update(root);
        }

        function zoomed() {
            svg.attr("transform", d3.event.transform);
        }

        function update(source) {

            // Assigns the x and y position for the nodes
            var treeData = treemap(root);

            // Compute the new tree layout.
            var nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function(d){ d.y = d.depth * 180 });
            
            // ****************** Nodes section ***************************

            // Update the nodes...
            var node = svg.selectAll('g.node')
                .data(nodes, function(d) {return d.id || (d.id = ++i); });

            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', function(d){ return 'node ' + d.data.type.toLowerCase() + ' ' + (d.data.isError ? 'error' : '') + ' ' + (d.data.id === currentMessageId ? 'current-message' : '');})
                .attr('transform', function(d) {
                    return 'translate(' + source.x0 + "," + source.y0 + ')';
                })
                .on('click', click);

            // Add rectangle for the nodes
            nodeEnter.append('rect')
                .attr('rx', 6)
                .attr('ry', 6)
                .attr('width', rectNode.width)
                .attr('height', function(d) {
                    return !d.data.sagaName ? rectNode.height - 22 : rectNode.height;
                })
                .style("fill", function(d) {
                    return d._children ? 'lightsteelblue' : '#fff';
                });

            nodeEnter.append('foreignObject')
                .attr('x', rectNode.textMargin)
                .attr('y', rectNode.textMargin)
                .attr('width', function() {
                    return (rectNode.width - rectNode.textMargin * 2) < 0 ? 0
                        : (rectNode.width - rectNode.textMargin * 2)
                })
                .attr('height', function(d) {
                    var height = rectNode.height;
                    if(!d.data.sagaName){
                        height -= 10; 
                    }
                    return (height - rectNode.textMargin * 2) < 0 ? 0
                        : (height - rectNode.textMargin * 2)
                })
                .append('xhtml').html(function(d) {
                return '<div style="width:' + 
                    (rectNode.width - rectNode.textMargin * 2) + ' px; height:' + 
                    (rectNode.height - rectNode.textMargin * 2) + ' px;" class="node-text wordwrap">' +
                    '<i class="fa '+ (d.data.type === 'Timeout message' ? 'pa-flow-timeout' : d.data.type === 'Event message' ? 'pa-flow-event' : 'pa-flow-command') + '" title="' + d.data.type + '"></i><div class="lead righ-side-ellipsis" title="' + d.data.nodeName + '"><strong>' + (d.data.isError ? '<a href=#/failed-messages/message/' + d.data.id + '>' + d.data.nodeName + '</a>' : d.data.nodeName) + '</strong></div>' + 
                    '<span class="time-sent"><sp-moment date="' + d.data.timeSent + '"></sp-moment></span>' +
                    (d.data.sagaName ? '<i class="fa pa-flow-saga"></i><div class="saga lead righ-side-ellipsis" title="' + d.data.sagaName + '">' + d.data.sagaName + '</div>' : '') + 
'</div>';
            }).each(function(){
                    $compile(this)($scope);
                });

            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            // Update the node attributes and style
            nodeUpdate.select('rect.node')
                .attr('r', 10)
                .style("fill", function(d) {
                    return d._children ? "lightsteelblue" : "#fff";
                })
                .attr('cursor', 'pointer');


            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.x + "," + source.y + ")";
                })
                .remove();

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

            // Update the links...
            var link = svg.selectAll('path.link')
                .data(links, function(d) { return d.id; });

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', "g")
                .attr("class", function(d){
                    if(d.data.type === 'Event')
                        return 'link event';
                    else 
                        return 'link command';
                })
                .attr('marker-start', 'url(#end-arrow)')
                .attr('d', function(d){
                    var o = {x: source.x0, y: source.y0}
                    return straight(o, o);
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function(d){ return straight(d, d.parent) });

            // Remove any exiting links
            link.exit().transition()
                .duration(duration)
                .attr('d', function(d) {
                    var o = {x: source.x, y: source.y};
                    return straight(o, o);
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function(d){
                d.x0 = d.x;
                d.y0 = d.y;
            });
            
            function straight(s, d){
                return 'M ' + (s.x + rectNode.width / 2) + ' ' + s.y +
                    ' C ' + (s.x + rectNode.width / 2) + ' ' + s.y + ' ,' +
                    (d.x + rectNode.width / 2) + ' ' + (d.y + rectNode.height - 22) + ' ,' +
                    (d.x + rectNode.width / 2) + ' ' + (d.y + rectNode.height - 22);
            }

            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);
            }
        }
        if($routeParams.sergioTest)
        {
            var messages = JSON.parse("[{\"id\":\"" + currentMessageId + "\",\"message_id\":\"6d945c78-d9bd-426f-8e0d-aeab00ba1752\",\"message_type\":\"CancelOrder\",\"sending_endpoint\":{\"name\":\"Samples.SimpleSaga\",\"host_id\":\"f3b4fa81-8fe7-9dae-19c8-b2b62070a6a0\",\"host\":\"DESKTOP-UHR90B3\"},\"receiving_endpoint\":{\"name\":\"Samples.SimpleSaga\",\"host_id\":\"f3b4fa81-8fe7-9dae-19c8-b2b62070a6a0\",\"host\":\"DESKTOP-UHR90B3\"},\"time_sent\":\"2022-06-05T11:17:32.218349Z\",\"processed_at\":\"2022-06-05T11:24:23.538739Z\",\"critical_time\":\"00:06:51.3203900\",\"processing_time\":\"00:00:00.0900640\",\"delivery_time\":\"00:06:51.2303260\",\"is_system_message\":false,\"conversation_id\":\"6a57578a-2282-4251-9c0b-aeab00ba1750\",\"headers\":[{\"key\":\"NServiceBus.ContentType\",\"value\":\"text/xml\"},{\"key\":\"NServiceBus.ConversationId\",\"value\":\"6a57578a-2282-4251-9c0b-aeab00ba1750\"},{\"key\":\"NServiceBus.CorrelationId\",\"value\":\"0976541c-3b4e-441b-a3b0-aeab00ba1750\"},{\"key\":\"NServiceBus.DeliverAt\",\"value\":\"2022-06-05 11:18:02:217916 Z\"},{\"key\":\"NServiceBus.EnclosedMessageTypes\",\"value\":\"CancelOrder, Sample, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null\"},{\"key\":\"NServiceBus.IsSagaTimeoutMessage\",\"value\":\"True\"},{\"key\":\"NServiceBus.MessageId\",\"value\":\"6d945c78-d9bd-426f-8e0d-aeab00ba1752\"},{\"key\":\"NServiceBus.MessageIntent\",\"value\":\"Send\"},{\"key\":\"NServiceBus.OriginatingEndpoint\",\"value\":\"Samples.SimpleSaga\"},{\"key\":\"NServiceBus.OriginatingMachine\",\"value\":\"DESKTOP-UHR90B3\"},{\"key\":\"NServiceBus.OriginatingSagaId\",\"value\":\"fac144c9-87cc-fc0d-84d3-49ae6f489f77\"},{\"key\":\"NServiceBus.OriginatingSagaType\",\"value\":\"OrderSaga, Sample, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null\"},{\"key\":\"NServiceBus.RelatedTo\",\"value\":\"0976541c-3b4e-441b-a3b0-aeab00ba1750\"},{\"key\":\"NServiceBus.ReplyToAddress\",\"value\":\"Samples.SimpleSaga\"},{\"key\":\"NServiceBus.SagaId\",\"value\":\"fac144c9-87cc-fc0d-84d3-49ae6f489f77\"},{\"key\":\"NServiceBus.SagaType\",\"value\":\"OrderSaga, Sample, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null\"},{\"key\":\"NServiceBus.TimeSent\",\"value\":\"2022-06-05 11:17:32:218349 Z\"},{\"key\":\"NServiceBus.Version\",\"value\":\"7.7.3\"},{\"key\":\"NServiceBus.NonDurableMessage\",\"value\":\"False\"},{\"key\":\"NServiceBus.InvokedSagas\",\"value\":\"OrderSaga:fac144c9-87cc-fc0d-84d3-49ae6f489f77\"},{\"key\":\"ServiceControl.SagaStateChange\",\"value\":\"fac144c9-87cc-fc0d-84d3-49ae6f489f77:Completed\"},{\"key\":\"NServiceBus.ProcessingStarted\",\"value\":\"2022-06-05 11:24:23:448675 Z\"},{\"key\":\"NServiceBus.ProcessingEnded\",\"value\":\"2022-06-05 11:24:23:538739 Z\"},{\"key\":\"NServiceBus.ProcessingMachine\",\"value\":\"DESKTOP-UHR90B3\"},{\"key\":\"NServiceBus.ProcessingEndpoint\",\"value\":\"Samples.SimpleSaga\"}],\"status\":\"successful\",\"message_intent\":\"send\",\"body_url\":\"/messages/6d945c78-d9bd-426f-8e0d-aeab00ba1752/body?instance_id=aHR0cDovL2xvY2FsaG9zdDo0NDQ0NC9hcGkv\",\"body_size\":175,\"invoked_sagas\":[{\"change_status\":\"Completed\",\"saga_type\":\"OrderSaga\",\"saga_id\":\"fac144c9-87cc-fc0d-84d3-49ae6f489f77\"}],\"originates_from_saga\":{\"saga_type\":\"OrderSaga\",\"saga_id\":\"fac144c9-87cc-fc0d-84d3-49ae6f489f77\"},\"instance_id\":\"aHR0cDovL2xvY2FsaG9zdDo0NDQ0NC9hcGkv\"},{\"id\":\"e1f0a28a-cf46-4365-76d1-c0526e75e16c\",\"message_id\":\"01a332a7-e72d-43ea-8af2-aeab00ba1752\",\"message_type\":\"CompleteOrder\",\"sending_endpoint\":{\"name\":\"Samples.SimpleSaga\",\"host_id\":\"f3b4fa81-8fe7-9dae-19c8-b2b62070a6a0\",\"host\":\"DESKTOP-UHR90B3\"},\"receiving_endpoint\":{\"name\":\"Samples.SimpleSaga\",\"host_id\":\"f3b4fa81-8fe7-9dae-19c8-b2b62070a6a0\",\"host\":\"DESKTOP-UHR90B3\"},\"time_sent\":\"2022-06-05T11:17:32.2179Z\",\"processed_at\":\"2022-06-05T11:24:23.624916Z\",\"critical_time\":\"00:00:00\",\"processing_time\":\"00:00:00\",\"delivery_time\":\"00:00:00\",\"is_system_message\":false,\"conversation_id\":\"6a57578a-2282-4251-9c0b-aeab00ba1750\",\"headers\":[{\"key\":\"NServiceBus.ContentType\",\"value\":\"text/xml\"},{\"key\":\"NServiceBus.ConversationId\",\"value\":\"6a57578a-2282-4251-9c0b-aeab00ba1750\"},{\"key\":\"NServiceBus.CorrelationId\",\"value\":\"0976541c-3b4e-441b-a3b0-aeab00ba1750\"},{\"key\":\"NServiceBus.DeliverAt\",\"value\":\"2022-06-05 11:17:42:217900 Z\"},{\"key\":\"NServiceBus.EnclosedMessageTypes\",\"value\":\"CompleteOrder, Sample, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null\"},{\"key\":\"NServiceBus.MessageId\",\"value\":\"01a332a7-e72d-43ea-8af2-aeab00ba1752\"},{\"key\":\"NServiceBus.MessageIntent\",\"value\":\"Send\"},{\"key\":\"NServiceBus.OriginatingEndpoint\",\"value\":\"Samples.SimpleSaga\"},{\"key\":\"NServiceBus.OriginatingMachine\",\"value\":\"DESKTOP-UHR90B3\"},{\"key\":\"NServiceBus.OriginatingSagaId\",\"value\":\"fac144c9-87cc-fc0d-84d3-49ae6f489f77\"},{\"key\":\"NServiceBus.OriginatingSagaType\",\"value\":\"OrderSaga, Sample, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null\"},{\"key\":\"NServiceBus.RelatedTo\",\"value\":\"0976541c-3b4e-441b-a3b0-aeab00ba1750\"},{\"key\":\"NServiceBus.ReplyToAddress\",\"value\":\"Samples.SimpleSaga\"},{\"key\":\"NServiceBus.TimeSent\",\"value\":\"2022-06-05 11:17:32:217900 Z\"},{\"key\":\"NServiceBus.Version\",\"value\":\"7.7.3\"},{\"key\":\"NServiceBus.NonDurableMessage\",\"value\":\"False\"},{\"key\":\"NServiceBus.ExceptionInfo.ExceptionType\",\"value\":\"System.IO.IOException\"},{\"key\":\"NServiceBus.ExceptionInfo.HelpLink\",\"value\":null},{\"key\":\"NServiceBus.ExceptionInfo.Message\",\"value\":\"The process cannot access the file 'C:\\\\Code\\\\docs.particular.net\\\\samples\\\\saga\\\\simple\\\\Core_7\\\\Sample\\\\bin\\\\Debug\\\\net5.0\\\\.sagas\\\\OrderSaga\\\\fac144c9-87cc-fc0d-84d3-49ae6f489f77.json' because it is being used by another process.\"},{\"key\":\"NServiceBus.ExceptionInfo.Source\",\"value\":\"System.Private.CoreLib\"},{\"key\":\"NServiceBus.ExceptionInfo.StackTrace\",\"value\":\"System.IO.IOException: The process cannot access the file 'C:\\\\Code\\\\docs.particular.net\\\\samples\\\\saga\\\\simple\\\\Core_7\\\\Sample\\\\bin\\\\Debug\\\\net5.0\\\\.sagas\\\\OrderSaga\\\\fac144c9-87cc-fc0d-84d3-49ae6f489f77.json' because it is being used by another process.\\r\\n   at System.IO.FileStream.ValidateFileHandle(SafeFileHandle fileHandle)\\r\\n   at System.IO.FileStream.CreateFileOpenHandle(FileMode mode, FileShare share, FileOptions options)\\r\\n   at System.IO.FileStream..ctor(String path, FileMode mode, FileAccess access, FileShare share, Int32 bufferSize, FileOptions options)\\r\\n   at NServiceBus.SagaStorageFile.OpenWithDelayOnConcurrency(String filePath, FileMode fileAccess) in /_/src/NServiceBus.Core/Persistence/Learning/SagaPersister/SagaStorageFile.cs:line 56\\r\\n   at NServiceBus.SagaStorageFile.OpenWithDelayOnConcurrency(String filePath, FileMode fileAccess) in /_/src/NServiceBus.Core/Persistence/Learning/SagaPersister/SagaStorageFile.cs:line 64\\r\\n   at NServiceBus.LearningSynchronizedStorageSession.Open(Guid sagaId, Type entityType) in /_/src/NServiceBus.Core/Persistence/Learning/LearningSynchronizedStorageSession.cs:line 72\\r\\n   at NServiceBus.LearningSynchronizedStorageSession.Read[TSagaData](Guid sagaId) in /_/src/NServiceBus.Core/Persistence/Learning/LearningSynchronizedStorageSession.cs:line 38\\r\\n   at NServiceBus.PropertySagaFinder`1.Find(IBuilder builder, SagaFinderDefinition finderDefinition, SynchronizedStorageSession storageSession, ContextBag context, Object message, IReadOnlyDictionary`2 messageHeaders) in /_/src/NServiceBus.Core/Sagas/PropertySagaFinder.cs:line 42\\r\\n   at NServiceBus.SagaPersistenceBehavior.Invoke(IInvokeHandlerContext context, Func`2 next) in /_/src/NServiceBus.Core/Sagas/SagaPersistenceBehavior.cs:line 78\\r\\n   at NServiceBus.SagaAudit.CaptureSagaStateBehavior.Invoke(IInvokeHandlerContext context, Func`1 next)\\r\\n   at NServiceBus.LoadHandlersConnector.Invoke(IIncomingLogicalMessageContext context, Func`2 stage) in /_/src/NServiceBus.Core/Pipeline/Incoming/LoadHandlersConnector.cs:line 48\\r\\n   at NServiceBus.ScheduledTaskHandlingBehavior.Invoke(IIncomingLogicalMessageContext context, Func`2 next) in /_/src/NServiceBus.Core/Scheduling/ScheduledTaskHandlingBehavior.cs:line 22\\r\\n   at NServiceBus.InvokeSagaNotFoundBehavior.Invoke(IIncomingLogicalMessageContext context, Func`2 next) in /_/src/NServiceBus.Core/Sagas/InvokeSagaNotFoundBehavior.cs:line 16\\r\\n   at NServiceBus.DeserializeMessageConnector.Invoke(IIncomingPhysicalMessageContext context, Func`2 stage) in /_/src/NServiceBus.Core/Pipeline/Incoming/DeserializeMessageConnector.cs:line 34\\r\\n   at NServiceBus.UnitOfWorkBehavior.InvokeUnitsOfWork(IIncomingPhysicalMessageContext context, Func`2 next) in /_/src/NServiceBus.Core/UnitOfWork/UnitOfWorkBehavior.cs:line 40\\r\\n   at NServiceBus.UnitOfWorkBehavior.InvokeUnitsOfWork(IIncomingPhysicalMessageContext context, Func`2 next) in /_/src/NServiceBus.Core/UnitOfWork/UnitOfWorkBehavior.cs:line 62\\r\\n   at NServiceBus.MutateIncomingTransportMessageBehavior.InvokeIncomingTransportMessagesMutators(IIncomingPhysicalMessageContext context, Func`2 next) in /_/src/NServiceBus.Core/MessageMutators/MutateTransportMessage/MutateIncomingTransportMessageBehavior.cs:line 59\\r\\n   at NServiceBus.InvokeAuditPipelineBehavior.Invoke(IIncomingPhysicalMessageContext context, Func`2 next) in /_/src/NServiceBus.Core/Audit/InvokeAuditPipelineBehavior.cs:line 18\\r\\n   at NServiceBus.ProcessingStatisticsBehavior.Invoke(IIncomingPhysicalMessageContext context, Func`2 next) in /_/src/NServiceBus.Core/Performance/Statistics/ProcessingStatisticsBehavior.cs:line 25\\r\\n   at NServiceBus.TransportReceiveToPhysicalMessageConnector.Invoke(ITransportReceiveContext context, Func`2 next) in /_/src/NServiceBus.Core/Pipeline/Incoming/TransportReceiveToPhysicalMessageConnector.cs:line 37\\r\\n   at NServiceBus.RetryAcknowledgementBehavior.Invoke(ITransportReceiveContext context, Func`2 next) in /_/src/NServiceBus.Core/ServicePlatform/Retries/RetryAcknowledgementBehavior.cs:line 25\\r\\n   at NServiceBus.MainPipelineExecutor.Invoke(MessageContext messageContext) in /_/src/NServiceBus.Core/Pipeline/MainPipelineExecutor.cs:line 35\\r\\n   at NServiceBus.TransportReceiver.InvokePipeline(MessageContext c) in /_/src/NServiceBus.Core/Transports/TransportReceiver.cs:line 58\\r\\n   at NServiceBus.TransportReceiver.InvokePipeline(MessageContext c) in /_/src/NServiceBus.Core/Transports/TransportReceiver.cs:line 64\\r\\n   at NServiceBus.Transport.RabbitMQ.MessagePump.Process(EventingBasicConsumer consumer, BasicDeliverEventArgs message, Byte[] messageBody) in /_/src/NServiceBus.Transport.RabbitMQ/Receiving/MessagePump.cs:line 368\"},{\"key\":\"NServiceBus.TimeOfFailure\",\"value\":\"2022-06-05 11:24:23:624916 Z\"},{\"key\":\"NServiceBus.ExceptionInfo.Data.Message ID\",\"value\":\"01a332a7-e72d-43ea-8af2-aeab00ba1752\"},{\"key\":\"NServiceBus.FailedQ\",\"value\":\"Samples.SimpleSaga\"},{\"key\":\"NServiceBus.ProcessingMachine\",\"value\":\"DESKTOP-UHR90B3\"},{\"key\":\"NServiceBus.ProcessingEndpoint\",\"value\":\"Samples.SimpleSaga\"}],\"status\":\"failed\",\"message_intent\":\"send\",\"body_url\":\"/messages/01a332a7-e72d-43ea-8af2-aeab00ba1752/body?instance_id=aHR0cDovL2xvY2FsaG9zdDozMzMzMy9hcGk.\",\"body_size\":234,\"instance_id\":\"aHR0cDovL2xvY2FsaG9zdDozMzMzMy9hcGk.\"},{\"id\":\"8b585ac2-edf2-737d-a9c1-c041694a710d\",\"message_id\":\"0976541c-3b4e-441b-a3b0-aeab00ba1750\",\"message_type\":\"StartOrder\",\"sending_endpoint\":{\"name\":\"Samples.SimpleSaga\",\"host_id\":\"f3b4fa81-8fe7-9dae-19c8-b2b62070a6a0\",\"host\":\"DESKTOP-UHR90B3\"},\"receiving_endpoint\":{\"name\":\"Samples.SimpleSaga\",\"host_id\":\"f3b4fa81-8fe7-9dae-19c8-b2b62070a6a0\",\"host\":\"DESKTOP-UHR90B3\"},\"time_sent\":\"2022-06-05T11:17:32.212755Z\",\"processed_at\":\"2022-06-05T11:17:32.231559Z\",\"critical_time\":\"00:00:00.0188040\",\"processing_time\":\"00:00:00.0159600\",\"delivery_time\":\"00:00:00.0028440\",\"is_system_message\":false,\"conversation_id\":\"6a57578a-2282-4251-9c0b-aeab00ba1750\",\"headers\":[{\"key\":\"NServiceBus.MessageId\",\"value\":\"0976541c-3b4e-441b-a3b0-aeab00ba1750\"},{\"key\":\"NServiceBus.MessageIntent\",\"value\":\"Send\"},{\"key\":\"NServiceBus.ConversationId\",\"value\":\"6a57578a-2282-4251-9c0b-aeab00ba1750\"},{\"key\":\"NServiceBus.CorrelationId\",\"value\":\"0976541c-3b4e-441b-a3b0-aeab00ba1750\"},{\"key\":\"NServiceBus.ReplyToAddress\",\"value\":\"Samples.SimpleSaga\"},{\"key\":\"NServiceBus.OriginatingMachine\",\"value\":\"DESKTOP-UHR90B3\"},{\"key\":\"NServiceBus.OriginatingEndpoint\",\"value\":\"Samples.SimpleSaga\"},{\"key\":\"NServiceBus.ContentType\",\"value\":\"text/xml\"},{\"key\":\"NServiceBus.EnclosedMessageTypes\",\"value\":\"StartOrder, Sample, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null\"},{\"key\":\"NServiceBus.Version\",\"value\":\"7.7.3\"},{\"key\":\"NServiceBus.TimeSent\",\"value\":\"2022-06-05 11:17:32:212755 Z\"},{\"key\":\"NServiceBus.NonDurableMessage\",\"value\":\"False\"},{\"key\":\"NServiceBus.InvokedSagas\",\"value\":\"OrderSaga:fac144c9-87cc-fc0d-84d3-49ae6f489f77\"},{\"key\":\"ServiceControl.SagaStateChange\",\"value\":\"fac144c9-87cc-fc0d-84d3-49ae6f489f77:New\"},{\"key\":\"NServiceBus.ProcessingStarted\",\"value\":\"2022-06-05 11:17:32:215599 Z\"},{\"key\":\"NServiceBus.ProcessingEnded\",\"value\":\"2022-06-05 11:17:32:231559 Z\"},{\"key\":\"NServiceBus.ProcessingMachine\",\"value\":\"DESKTOP-UHR90B3\"},{\"key\":\"NServiceBus.ProcessingEndpoint\",\"value\":\"Samples.SimpleSaga\"}],\"status\":\"successful\",\"message_intent\":\"send\",\"body_url\":\"/messages/0976541c-3b4e-441b-a3b0-aeab00ba1750/body?instance_id=aHR0cDovL2xvY2FsaG9zdDo0NDQ0NC9hcGkv\",\"body_size\":228,\"invoked_sagas\":[{\"change_status\":\"New\",\"saga_type\":\"OrderSaga\",\"saga_id\":\"fac144c9-87cc-fc0d-84d3-49ae6f489f77\"}],\"instance_id\":\"aHR0cDovL2xvY2FsaG9zdDo0NDQ0NC9hcGkv\"}]");
            var tree = createTreeStructure(messages.map(mapMessage));
            drawTree(tree[0]);
        }
        else {
            serviceControlService.getConversation($scope.conversationId).then(function(messages) {
                var tree = createTreeStructure(messages.map(mapMessage));
                drawTree(tree[0]);
            });
        }
    }
    
    controller.$inject = ['$scope', 'serviceControlService', '$routeParams', '$compile'];

    function directive() {
        return {
            scope: { conversationId: '@' },
            restrict: 'E',
            template: '<div id="tree-container"></div>',
            controller: controller
            
        };
    }

    directive.$inject = [];

    angular
        .module('sc')
        .directive('flowDiagram', directive);

}(window, window.angular, window.d3));

