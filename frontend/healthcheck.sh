#!/bin/sh

# Health check for RentChain frontend
# Returns 0 if healthy, 1 if unhealthy

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "Nginx is not running"
    exit 1
fi

# Check if the application is responding
if ! curl -f http://localhost/ > /dev/null 2>&1; then
    echo "Application is not responding"
    exit 1
fi

# Check disk space (warning if below 10%)
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "Disk space is low: $DISK_USAGE%"
    exit 1
fi

# Check memory usage (warning if below 10% free)
MEM_FREE=$(free | awk 'NR==2 {printf "%.0f", $4*100/$2}')
if [ "$MEM_FREE" -lt 10 ]; then
    echo "Memory is low: $MEM_FREE% free"
    exit 1
fi

echo "Application is healthy"
exit 0