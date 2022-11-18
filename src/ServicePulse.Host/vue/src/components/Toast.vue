<script setup>
const props = defineProps({
    type:String,
    title:String,
    message:String,
    //sticky:Boolean
})


</script>

<template>  
    <div class="toast-container">
        <template v-if="props.type === 'success'">
            <div class="toast-success">
                <h4>{{props.title}}</h4>
                <p class="toast-message">{{props.message}}</p>
            </div>
        </template>
        <template v-if="props.type === 'info'">
            <div class="toast-info">
                <h4>{{props.title}}</h4>
                <p class="toast-message">{{props.message}}</p>
            </div>
        </template>
        <template v-if="props.type === 'error'">
            <div class="toast-error">
                <h4>{{props.title}}</h4>
                <p class="toast-message">{{props.message}}</p>
            </div>
        </template>
        <template v-if="props.type === 'warning'">
            <div class="toast-warning">
                <h4>{{props.title}}</h4>
                <p class="toast-message">{{props.message}}</p>
            </div>
        </template>
    </div>
</template>
