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
                    <dt><a href="/languages">消息</a></dt>
                </dl>
            </aside>
        </div>
        <div class="col-lg-9 col-md-9 col-sm-9">
          <div class="form-group">
            <label for="exampleInputEmail1">Email address</label>
            <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Email">
          </div>
            {% for category in categories %}
            <div class="col-lg-3 col-md-3 col-sm-3">
                <a href="{{ category.url }}">
                    <div class="box">
                        <img src="{{ category.img }}" >
                        <div class="caption">
                            <h3>{{ category.title }}</h3>
                            <p>{{ category.introduce }}</p>
                        </div>
                    </div>
                </a>
            </div>
            {% endfor %}
        </div>
    </div>

</div>
{% endblock %}
