<script setup>
import { ref} from "vue";

const emit = defineEmits(['save', 'çlose'])
const settings = defineProps({ 
    smtp_server:String,
    smtp_port:Number,
    authentication_account:String,
    authentication_password:String,
    enable_tls:Boolean,
    from:String,
    to:String,
})

function save() {  
    //TODO perform the save
    emit('save')
}

</script>

<template>
    <Transition name="modal">
        <div class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 class="modal-title">Email configuration</h3>
                        <span>settings = {{settings.enable_tls}}</span>
                    </div>

                    <form name="notificationsForm" novalidate>
                        <div class="modal-body">
                            <div class="row">
                                <div class="form-group" :class="{'has-error': notificationsForm && notificationsForm.smtpServerAddress.$invalid}">
                                    <label for="smtpServerAddress">SMTP server address</label>
                                    <input type="text" id="smtpServerAddress" name="smtpServerAddress"
                                        v-model="settings.smtp_server"
                                        class="form-control" required />
                                </div>
                                <div class="row"></div>
                                <div class="form-group" :class="{'has-error': notificationsForm && notificationsForm.smtpServerPort.$invalid}">
                                    <label for="smtpServerPort">SMTP server port</label>
                                    <input type="number" id="smtpServerPort" name="smtpServerPort"
                                        v-model="settings.smtp_port"
                                        class="form-control" required />
                                </div>
                                <div class="row"></div>
                                <div class="form-group">
                                    <label for="account">Authentication account</label>
                                    <input type="text" id="account" name="account"
                                        v-model="settings.authentication_account" class="form-control" />
                                </div>
                                <div class="row"></div>
                                <div class="form-group">
                                    <label for="account">Authentication password</label>
                                    <input type="password" id="password" name="password"
                                        v-model="settings.authentication_password" class="form-control" />
                                </div>
                                <div class="row"></div>
                                <div class="form-group">
                                    <input type="checkbox" id="enableTLS" name="enableTLS"
                                        v-model="settings.enable_tls" class="check-label" />
                                    <label for="enableTLS">Use TLS</label>
                                </div>
                                <div class="row"></div>
                                <div class="form-group" :class="{'has-error': notificationsForm && notificationsForm.from.$invalid}">
                                    <label for="from">From address</label>
                                    <input type="email" id="from" name="from"
                                        v-model="settings.from" class="form-control" required/>
                                </div>
                                <div class="row"></div>
                                <div class="form-group" :class="{'has-error': notificationsForm && notificationsForm.to.$invalid}">
                                    <label for="to">To address</label>
                                    <input type="email" id="to" name="to"
                                        v-model="settings.to" class="form-control" required/>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" type="submit" @click="save(notificationsForm)">Save</button>
                            <button type="button" class="btn btn-default" @click="$emit('close')">Cancel</button>
                        </div>
                    </form>                   
                </div>
            </div>
        </div>
    </Transition>
  
    <!-- <div class="modal-header">
        <h3 class="modal-title">Email configuration</h3>
        <span>settings = {{settings.enable_tls}}</span>
    </div>

    <form name="notificationsForm" novalidate>
    <div class="modal-body">
        <div class="row">
            <div class="form-group" :class="{'has-error': notificationsForm && notificationsForm.smtpServerAddress.$invalid}">
                <label for="smtpServerAddress">SMTP server address</label>
                <input type="text" id="smtpServerAddress" name="smtpServerAddress"
                    v-model="settings.smtp_server"
                    class="form-control" required />
            </div>
            <div class="row"></div>
            <div class="form-group" :class="{'has-error': notificationsForm && notificationsForm.smtpServerPort.$invalid}">
                <label for="smtpServerPort">SMTP server port</label>
                <input type="number" id="smtpServerPort" name="smtpServerPort"
                    v-model="settings.smtp_port"
                    class="form-control" required />
            </div>
            <div class="row"></div>
            <div class="form-group">
                <label for="account">Authentication account</label>
                <input type="text" id="account" name="account"
                    v-model="settings.authorization_account" class="form-control" />
            </div>
            <div class="row"></div>
            <div class="form-group">
                <label for="account">Authentication password</label>
                <input type="password" id="password" name="password"
                    v-model="settings.authorization_password" class="form-control" />
            </div>
            <div class="row"></div>
            <div class="form-group">
                <input type="checkbox" id="enableTLS" name="enableTLS"
                    v-model="settings.enable_tls" class="check-label" />
                <label for="enableTLS">Use TLS</label>
            </div>
            <div class="row"></div>
            <div class="form-group" :class="{'has-error': notificationsForm && notificationsForm.from.$invalid}">
                <label for="from">From address</label>
                <input type="email" id="from" name="from"
                    v-model="settings.from" class="form-control" required/>
            </div>
            <div class="row"></div>
            <div class="form-group" :class="{'has-error': notificationsForm && notificationsForm.to.$invalid}">
                <label for="to">To address</label>
                <input type="email" id="to" name="to"
                    v-model="settings.to" class="form-control" required/>
            </div>
        </div>
    </div>
    <div class="modal-footer">
        <button class="btn btn-primary" type="submit" @click="save(notificationsForm)">Save</button>
        <button type="button" class="btn btn-default" @click="cancel">Cancel</button>
    </div>
</form> -->
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

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 400px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header h3 {
  margin-top: 0; 
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>