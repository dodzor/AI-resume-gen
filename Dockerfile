FROM php:8.1-apache

# Install required PHP extensions
RUN docker-php-ext-install curl

# Enable Apache mod_rewrite for clean URLs
RUN a2enmod rewrite

# Copy application files
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html/
RUN chmod -R 755 /var/www/html/

# Create Apache configuration for API routing
RUN echo '<Directory /var/www/html/>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/app.conf

RUN a2enconf app

# Expose port 80 (Apache default)
EXPOSE 80

# Start Apache in foreground
CMD ["apache2-foreground"] 