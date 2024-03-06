ARG BASE

FROM ${BASE}

COPY . /var/www/html

RUN cd /var/www/html && composer install --optimize-autoloader
