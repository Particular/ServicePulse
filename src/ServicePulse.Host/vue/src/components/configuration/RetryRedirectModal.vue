<script setup>
const props = defineProps({
  show: Boolean,
  model: Object
})

</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">
                        <h3 v-if="model.message_redirect_id">Modify redirect</h3>
                        <h3 v-if="!model.message_redirect_id">Create redirect</h3>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="row">   
                        <div class="form-group">
                            <label for="sourceQueue">From physical address</label>
                            <i class="fa fa-info-circle" uib-tooltip="Choose a queue that is known to Service Control"></i>
                            <div ng-class="{ 'has-error': redirectForm.sourceQueue.$invalid && (redirectForm.sourceQueue.$dirty || submitted), 'has-success': redirectForm.sourceQueue.$valid }">
                                <ui-select name="sourceQueue" id="sourceQueue" ng-model="physicalAddress.selected" theme="bootstrap" ng-disabled="message_redirect_id != undefined">
                                    <ui-select-match uib-tooltip="{{$select.selected.physical_address}}">
                                        <span ng-bind="$select.selected.physical_address"></span>
                                    </ui-select-match>
                                    <ui-select-choices repeat="item in endpoints | filter: $select.search">
                                        <span ng-bind-html="item.physical_address | highlight: $select.search"></span>
                                    </ui-select-choices>
                                </ui-select>
                            </div>
                        </div>
                        <div class="row"></div>
                        <div class="form-group">
                            <label for="targetQueue">To physical address</label>
                            <i class="fa fa-info-circle" uib-tooltip="Choose a queue that is known to Service Control or provide a custom queue"></i>

                            <div ng-class="{ 'has-error': redirectForm.targetQueue.$invalid && (redirectForm.targetQueue.$dirty || submitted), 'has-success': redirectForm.targetQueue.$valid }">
                                <input type="text" id="targetQueue" name="targetQueue" placeholder="Target Queue Name" uib-typeahead="endpoint.physical_address as endpoint.physical_address for endpoint in endpoints | filter:$viewValue"
                                    typeahead-loading="loadingTargetQueues" typeahead-no-results="noTargetQueues" class="form-control" autocomplete="off" required>
                                <i ng-show="loadingTargetQueues" class="glyphicon glyphicon-refresh"></i>
                                <div ng-show="noTargetQueues" ng-class="{ 'has-error': noTargetQueues }">
                                    <p class="control-label">
                                        No known queues found. You can provide a non-audited queue name, but if you don't provide a valid address, the redirected message will be lost.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <input type="checkbox" ng-model="immediatelyRetry" class="check-label" id="immediatelyRetry" /><label for="immediatelyRetry">Immediately retry any matching failed messages</label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button v-show="model.message_redirect_id" class="btn btn-primary" @click="$emit('modify')">Modify</button>
                    <button v-show="!model.message_redirect_id" class="btn btn-primary" @click="$emit('create')">Create</button>
                    <button class="btn btn-default" @click="$emit('cancel')">Cancel</button>
                </div>
            </div>
        </div>
    </div>
  </Transition>
</template>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}
</style>