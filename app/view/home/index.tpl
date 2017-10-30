{% extends "../layout/layout.tpl" %}

{% block content %}

<div class="container main-container">
    <div class="row awesome-category-list">
        <div class="col-lg-3 col-md-3 col-sm-3">
            <aside class="aside-left-nav">
                <div class="mobile-menu">
                    <ul>
                        <li><a href="/">首页</a></li>
                    </ul>
                </div>
                <dl>
                    <dt>消息服务</dt>
                    <dd>
                        <ul>
                            <li><a href="/messages">群发消息</a></li>
                            <li><a href="/post">定时发帖</a></li>
                        </ul>
                    </dd>
                </dl>
            </aside>
        </div>
        <div class="col-lg-9 col-md-9 col-sm-9">
            <div class="multi-message">
                <div class="form-group">
                    <label for="receiver">接收人昵称或者uid（非好友也可以收到）</label>
                    <textarea type="text" rows="12" class="form-control" id="receiver" placeholder="多个用英文,分开"></textarea>
                </div>
                <div class="form-group">
                    <label for="message">消息内容</label>
                    <textarea type="text" rows="6" class="form-control" id="message" placeholder="请输入发送的消息内容"></textarea>
                </div>
                <button type="button" id="send-message" class="btn btn-primary">发送</button>
            </div>
        </div>
    </div>
</div>

{% endblock %}
