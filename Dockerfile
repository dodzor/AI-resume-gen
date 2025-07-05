FROM php:8.1-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install required PHP extensions
RUN docker-php-ext-install curl

# Enable Apache mod_rewrite for clean URLs
RUN a2enmod rewrite

# Copy application files
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/
RUN chmod -R 755 /var/www/html/

# Create Apache configuration for routing
RUN echo '<Directory /var/www/html/>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n\
\n\
# Serve static files directly\n\
<Files "*.html">\n\
    Header set Content-Type "text/html; charset=UTF-8"\n\
</Files>\n\
\n\
<Files "*.js">\n\
    Header set Content-Type "application/javascript; charset=UTF-8"\n\
</Files>\n\
\n\
<Files "*.css">\n\
    Header set Content-Type "text/css; charset=UTF-8"\n\
</Files>' > /etc/apache2/conf-available/app.conf

RUN a2enconf app
RUN a2enmod headers

# Expose port 80
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"] 