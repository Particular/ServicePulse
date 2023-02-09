<template>
    <div class="lasttenoperations">
        <div class="row">
            <div class="col-sm-12 list-section">
                <h6>
                    <span class="fake-link" aria-hidden="true"><i class="fa fa-angle-right" aria-hidden="true"></i></span>
                    <a>Last 10 completed retry requests</a>
                </h6>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12 no-mobile-side-padding">
                <no-data ng-show="vm.historicGroups.length === 0" title="message group retries" message="No group retry requests have ever been completed"></no-data>
                <div class="row box extra-box-padding repeat-modify" ng-repeat="group in vm.historicGroups" ng-show="vm.historicGroups.length">
                    <div class="col-sm-12 no-mobile-side-padding">
                        <div class="row">
                            <div class="col-sm-12 no-side-padding">
                                <div class="row box-header">
                                    <div class="col-sm-12 no-side-padding">
                                        <p class="lead break"></p>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-sm-12 no-side-padding">
                                        <p class="metadata">
                                            <span class="metadata"><i aria-hidden="true" class="fa fa-envelope"></i> Messages sent: </span>
                                            <span class="metadata"><i aria-hidden="true" class="fa fa-clock-o"></i> Retry request started: <sp-moment date="{{group.start_time}}"></sp-moment></span>
                                            <span class="metadata"><i aria-hidden="true" class="fa fa-clock-o"></i> Retry request completed: <sp-moment date="{{group.completion_time}}"></sp-moment></span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.fake-link i {
  padding-right: 0.2em;
}

.lasttenoperations {
    padding-bottom: 2em;
}
</style>