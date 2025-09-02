#!/bin/bash
# This script runs once when the database container is first created.

set -e

# 1. Install necessary tools for downloading and unzipping.
apt-get update && apt-get install -y --no-install-recommends curl unzip

# 2. Download the latest version of the test_db project from GitHub.
echo "Downloading test_db from GitHub..."
curl -s -L https://github.com/datacharmer/test_db/archive/refs/heads/master.zip -o test_db.zip

# 3. Unzip the file.
echo "Unzipping database files..."
unzip test_db.zip
cd test_db-master

# 4. Run the import command.
#    The MYSQL_USER and MYSQL_PASSWORD variables are automatically available inside this script.
#    This command runs the main SQL script, which will now find all the .dump files
#    because they are in the same directory.
echo "Importing database... This will take a few minutes."
mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < employees.sql

echo "Database import complete!"