FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    unzip git curl zip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions yang dibutuhkan
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache rewrite module
RUN a2enmod rewrite

# Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy semua source code
COPY . .

# Hapus vendor/ lama, install fresh dari scratch
RUN rm -rf vendor/ && composer install \
    --no-interaction \
    --no-dev \
    --optimize-autoloader

# Fix permissions
RUN chown -R www-data:www-data /var/www/html

# Apache: allow .htaccess routing
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

# Cloud Run requires port 8080
RUN sed -i 's/Listen 80/Listen 8080/g' /etc/apache2/ports.conf \
    && sed -i 's/:80>/:8080>/g' /etc/apache2/sites-available/000-default.conf

EXPOSE 8080

CMD ["apache2-foreground"]