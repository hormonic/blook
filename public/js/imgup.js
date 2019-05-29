function preview(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            console.log(reader.result)
            let img = new Image;
            img.onload = function() { $('#img').attr({'src':e.target.result,'width':img.width});
            };
            img.src = reader.result;
        }
        reader.readAsDataURL(input.files[0]);     }   }

$("#upload").change(function(){
    $("#img").css({top: 0, left: 0});
    preview(this);
    $("#img").draggable({ containment: 'parent',scroll: false});
});