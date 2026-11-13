---
layout: portfolio
permalink: /personal/
title: Travel
description: Places I've visited and lived
nav: false
---

<div class="section-head">
  <h1>Travel</h1>
  <div class="rule"></div>
  <p class="section-subtitle">Places I've visited and lived.</p>
</div>

<div class="prose">
{% capture travel %}{% include portfolio_travel.md %}{% endcapture %}
{{ travel | markdownify }}
</div>
