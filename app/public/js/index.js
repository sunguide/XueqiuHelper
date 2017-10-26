//main js
$(function () {
    $("#send-message").click(function () {
        let receiver = $("#receiver").val();
        let csrftoken = $.cookie('csrfToken');
        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader('x-csrf-token', csrftoken);
                }
            },
        });
        $.post("/api/messages",{receiver:receiver},function (err,res) {
            if(err){
                console.log(err);
            }else{

            }
        })
    })
});