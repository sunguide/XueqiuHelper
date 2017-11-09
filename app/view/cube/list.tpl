{% extends "../layout/layout.tpl" %}

{% block content %}

<div class="container main-container">
    <div class="row">
        <div class="cubes-container v-transition">
            <ul>
                {% for item in cubes %}
                <li>
                    <span>名称：</span>
                    <a href="https://xueqiu.com/P/{{ item.id }}">
                        {{ item.name }}
                    </a>
                    <span>收益率：{{ item.nav }}</span>
                    <span>管理人：<a href="https://xueqiu.com/{{ item.uid }}">{{ item.username}}</a></span>
                </li>

                {% endfor %}
            </ul>


            <div class="nav">
                {% if page > 1 %}
                <a href="/news?page={{ page - 1 }}">&lt; prev</a>
                {% endif %}
                <a href="/news?page={{ page + 1 }}">more...</a>
            </div>
        </div>
    </div>
</div>
{% endblock %}