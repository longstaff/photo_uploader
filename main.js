(function(){

    var totalUpload = 0;
    var completeUpload = 0;

    var images = [];
    var imageIndex = 0;
    var imagesRunning = false;
    var imageTimer;
    var imageDelay = 4000;

    $(document).ready(function() {
        //Randomise images
        shuffle(images);
        startImages(true);

        $(window).on("resize", resizeTest);

        //Setup form
        $('#photos').ajaxForm({
            beforeSubmit:  formValidate,
            success: formSuccess,
            error: formFail
        });
        $('.reset').on("click", reset);

        $("#filesToUpload").on("change",function(){
          var files = this.files;
          showThumbnail(files);
        })
    });

    //images
    function shuffle(arr) {
        var ind = arr.length, temp, rand;

        while (ind !== 0) {
            rand = Math.floor(Math.random() * ind);
            ind -= 1;
            temp = arr[ind];
            arr[ind] = arr[rand];
            arr[rand] = temp;
        }

        return arr;
    }
    function startImages(firstrun){
        var test = widthTest();
        if(test && !imagesRunning){
            startTimer();
        }
        else if(!test && imagesRunning){
            stopTimer();
        }

        if(firstrun){
            loadImage(imageIndex);
        }
    }
    function setWrap(){
        var theWindow = $(window);
        var back = $(".bg img").last();
        var aspectRatio = back.width() / back.height();

        if ( (theWindow.width() / theWindow.height()) < aspectRatio ) {
            back.removeClass("bgwidth").addClass('bgheight');
            back.css({"left":"50%", "margin-left":"-"+Math.round(back.width()/2)+"px"});
        } else {
            back.removeClass("bgheight").addClass('bgwidth');
            back.css({"left":"auto", "margin-left":"0"});
        }
    }
    function widthTest(){
        return true //$(window).width() > 560;
    }

    function startTimer(){
        imagesRunning = true;
        imageTimer = setTimeout(timerCall, imageDelay);
    }
    function stopTimer(){
        imagesRunning = false;
        clearTimeout(imageTimer);
    }
    function timerCall(){
        imageIndex = imageIndex + 1;
        if(imageIndex > images.length) imageIndex = 0;
        loadImage(imageIndex);
    }
    function loadImage(ind){
        newImage = $("<img>");
        newImage.on("load", imageLoaded);
        newImage.attr("src", images[imageIndex]);

        if(newImage.complete) imageLoaded();
    }
    function imageLoaded(ev){
        $(this).off("load");

        $(".bg img").fadeOut(500, function(){
            $(this).remove();
        });
        $(".bg").append(this);
        setWrap();
        $(this).hide().fadeIn(500, function(){
            if(imagesRunning){
                clearTimeout(imageTimer);
                imageTimer = setTimeout(timerCall, imageDelay);
            }
        });
    }
    function resizeTest(){
        startImages();
        setWrap();
    }

    //Form
    function formSuccess(){
        var name = $("#name").val();
        if(name) $(".nameholder").text(", "+name);
        else $(".nameholder").text("");

        $(".confirmed").show();
        $(".loading, #photos, .nofile, .error").hide();
    }

    function formFail(){
        $(".error, #photos").show();
        $(".loading, .nofile, .confirmed").hide();
    }
    function formValidate(){
        var name = $("#name").val();

        if(!name){
            $(".noname, #photos").show();
            $(".nofile, .error, .loading, .confirmed").hide();
            return false;
        }
        else{
            $(".noname").hide();
        }

        console.log(completeUpload, totalUpload);
        var numFiles = totalUpload > 0 && completeUpload === totalUpload;

        if(numFiles > 0){
            $(".loading").show();
            $("#photos, .error, .nofile, .confirmed").hide();
        }
        else{
            $(".nofile, #photos").show();
            $(".error, .loading, .confirmed").hide();
            return false;
        }
    }

    function reset(ev){
        if(ev) ev.preventDefault();

        var input = $("#filesToUpload");
        input.replaceWith(input.val('').clone(true));

        $("#photos").show();
        $(".thumbnails").empty();
        $(".loading, .error, .nofile, .confirmed, .noname").hide();
    }

    function showThumbnail(files){
      var thumbnail = $(".thumbnails");
      thumbnail.empty();
      completeUpload = 0;

      for(var i=0;i<files.length;i++){
        var file = files[i]
        var imageType = /image.*/

        if(!file.type.match(imageType)){
          continue;
        }

        var image = $("<img>");
        // image.classList.add("")
        image.file = file;
        var list = $('<li></li>');
        list.append(image);
        thumbnail.append(list);

        var reader = new FileReader()
        reader.onload = (function(aImg){
          return function(e){
            aImg.attr("src", e.target.result);
            completeUpload = completeUpload +1;
          };
        }(image))
        var ret = reader.readAsDataURL(file);
        var canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        image.onload= function(){
          ctx.drawImage(image,100,100);
        }
      }

      totalUpload = files.length;
    }

})();
