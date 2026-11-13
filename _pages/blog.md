---
layout: portfolio
permalink: /blog/
title: Blog
nav: false
---

<div class="section-head">
  <h1>{{ site.blog_name }}</h1>
  <div class="rule"></div>
  <p class="section-subtitle">{{ site.blog_description }}</p>
</div>

{% include portfolio_posts.html %}
