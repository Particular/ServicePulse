<script setup></script>

<template v-if="!isExpired">
  <section name="message_groups">
    <div class="box">
      <div class="row">
        <div class="col-sm-12">
          <div class="list-section">
            <h3>Failed Message group</h3>
            <div class="col-sm-7 form-group">
              <label for="serviceControlUrl"> message group detail </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
