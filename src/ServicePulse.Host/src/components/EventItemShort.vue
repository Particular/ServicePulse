<script scoped>
import { ref, onMounted } from "vue";
import { getEventLogItems } from "../composables/eventLogItems.js";
import { moment } from 'moment';

const eventLogItems = ref([]);

onMounted(() => {
  getEventLogItems().then(data => {
    data.forEach(event => {
      // set date to moment date
      event.raised_at = moment(event.raised_at);
    });

    eventLogItems.value = data;
  });
});

</script>

<template>
  <div class="row box box-event-item" v-for="eventLogItem in eventLogItems" >
    <div class="col-xs-12">
      <div class="row">
        <div class="col-xs-1">
                <span class="fa-stack fa-lg">
                    <i class="fa fa-stack-2x" :class="iconClasses"></i>
                </span>
        </div>

        <div class="col-xs-9">
          <div class="row box-header">
            <div class="col-sm-12">
              <p class="lead">{{eventLogItem.description}}</p>
            </div>
          </div>
        </div>

        <div class="col-xs-2">
          <div>{{eventLogItem.raised_at.fromNow()}}</div>
        </div>
      </div>
    </div>
  </div>
</template>