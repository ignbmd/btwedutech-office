FROM surnet/alpine-wkhtmltopdf:3.10-0.12.5-full as wkhtmltopdf
FROM php:8.0-fpm-alpine3.14

LABEL Maintainer="Pande Putu Widya Oktapratama"

RUN apk add --no-cache nginx supervisor curl tzdata bash shadow freetype libpng libjpeg-turbo freetype-dev libpng-dev libjpeg-turbo-dev icu-dev git libzip-dev\
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && php composer-setup.php \
    && mv composer.phar /usr/local/bin/composer \
    && rm /etc/nginx/http.d/default.conf \
    && touch /etc/crontab && apk add --no-cache tzdata shadow freetype libpng libjpeg-turbo \
    freetype-dev libpng-dev libjpeg-turbo-dev icu-dev \
    g++ libx11 libxrender libxext libssl1.1 ca-certificates \
    fontconfig freetype \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd intl && apk add --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing gnu-libiconv

ENV LD_PRELOAD /usr/lib/preloadable_libiconv.so php

ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.1.12/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=048b95b48b708983effb2e5c935a1ef8483d9e3e

RUN curl -fsSLO "$SUPERCRONIC_URL" \
    && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
    && chmod +x "$SUPERCRONIC" \
    && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
    && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

ENV CFLAGS="$CFLAGS -D_GNU_SOURCE"

RUN docker-php-ext-install pdo pdo_mysql sockets gd intl zip
COPY ./src/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY ./src/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./src/nginx.conf /etc/nginx/nginx.conf
COPY ./src/vhost.conf /etc/nginx/http.d/default.conf
COPY ./src/crontab /etc/crontab
COPY --from=wkhtmltopdf /bin/wkhtmltopdf /usr/local/bin/wkhtmltopdf
COPY --from=wkhtmltopdf /bin/wkhtmltoimage /usr/local/bin/wkhtmltoimage
COPY --from=wkhtmltopdf /bin/libwkhtmltox* /usr/local/bin/

EXPOSE 8000

CMD [ "/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf" ]

