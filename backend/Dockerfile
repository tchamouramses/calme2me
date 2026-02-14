FROM php:8.4-apache

ARG ID_SERVER_DB_HOST
ARG ID_SERVER_DB_PORT
ENV ID_SERVER_DB_HOST=${ID_SERVER_DB_HOST}
ENV ID_SERVER_DB_PORT=${ID_SERVER_DB_PORT}
ENV TZ=UTC

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -i "s|/var/www/html|${APACHE_DOCUMENT_ROOT}|g" /etc/apache2/sites-available/000-default.conf && \
    apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y \
    zip unzip git curl netcat-traditional libpng-dev libjpeg-dev libfreetype6-dev libicu-dev \
    libonig-dev libxml2-dev libzip-dev libssl-dev && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd mbstring pdo pdo_mysql zip opcache bcmath intl pcntl sockets && \
    a2enmod rewrite && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y curl
RUN echo "upload_max_filesize = 50M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "post_max_size = 50M" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "max_input_time = 300" >> /usr/local/etc/php/conf.d/uploads.ini && \
    echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .
RUN composer install --no-interaction --no-dev --prefer-dist && \
    php artisan optimize && \
    php artisan storage:link

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80
CMD sh -c "echo 'Waiting for database...'; \
    until nc -z -v -w30 $ID_SERVER_DB_HOST $ID_SERVER_DB_PORT; do sleep 5; done; \
    echo 'Database is up!'; \
    php artisan migrate --force; \
    php artisan storage:link; \
    echo 'Starting Laravel Reverb...'; \
    php artisan reverb:start --debug -q > /var/log/reverb.log 2>&1 & \
    tail -f /var/log/queue.log & \
    exec apache2-foreground"
