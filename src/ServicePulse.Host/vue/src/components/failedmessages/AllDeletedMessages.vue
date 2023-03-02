<script setup>
    import { ref, onMounted, onUnmounted } from "vue";
    import { licenseStatus } from "../../composables/serviceLicense.js";
    import { connectionState } from "../../composables/serviceServiceControl.js";
    import { useFetchFromServiceControl, usePatchToServiceControl } from "../../composables/serviceServiceControlUrls.js";
    import { useShowToast } from "../../composables/toast.js";
    import { useRoute, onBeforeRouteLeave } from "vue-router";
   /* import { useArchiveExceptionGroup } from "../../composables/serviceMessageGroup";*/
    import LicenseExpired from "../../components/LicenseExpired.vue";
    import GroupAndOrderBy from "./GroupAndOrderBy.vue";
    import ServiceControlNotAvailable from "../ServiceControlNotAvailable.vue";
    import MessageList from "./MessageList.vue";
    import ConfirmDialog from "../ConfirmDialog.vue";

    let refreshInterval = undefined;
    let sortMethod = undefined;
    const route = useRoute();
    const groupId = ref(route.params.groupId);
    const groupName = ref("");
    const pageNumber = ref(1);
    const numberOfPages = ref(1);
    const totalCount = ref(0);


    const showConfirmRestore = ref(false);
    const messageList = ref();
    const messages = ref([]);
    const sortOptions = [
        {
            description: "All deleted",
            selector: function (group) {
                return group.title;
            },
            icon: "bi-sort-",
        },
        {
            description: "Deleted in the last 2 hours",
            selector: function (group) {
                return group.count;
            },
            icon: "bi-sort-alpha-",
        },
        {
            description: "Deleted in the last day",
            selector: function (group) {
                return group.count;
            },
            icon: "bi-sort-alpha-",
        },
        {
            description: "Deleted in last 7 days",
            selector: function (group) {
                return group.count;
            },
            icon: "bi-sort-alpha-",
        },
    ];

    function sortGroups(sort) {
        sortMethod = sort;
        loadMessages();
    }

    function loadMessages() {
        loadPagedMessages(groupId.value, pageNumber.value, sortMethod.description.replace(" ", "_").toLowerCase(), sortMethod.dir);
    }

    function loadPagedMessages(groupId, page, sortBy, direction) {
        if (typeof sortBy === "undefined") sortBy = "time_of_failure";
        if (typeof direction === "undefined") direction = "desc";
        if (typeof page === "undefined") page = 1;

        let loadGroupDetails;
        if (groupId && !groupName.value) {
            loadGroupDetails = useFetchFromServiceControl(`recoverability/groups/id/${groupId}`)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    groupName.value = data.title;
                });
        }

        const loadMessages = useFetchFromServiceControl(`${groupId ? `recoverability/groups/${groupId}/` : ""}errors?status=archived&page=${page}&sort=${sortBy}&direction=${direction}`)
            .then((response) => {
                totalCount.value = parseInt(response.headers.get("Total-Count"));
                numberOfPages.value = Math.ceil(totalCount.value / 50);

                return response.json();
            })
            .then((response) => {
                if (messages.value.length && response.length) {
                    // merge the previously selected messages into the new list so we can replace them
                    messages.value.forEach((previousMessage) => {
                        const receivedMessage = response.find((m) => m.id === previousMessage.id);
                        if (receivedMessage) {
                            if (previousMessage.last_modified == receivedMessage.last_modified) {
                                receivedMessage.retryInProgress = previousMessage.retryInProgress;
                                receivedMessage.deleteInProgress = previousMessage.deleteInProgress;
                            }

                            receivedMessage.selected = previousMessage.selected;
                        }
                    });
                }

                messages.value = response;
            })
            .catch((err) => {
                console.log(err);
                var result = {
                    message: "error",
                };
                return result;
            });

        if (loadGroupDetails) {
            return Promise.all([loadGroupDetails, loadMessages]);
        }

        return loadMessages;
    }



    function numberSelected() {
        return messageList?.value?.getSelectedMessages()?.length ?? 0;
    }

    function selectAll() {
        messageList.value.selectAll();
    }

    function deselectAll() {
        messageList.value.deselectAll();
    }

    function isAnythingSelected() {
        return messageList?.value?.isAnythingSelected();
    }

    function nextPage() {
        pageNumber.value = pageNumber.value + 1;
        if (pageNumber.value > numberOfPages.value) {
            pageNumber.value = numberOfPages.value;
        }
        loadMessages();
    }

    function previousPage() {
        pageNumber.value = pageNumber.value - 1;
        if (pageNumber.value == 0) {
            pageNumber.value = 1;
        }
        loadMessages();
    }

    function setPage(page) {
        pageNumber.value = page;
        loadMessages();
    }



    function restoreSelectedMessages() {
        const selectedMessages = messageList.value.getSelectedMessages();

        useShowToast("info", "Info", "restoring " + selectedMessages.length + " messages...");
        usePatchToServiceControl(
            "errors/unarchive",
            selectedMessages.map((m) => m.id)
        ).then(() => {
            messageList.value.deselectAll();
            selectedMessages.forEach((m) => (m.deleteInProgress = false));
        });
    }
    onBeforeRouteLeave(() => {
        groupId.value = undefined;
        groupName.value = undefined;
    });

    onUnmounted(() => {
        if (typeof refreshInterval !== "undefined") {
            clearInterval(refreshInterval);
        }
    });

    onMounted(() => {
        loadMessages();

        refreshInterval = setInterval(() => {
            loadMessages();
        }, 5000);
    });
