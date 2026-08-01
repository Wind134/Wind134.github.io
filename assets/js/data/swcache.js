---
layout: compress

# The list to be cached by PWA
---

const resource = [
    /* --- CSS --- */
    '{{ "/assets/css/style.css" | relative_url }}',

    /* --- PWA --- */
    '{{ "/app.js" | relative_url }}',
    '{{ "/sw.js" | relative_url }}',

    /* --- Minimal offline shell --- */
    '{{ "/index.html" | relative_url }}',
    '{{ "/404.html" | relative_url }}',
    '{{ "/assets/js/dist/commons.min.js" | relative_url }}',
    '{{ "/assets/js/dist/home.min.js" | relative_url }}'
];

/* The request url with below domain will be cached */
const allowedDomains = [
    {% if site.google_analytics.id != empty and site.google_analytics.id %}
        'www.googletagmanager.com',
        'www.google-analytics.com',
    {% endif %}

    '{{ site.url | split: "//" | last }}',

    {% if site.img_cdn contains '//' and site.img_cdn %}
        '{{ site.img_cdn | split: '//' | last | split: '/' | first }}',
    {% endif %}

    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net',
    'polyfill.io'
];

/* Requests that include the following path will be banned */
const denyUrls = [];
