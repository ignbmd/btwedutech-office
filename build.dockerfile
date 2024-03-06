ARG FRONTEND
ARG BACKEND

FROM ${FRONTEND} AS NODE
COPY . /app
RUN export NODE_OPTIONS="--max-old-space-size=15360"
RUN cd /app && npm run prod

FROM ${BACKEND} AS PHP
ARG UID=1000

COPY . /var/www/html
COPY --from=NODE /app/public /var/www/html/public/

RUN usermod -u ${UID} www-data && \
  groupmod -g ${UID} www-data && \
  chown -R www-data.www-data /run && \
  chown -R www-data.www-data /var/lib/nginx && \
  chown -R www-data.www-data /var/log/nginx && \
  chown -R www-data.www-data /var/www/html

USER www-data
WORKDIR /var/www/html
RUN composer dump

EXPOSE 8000

CMD [ "/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf" ]
