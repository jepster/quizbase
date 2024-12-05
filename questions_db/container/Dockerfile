FROM alpine:3.19 AS production

# Update and install system dependencies
RUN apk update && \
    apk upgrade && \
    apk add bash nginx php83-pecl-ssh2 php83-session git openssh-client \
            php83 php83-fpm php83-phar php83-iconv php83-mbstring php83-openssl php83-ctype php83-simplexml php83-xml \
            php83-xmlwriter php83-dom php83-tokenizer php83-pecl-amqp php83-curl php83-opcache php83-pecl-mongodb \
            mongodb-tools

# Copy configs
COPY ./container/resources/nginx/nginx.conf            /etc/nginx/
COPY ./container/resources/nginx/default.conf          /etc/nginx/http.d/
COPY ./container/resources/php/php-fpm.conf            /etc/php83/php-fpm.d/zz-php-fpm.conf
COPY ./container/resources/php/docker.conf             /etc/php83/php-fpm.d/zz-docker.conf
COPY ./container/resources/php/opcache.ini             /etc/php83/conf.d/50_opcache.ini
COPY ./container/resources/php/custom.ini  /etc/php83/conf.d/90_custom.ini

# Make sure that there is no existing symlink, before we create a new one.
RUN rm -f /usr/bin/php

# Set symlink for PHP
RUN ln -s /usr/bin/php83 /usr/bin/php

# Install composer from the official image
COPY --from=composer /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/application

# Add code
COPY ./symfony /var/www/application

# Run composer install to install the dependencies
RUN composer install --no-cache --no-interaction --optimize-autoloader

# Ensure the directory and log file are owned by user 1000
RUN chown -R 1000:1000 /var/www/application && \
    chown -R 1000:1000 /var/lib/nginx

# Do not run as root user, use 1000
USER 1000

# Open port
EXPOSE 8080

# Start nginx and php-fpm
CMD ["/bin/sh", "-c", "nginx && php-fpm83 --nodaemonize"]

FROM production AS development

# Switch back to root user for development specific tasks
USER root

# Install dev dependencies
RUN apk add php83-pecl-xdebug

# Copy development configs
COPY ./container/resources/php/opcache-dev.ini  /etc/php83/conf.d/50_opcache.ini
COPY ./container/resources/php/xdebug.ini       /etc/php83/conf.d/50_xdebug.ini

# Ensure the directory and log file are owned by user 1000 for development
RUN chown -R 1000:1000 /var/www/application && \
    chown -R 1000:1000 /var/lib/nginx

# Switch back to user 1000 for development
USER 1000