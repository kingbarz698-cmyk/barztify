FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    curl \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache rewrite module
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files ONLY dulu (untuk Docker layer caching)
COPY composer.json composer.lock* ./

# Install dependencies TANPA app source dulu
# Ini generate vendor/ dari scratch — tidak pakai vendor/ dari Git
RUN composer install \
    --no-interaction \
    --no-dev \
    --optimize-autoloader

# Baru copy semua source code (termasuk app/)
COPY . .

# Re-generate autoload dengan app/ sudah ada
# --classmap-authoritative = semua class di-bake ke classmap, no runtime scan
RUN composer dump-autoload \
    --no-interaction \
    --optimize \
    --classmap-authoritative

# Fix permissions
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && find /var/www/html -type f -exec chmod 644 {} \;

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