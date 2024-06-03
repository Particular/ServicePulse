#!/bin/sh

if [ ! -f /usr/share/nginx/html/js/app.constants.js ]
then
   envsubst < /usr/share/nginx/html/js/app.constants.template > /usr/share/nginx/html/js/app.constants.js
fi