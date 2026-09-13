---
layout: page
title: Apps
permalink: /apps/
description: Interactive pages that run in the browser
nav: true
nav_order: 3
---

Small web projects you can open and play with here — no install, just a click.

<div class="projects">
  <div class="row row-cols-1 row-cols-md-3">
    {% assign apps = site.data.web_apps %}
    {% for app in apps %}
    <div class="col mb-4">
      <a href="{{ app.url | relative_url }}">
        <div class="card h-100 hoverable">
          {% if app.img %}
          <figure>
            <img src="{{ app.img | relative_url }}" class="card-img-top" alt="{{ app.title }}" loading="lazy">
          </figure>
          {% endif %}
          <div class="card-body">
            <h2 class="card-title">{{ app.title }}</h2>
            <p class="card-text">{{ app.description }}</p>
          </div>
        </div>
      </a>
    </div>
    {% endfor %}
  </div>
</div>
