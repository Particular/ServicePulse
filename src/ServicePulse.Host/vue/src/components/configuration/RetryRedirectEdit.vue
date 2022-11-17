<script setup>
import { ref, computed} from "vue";

const emit = defineEmits(['create', 'edit', 'cancel'])

const model = defineProps({
    message_redirect_id:String,
    from_physical_address:String,
    to_physical_address:String,
    immediately_Retry:Boolean
})

const sourceQueue = ref(model.from_physical_address)
const targetQueue = ref(model.to_physical_address)
const immediatelyRetry = ref(model.immediately_Retry)

const loadingTargetQueues = ref(false)

//TODO these need to look at endpoints
const sourceQueueIsValid = computed(()=> { return sourceQueue.value? true: false })
const targetQueueIsValid = computed(()=> { return targetQueue.value? true: false })

const formIsValid = computed(()=> { return sourceQueueIsValid.value &&  targetQueueIsValid.value})

const sourceQueueTooltip="Choose a queue that is known to Service Control"
const targetQueueTooltip="Choose a queue that is known to Service Control or provide a custom queue"

function create() {  
    var redirect = {
        sourceQueue:sourceQueue.value,
        targetQueue:targetQueue.value,
        immediatelyRetry:immediatelyRetry.value       
    }
    emit('create', redirect)
}

function edit()
{
    var redirect = {
        redirectId:model.message_redirect_id,
        sourceQueue:sourceQueue.value,
        targetQueue:targetQueue.value,
        immediatelyRetry:immediatelyRetry.value       
    }
    emit('edit', redirect)
}

function close() {    
    emit('cancel')
}

</script>

<template>  
    <div class="modal-container">
        <div class="modal-header">            
            <h3 class="modal-title" v-if="model.message_redirect_id">Modify redirect</h3>
            <h3 class="modal-title" v-if="!model.message_redirect_id">Create redirect</h3>
        </div>    

        <form name="redirectForm" novalidate @submit.prevent="save">
            <div class="modal-body">
                <div class="row">   
                    <div class="form-group">
                        <label for="sourceQueue">From physical address</label>
                        <span :title="sourceQueueTooltip"><i class="fa fa-info-circle"></i></span>
                        <div :class="{ 'has-error': !sourceQueueIsValid, 'has-success': sourceQueueIsValid }">
                            <input type="text" id="sourceQueue" name="sourceQueue" v-model="sourceQueue" class="form-control" required :disabled="model.message_redirect_id"/>
                            <!-- <ui-select name="sourceQueue" id="sourceQueue" v-model="physicalAddress.selected" theme="bootstrap" :disabled="model.message_redirect_id != undefined">
                                <ui-select-match uib-tooltip="{{$select.selected.physical_address}}">
                                    <span v-bind="$select.selected.physical_address"></span>
                                </ui-select-match>
                                <ui-select-choices repeat="item in endpoints | filter: $select.search">
                                    <span v-bind-html="item.physical_address | highlight: $select.search"></span>
                                </ui-select-choices>
                            </ui-select> -->
                        </div>
                    </div>
                    <div class="row"></div>
                    <div class="form-group">
                        <label for="targetQueue">To physical address</label>
                        <span :title="targetQueueTooltip"><i class="fa fa-info-circle"></i></span>
                        <div :class="{ 'has-error': !targetQueueIsValid, 'has-success': targetQueueIsValid }">
                            <input type="text" id="targetQueue" name="targetQueue" v-model="targetQueue" class="form-control" required />
                            <!-- <input type="text" id="targetQueue" name="targetQueue" placeholder="Target Queue Name" uib-typeahead="endpoint.physical_address as endpoint.physical_address for endpoint in endpoints | filter:$viewValue"
                                typeahead-loading="loadingTargetQueues" typeahead-no-results="noTargetQueues" class="form-control" autocomplete="off" required>
                            <i v-if="loadingTargetQueues" class="glyphicon glyphicon-refresh"></i>
                            <template v-if="noTargetQueues">
                                <div :class="{ 'has-error': noTargetQueues }">
                                    <p class="control-label">
                                        No known queues found. You can provide a non-audited queue name, but if you don't provide a valid address, the redirected message will be lost.
                                    </p>
                                </div>
                            </template> -->
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" v-model="immediatelyRetry" class="check-label" id="immediatelyRetry" /><label for="immediatelyRetry">Immediately retry any matching failed messages</label>
                    </div>
                </div>
            </div>  
            <div class="modal-footer">
                <button v-if="model.message_redirect_id" class="btn btn-primary" :disabled="!formIsValid" @click="edit">Modify</button>
                <button v-if="!model.message_redirect_id" class="btn btn-primary" :disabled="!formIsValid" @click="create">Create</button>
                <button class="btn btn-default" @click="close">Cancel</button>
            </div>      
        </form>
    </div>
</template>

<style>
.modal-container {
  width: 400px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}
</style>