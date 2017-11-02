<html>
<title>{{ notify }}红包雨</title>
<body>
  <div class="container main-container">
    <h3>红包雨</h3>
      {% for item in bonus %}
          {% if item.done %}
          <a href="{{ item.url }}">
              {{ item.title }}
          </a>
          {% else %}
          <a href="{{ item.url }}" style="color:red;">
              {{ item.title }}
          </a>
          {% endif %}

          <br>
      </div>
      {% endfor %}
  </div>
<script>
    {% if notify %}
    let timestamp = 10000;
    {% else %}
    let timestamp = 1000;
    {% endif %}
  setInterval(function(){
     window.location.reload();
  },timestamp);
</script>
</div>
