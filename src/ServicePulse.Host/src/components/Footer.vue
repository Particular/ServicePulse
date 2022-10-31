<script setup>
</script>

<template>
    <footer class="footer">
        <div class="container">
            <div class="row">
                <div class="connectivity-status">
                    <span>
                        <i class="fa fa-plus sp-blue"></i>
                        <a href="#/configuration/platformconnection">Connect new endpoint</a>
                    </span>
                    <span>
                        ServicePulse v1.5
                    </span>
                    <span>
                        ServicePulse v2.0 (<i class="fa fa-level-up fake-link"></i> <a href="https://particular.net/start-servicepulse-download" target="_blank">v2.0 available</a>)
                    </span>
                    <span uib-tooltip="ServiceControl URL https://ocalhost:3333/api">
                        Service Control:
                        <span class="connected-status">
                            <div class="fa pa-connection-success"></div> <span>Connected</span> <span class="versionnumber">v1.6</span>
                        </span>                        
                        <span class="connection-establishing">
                            <i class="fa pa-connection-establishing"></i> Connecting
                        </span>
                    </span>
                </div>
            </div>
        </div>
    </footer>
</template>

<style>
    footer { 
        display: flex; 
        align-items: center; 
        justify-content: center; 
    }  
</style>