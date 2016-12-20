var ImageController = function ($scope) {
    var imageSize = 900;
    var currentDate = new Date();
    var cookieName = 'hasSeenIntro';
    window.imageList = $scope.images = [];
    $scope.header = "";
    $scope.date = (currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
    $scope.fileName = "";
    $scope.numberOfImagesPerPage = 2;
    $scope.shouldConfirmReload = false;
    $scope.imageToBeRemoved;
    $scope.viewType = 'list';
    $scope.numberFinished = 0;
    $scope.totalImages = 0;
    $scope.imageQuality = 50;


    (function () {
        var hasSeenIntro = readCookie(cookieName);
        if (hasSeenIntro == null || hasSeenIntro == "") {
            showTour();
        }
    })();

    function showTour() {
        var tour;
        tour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: true
            }
        });
        tour.addStep('drop-zone', {
            text: 'Drag and drop images onto this area to load them',
            attachTo: '#my-drop-zone bottom',
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Close',
                    action: tour.hide
                },
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        });
        tour.addStep('load-images-btn', {
            text: 'Or click this button to load images',
            attachTo: '#loadimagesbtn bottom',
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Previous',
                    action: tour.back
                },
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        });

        tour.addStep('sort-view', {
            text: 'Click these buttons to toggle between the different views',
            attachTo: '#gridViewPill top',
            buttons: [
                {
                    classes: 'shepherd-button-secondary',
                    text: 'Previous',
                    action: tour.back
                },
                {
                    text: 'Next',
                    action: tour.next
                }
            ]
        });
        tour.addStep('generate', {
            text: 'Click these buttons to generate the pdf',
            attachTo: '#generate-div top',
            buttons: [
                {
                    text: 'Done',
                    action: tour.next
                }
            ]
        });
        tour.start();
        createCookie(cookieName, true, 20 * 365);
    }

    function createCookie(name, value, days) {
        var expires = '',
            date = new Date();
        if (days) {
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toGMTString();
        }
        document.cookie = name + '=' + value + expires + '; path=/';
    }

    function readCookie(name) {
        var cookies = document.cookie.split(';'),
            length = cookies.length,
            i,
            cookie,
            nameEQ = name + '=';
        for (i = 0; i < length; i += 1) {
            cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1, cookie.length);
            }
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length, cookie.length);
            }
        }
        return null;
    }

    (function ($, plupload) {

        // Instantiate the Plupload uploader.
        var uploader = new plupload.Uploader({

            // Try to load the HTML5 engine and then, if that's
            // not supported, the Flash fallback engine.
            runtimes: "html5,flash",

            // The upload URL - for our demo, we'll just use a
            // fake end-point (we're not actually uploading).
            url: "./post.json",

            // The ID of the drop-zone element.
            drop_element: "uploader",

            // To enable click-to-select-files, you can provide
            // a browse button. We can use the same one as the
            // drop zone.
            browse_button: "selectFiles",

            // For the Flash engine, we have to define the ID
            // of the node into which Pluploader will inject the
            // <OBJECT> tag for the flash movie.
            //container: "uploader",

            // The URL for the SWF file for the Flash upload
            // engine for browsers that don't support HTML5.
            flash_swf_url: "./assets/plupload/js/Moxie.swf",

            // Needed for the Flash environment to work.
            urlstream_upload: true

        });


        // Set up the event handlers for the uploader.
        // --
        // NOTE: I have excluded a good number of events that are
        // not relevant to the current demo.
        uploader.bind("PostInit", handlePluploadInit);
        uploader.bind("FilesAdded", handlePluploadFilesAdded);

        // Initialize the uploader (it is only after the
        // initialization is complete that we will know which
        // runtime load: html5 vs. Flash).
        uploader.init();
        function handlePluploadInit(uploader, params) {

            console.log('in uploader');

            console.log("Initialization complete.");

            console.log("Drag-drop supported:", !!uploader.features.dragdrop);

        }


        var countFinished = 0;
        var newImages = [];
        var totalNumberOfFiles = 0;

        function handlePluploadFilesAdded(uploader, files) {
            //Reset countFinished
            countFinished = 0;
            newImages = [];

            $scope.$apply(function () {
                $scope.totalImages = files.length;
                $scope.numberFinished = 0;
            });
            console.log("Files selected.");

            $('#myModal').on('show.bs.modal', function () {

                files = [].slice.call(files);

                for (var i = 0, file; file = files[i]; i++) {
                    if (file.type.match(/image.*/)) {

                        showImagePreview(file, files.length);
                    }
                }
                $scope.shouldConfirmReload = true;
                $('#myModal').unbind('show');
            });
            $('#myModal').modal('show');
        }

        function showImagePreview(file, totalFiles) {
            totalNumberOfFiles = totalFiles;
            var options = { meta: true, orientation: true, maxHeight: imageSize, maxWidth: imageSize };
            loadImage(file.getNative(), finishLoadingImages, options);

        }
        function finishLoadingImages(img, data) {
            var model = {
                imageSource: img.toDataURL(),
                description: '',
                name: Math.random().toString(36).substr(2, 9),
            };
            newImages.push(model);


            $scope.$apply(function () {
                $scope.numberFinished++;
            });

            countFinished++;
            if (countFinished == totalNumberOfFiles) {
                $('#myModal').modal('hide');

                console.log("Pushing");
                newImages.sort(function (a, b) {
                    if (a.name.toUpperCase() > b.name.toUpperCase()) {
                        return 1;
                    }
                    if (a.name.toUpperCase() < b.name.toUpperCase()) {
                        return -1;
                    }
                    // a must be equal to b
                    return 0;
                });
                for (var i = 0, image; image = newImages[i]; i++) {
                    $scope.$apply(function () {
                        $scope.images.push(image);
                    });
                }
                console.log("Done loading files");
            }
        }

    })(jQuery, plupload);


    window.onbeforeunload = function (e) {

        if ($scope.shouldConfirmReload) {

            e = e || window.event;
            e.preventDefault = true;
            e.cancelBubble = true;
            e.returnValue = '';
        }
    }
    window.onload = function () {
        var trident = {
            string: navigator.userAgent.match(/Trident\/(\d+)/)
        };

        trident.version = trident.string ? parseInt(trident.string[1], 10) : null;

        if (trident.string && trident.version) {
            $('#modalUseChrome').modal('show');
        }
    }


    $scope.createPdf = function (imagesPerPage) {
        $('#pdfModal').modal('show');
        console.log("header:" + $scope.header);
        console.log("filename:" + $scope.fileName);
        var pdfName = $scope.fileName;
        if ($scope.fileName.trim().length == 0 && $scope.header.trim().length > 0) {
            pdfName = $scope.header.trim();
        }
        else if ($scope.fileName.trim().length == 0 && $scope.header.trim().length == 0) {
            pdfName = "DragonDrop";
        }

        PDFModule.createPDF($scope.images, $scope.header, $scope.date, imagesPerPage, pdfName, $scope.imageQuality);

        $scope.shouldConfirmReload = false;

        $('#pdfModal').modal('hide');
        return false;
    };

    $scope.clearAllImages = function () {

        var result = confirm("Are you sure you want to remove all images?");

        if (result) {

            while ($scope.images.length > 0) {
                $scope.images.pop();
            }
        }
    };

    $scope.confirmRemovePhoto = function (item) {

        $scope.imageToBeRemoved = item;

        $('#modalConfirmRemovePhoto').modal('show');
    }


    $scope.confirmClearAllImages = function () {

        $('#modalConfirmRemoveAllPhotos').modal('show');
    }


    $scope.removeAllPhotos = function () {

        $('#modalConfirmRemoveAllPhotos').modal('hide');

        while ($scope.images.length > 0) {

            $scope.images.pop();
        }
    }


    $scope.removePhoto = function () {

        var index = $scope.images.indexOf($scope.imageToBeRemoved);
        $scope.images.splice(index, 1);

        $('#modalConfirmRemovePhoto').modal('hide');

    }

    $scope.sortableOptions = {
        start: function (e, ui) {
            ui.item.data('startPosition', ui.item.index());
        },
        stop: function (e, ui) {

            var start = ui.item.data('startPosition');
            var end = ui.item.index();

            $scope.images.splice(end, 0, $scope.images.splice(start, 1)[0]);
            $scope.$digest();
        }
    };


    $scope.setupFileHandler = function () {
        document.getElementById('file-input').onchange = function (e) {

        };
    };


    $scope.changeToListView = function () {
        $scope.viewType = 'list';
        $('#listViewPill').addClass('active');
        $('#gridViewPill').removeClass('active');
    };

    $scope.changeToGridView = function () {
        $scope.viewType = 'grid';
        $('#listViewPill').removeClass('active');
        $('#gridViewPill').addClass('active');
    };

};