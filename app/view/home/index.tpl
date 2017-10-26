{% extends "../layout/layout.tpl" %}

{% block content %}

<div class="container main-container">
    <div class="row awesome-category-list">
        <div class="col-lg-3 col-md-3 col-sm-3">
            <aside class="aside-left-nav">
                <div class="mobile-menu">
                    <ul>
                        <li><a href="/">Home</a></li>
                    </ul>
                </div>
                <dl>
                    <dt>消息</dt>
                    <dd>
                        <ul>
                            <li><a href="/zh-cn/intro/index.html">Egg.js 是什么?</a></li>
                            <li><a href="/zh-cn/intro/egg-and-koa.html">Egg.js 和 Koa</a></li>
                            <li><a href="/zh-cn/intro/quickstart.html">快速入门</a></li>
                        </ul>
                    </dd>
                </dl>
            </aside>
        </div>
        <div class="col-lg-9 col-md-9 col-sm-9">
            <div class="multi-message">
                <div class="form-group">
                    <label for="receiver">接收人昵称或者uid</label>
                    <textarea type="text" rows="20" class="form-control" id="receiver" placeholder="多个用英文,分开"></textarea>
                </div>
                <button type="button" id="send-message" class="btn btn-primary">发送</button>
            </div>
        </div>
    </div>
</div>
{% endblock %}
