<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">

    <!--<link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" />-->
    <link rel="stylesheet" href="//cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="/public/css/main.css"/>

    <link rel="icon" href="/public/favicon.png" type="image/x-icon">
    <title>{% block title %}雪球助手 | 大数据分析雪球海量数据 {% endblock %}</title>
</head>
<body>
<div id="wrapper">
    <div id="header" class="affix">
        <div class="inner">
            <div class="logo">
                <a href="/" alt="Awesome Kits"><img src="https://assets.imedao.com/images/logos/logotype.2015.png"></a>
            </div>
            <div>
                <ul class="menu">
                    <li class="menu-item" style="margin-right: 100px"><span>雪球助手，您的财富帮手</span></li>
                    <li class="menu-item">
                        {% if ctx.session.uid %}

                        <div class="dropdown inline-block" style="cursor: pointer">
                            <div class="dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <img class="avatar img-circle" src="{{ ctx.session.avatar }}"/>
                                <span>{{ ctx.session.nickname }}</span>

                                <span class="caret"></span>
                            </div>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                                <li><a href="/logout">退出</a></li>
                            </ul>
                        </div>
                        {% else %}
                        <span><a href="/login">登录</a></span>
                        {% endif %}
                    </li>
                </ul>
            </div>

        </div>
    </div>

    {% block content %}{% endblock %}
    <div id="footer">
        <div class="inner">
            <ul class="link">
                <li><a href="/about">关于我们</a></li>
                <li><a href="/update">升级计划</a></li>
            </ul>
            <div class="copyright">
                <p>Copyright © 2017 雪球助手 v1.0.1</p>
            </div>
        </div>
    </div>

</div>
<!--javascript-->
<script src="//cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
<script src="https://cdn.bootcss.com/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
<script src="//cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script src="/public/js/index.js"></script>
</body>
</html>
