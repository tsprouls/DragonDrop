//Required Files
//<script src="~/Scripts/Blob.js"></script>
//<script src="~/Scripts/jspdf.js"></script>
//<script src="~/Scripts/jspdf.plugin.addimage.js"></script>
//<script src="~/Scripts/jspdf.plugin.centertext.js"></script>
//<script src="~/Scripts/jspdf.plugin.split_text_to_size.js"></script>
//<script src="~/Scripts/jspdf.plugin.standard_fonts_plugin.js"></script>
//<script src="~/Scripts/jquery-1.10.2.min.js"></script>
//<script src="~/Scripts/FileSaver.min.js"></script>
//<script src="~/Scripts/imageCompression.js"></script>

var PDFModule = (function () {

    var jpegQuality = 0;
    var imageHeight = 3.25;

    var fontSize = 10;
    var paddingBetweenImages = .2;

    var pageHeight = 11;
    var pageWidth = 8.5;
    var pageMargin = 1;
    var startingHeight = 1;

    function createPDF(images, header, date, numberOfImagesPerPages, fileName, imageQuality) {
		jpegQuality = imageQuality;
        pageSetup();

        formatDate = new Date(date);
        if ( Object.prototype.toString.call(formatDate) === "[object Date]" ) {
            if ( isNaN( formatDate.getTime() ) ) {
               date = getToday();
            }
        }
        else {
            date = getToday();
        }


        setPageHeight(numberOfImagesPerPages);
        var pdf = getPDFDocument(header, date);

        //Starting position after the header/date text
        var currentDocumentPosition = startingHeight;

        for (var imagePosition in images) {

            var imageData = images[imagePosition];

            if (imageData.hasOwnProperty("imageSource")) {

                if (doesImageDataFitOnSamePage(pdf, currentDocumentPosition, imageData)) {

                    currentDocumentPosition = addImageDataToDocument(pdf, imageData, currentDocumentPosition);
                } else {

                    pdf.addPage();
                    currentDocumentPosition = pageMargin;

                    currentDocumentPosition = addImageDataToDocument(pdf, imageData, currentDocumentPosition);
                }

                currentDocumentPosition += paddingBetweenImages;
            }
        }

        pdf.save(fileName + '.pdf');
    }

    function pageSetup(){

        imageHeight = 3.25;

        fontSize = 10;
        paddingBetweenImages = .2;

        pageHeight = 11;
        pageWidth = 8.5;
        pageMargin = 1;
        startingHeight = 1;
    }
    function getToday(){

        var currentDate = new Date();
        return (currentDate.getMonth()+1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear();
    }

    function addImageDataToDocument(pdfDocument, imageData, position) {

        var currentDocumentPosition = position;

        var imageElement = document.createElement("img");
        imageElement.setAttribute('src', imageData.imageSource);

        var width;
        var position;

        var ratio = imageElement.naturalHeight / imageHeight;
        width = imageElement.naturalWidth / ratio;
        position = (pageWidth - width) / 2;
        var compressedImage = jic.compress(imageElement, jpegQuality, 'jpg').src;
        pdfDocument.addImage(compressedImage,'JPEG', position, currentDocumentPosition, width, imageHeight);
        currentDocumentPosition += imageHeight;
        currentDocumentPosition += paddingBetweenImages;

        currentDocumentPosition = splitTextAndPutInPDFCentered(pdf, imageData.description, currentDocumentPosition);

        return currentDocumentPosition;
    }

    function splitTextAndPutInPDF(pdf, text, currentDocumentPosition) {
        var splitText = pdf.splitTextToSize(text, pageWidth - (pageMargin * 2));

        var startingPosition = pageMargin;

        for (x in splitText) {
            pdf.text(startingPosition, currentDocumentPosition,splitText[x]);
            currentDocumentPosition += calculateLineHeight();
        }
        return currentDocumentPosition;
    }

    function splitTextAndPutInPDFCentered(pdf, text, currentDocumentPosition) {
        var splitText = pdf.splitTextToSize(text, pageWidth - (pageMargin * 2));

        for (x in splitText) {
            pdf.centerText(splitText[x], {align: "center"}, 0, currentDocumentPosition,splitText[x]);
            currentDocumentPosition += calculateLineHeight();
        }
        return currentDocumentPosition;
    }

    function doesImageDataFitOnSamePage(pdfDocument, currentHeight, imageData) {

        var calculatedHeight = 0;
        var imageDescription = pdf.splitTextToSize(imageData.description, pageWidth - (pageMargin * 2));


        for (x in imageDescription) {

            calculatedHeight += calculateLineHeight();
        }

        calculatedHeight += (imageHeight + currentHeight);

        //leave a 1 inch margin at the bottom
        calculatedHeight += pageMargin;

        if (calculatedHeight > pageHeight) {

            return false;
        }

        return true;
    }

    function calculateLineHeight() {
        return (fontSize / 72) ;
    }

    function setPageHeight(numberOfPages) {
        pageHeight = numberOfPages === 2 ? 11 : 14;
    }

    function getPDFDocument(header, date) {

        pdf = new jsPDF('p', 'in', [pageWidth, pageHeight]);
        fontSize = 16;
        pdf.setFontSize(fontSize);
        startingHeight = splitTextAndPutInPDFCentered(pdf, date, startingHeight);
        startingHeight = splitTextAndPutInPDFCentered(pdf, header, startingHeight);
        fontSize = 10;
        pdf.setFontSize(fontSize);

        return pdf;
    }


    return {
        createPDF: createPDF
    };
})()