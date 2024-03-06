FROM node:14-alpine3.12 AS NODE

RUN mkdir /app

COPY . /app/

RUN cd /app && npm install && npm run prod

FROM registry.gitlab.com/btw-squad/btw-edutech-office:base AS PHP

ARG UID=1000

RUN usermod -u ${UID} www-data && \
  groupmod -g ${UID} www-data && \
  chown -R www-data.www-data /run && \
  chown -R www-data.www-data /var/lib/nginx && \
  chown -R www-data.www-data /var/log/nginx && \
  chown -R www-data.www-data /var/www/html
USER www-data

WORKDIR /var/www/html

COPY --chown=www-data:www-data --from=NODE /app .

RUN composer install --optimize-autoloader

EXPOSE 8000

CMD [ "/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf" ]
