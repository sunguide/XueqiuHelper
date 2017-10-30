//main js

function toast(message, title) {
    title = title || '';
    let div = `<div class="toast-dialog modal fade in">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">` + title + `</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="关闭">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    
                    <p>` + message + `</p>
                  </div>
                </div>
              </div>
            </div>`;

    if($(".toast-dialog").length > 0){
        $(".toast-dialog .modal-body p").html(message);
    }else{
        $("body").append(div);
    }

    $('.toast-dialog').modal('show');

}
$(function () {
    if($("#toast-message").html()){
        toast($("#toast-message").html());
    }
    $("#send-message").click(function () {
        let receiver = $("#receiver").val();
        let message = $("#message").val();
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
        $.post("/api/messages",{receiver:receiver,message:message},function (err,res) {
            if(err){
                toast(err);
            }else{
                console.log("res:");
                let data = JSON.parse(res.text);
                console.log(res);
                toast(data.message);
            }
        })
    })
});