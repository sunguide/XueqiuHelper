{% extends "../layout/layout.tpl" %}

{% block content %}
<section class="login-container">

    <div class="form-behavior divider">
        <span>登录</span>
    </div>

    <div class="inner">
        <form class="user-login-form" id="user-login" action="/login" accept-charset="UTF-8" method="post">
            <input name="utf8" type="hidden" value="✓">
            <div class="form-group">
                <input class="form-control" autofocus="autofocus" placeholder="邮箱/手机号" type="text"
                       name="username" id="username"
                       ng-model="formData.username">
                <span class="float-label"><i class="icon-username"></i></span>
            </div>

            <div class="form-group">
                <input class="form-control" autocomplete="on" placeholder="密码" type="password"
                       name="password" id="password"
                       ng-model="formData.password">
                <span class="float-label"><i class="icon-lock"></i></span>
            </div>

            <div class="form-group checkbox-group hidden">
                <input name="remember_me" type="hidden" value="0">
                <input type="checkbox" value="1"
                       checked="checked"
                       name="user[remember_me]"
                       id="user_remember_me">
                <label for="user_remember_me">记住密码</label>
            </div>

            <div class="form-group action">
                <button class="btn btn-block btn-primary ajax-post reload" type="submit" target-form="user-login-form">登录</button>
            </div>
        </form>
        <div class="help-section">

        </div>

    </div>
</section>
<script>
    $(".ajax-post").click(function () {

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
        $.post("/loginDo",$("#user-login").serialize(),function (err,res) {
            if(err){
                console.log(err);
            }else{

            }
        })
    });
</script>
{% endblock %}