</script>

<template>
    <LicenseExpired />
    <template v-if="!licenseStatus.isExpired">
        <ServiceControlNotAvailable />
        <template v-if="!connectionState.unableToConnect">
            <section name="message_groups">
                <div class="row" v-if="groupName && messages.length > 0">
                    <div class="col-sm-12">
                        <h1 v-if="groupName" class="active break group-title">
                            {{ groupName }}
                        </h1>
                        <h3 class="active group-title group-message-count">{{ totalCount }} messages in group</h3>
                    </div>
                </div>
                <div class="row" >
                    <div class="col-9">
                        <div class="btn-toolbar">
                            <button type="button" class="btn btn-default select-all" @click="selectAll" v-if="!isAnythingSelected()">Select all</button>
                            <button type="button" class="btn btn-default select-all" @click="deselectAll" v-if="isAnythingSelected()">Clear selection</button>
                            <button type="button" class="btn btn-default" @click="showConfirmRestore = true" :disabled="!isAnythingSelected()"><i class="fa fa-repeat"></i> Restore {{ numberSelected() }} selected</button>
                        </div>
                    </div>
                    <div class="col-3">
                        <GroupAndOrderBy @sort-updated="sortGroups" :hideGroupBy="true" :sortOptions="sortOptions" sortSavePrefix="all_deleted_"></GroupAndOrderBy>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <MessageList :messages="messages" :showRequestRetry="false" ref="messageList"></MessageList>
                    </div>
                </div>
                <div class="row" v-if="messages.length > 0">
                    <div class="col align-self-center">
                        <ul class="pagination justify-content-center">
                            <li class="page-item" :class="{ disabled: pageNumber == 1 }">
                                <a class="page-link" href="#" @click.prevent="previousPage">Previous</a>
                            </li>
                            <li v-for="n in numberOfPages" class="page-item" :class="{ active: pageNumber == n }" :key="n">
                                <a @click.prevent="setPage(n)" class="page-link" href="#">{{ n }}</a>
                            </li>
                            <li class="page-item">
                                <a class="page-link" href="#" @click.prevent="nextPage">Next</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <Teleport to="#modalDisplay">

                    <ConfirmDialog v-if="showConfirmRestore"
                                   @cancel="showConfirmRestore = false"
                                   @confirm="showConfirmRestore = false;restoreSelectedMessages();"
                                   :heading="'Are you sure you want to restore the selected messages?'"
                                   :body="'Restored messages will be moved back to the list of failed messages.'"></ConfirmDialog>
                </Teleport>
            </section>
        </template>
    </template>
</template>

<style>
    .select-all {
        width: 127px;
    }

    h3.group-message-count {
        color: #a8b3b1;
        font-size: 16px;
        margin: 4px 0 12px;
        display: block;
    }

    .group-title {
        display: block;
        font-size: 30px;
        margin: 10px 0 0;
    }

    h2.group-title,
    h3.group-title {
        font-weight: bold;
        line-height: 28px;
    }
</style>
