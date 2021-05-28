(function (window, angular, $) {
    'use strict';

    angular.module('services.export', [])
        .service('exportToFile', function () {
            function downloadString(text, fileType, fileName) {
                var blob = new Blob([text], { type: fileType });

                var a = document.createElement('a');
                a.download = fileName;
                a.href = URL.createObjectURL(blob);
                a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
                a.style.display = "none";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
            }

            this.downloadString = downloadString;
        });

}(window, window.angular, window.jQuery));