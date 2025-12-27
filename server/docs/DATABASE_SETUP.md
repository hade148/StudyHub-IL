# Database Setup Guide

This guide covers setting up and connecting to PostgreSQL databases for the StudyHub-IL project, both locally and on Azure.

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Azure PostgreSQL Setup](#azure-postgresql-setup)
- [Running Prisma Migrations](#running-prisma-migrations)
- [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

- PostgreSQL 14.x or higher installed
- Node.js 18.x or higher
- npm 9.x or higher

### Step 1: Install PostgreSQL

**On macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**On Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**On Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Step 2: Create Local Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE studyhub;

# Create user (optional)
CREATE USER studyhub_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE studyhub TO studyhub_user;

# Exit psql
\q
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Update the `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/studyhub"
```

### Step 4: Run Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run db:migrate:dev

# (Optional) Seed the database
npm run db:seed
```

### Step 5: Verify Connection

```bash
npm run db:test-connection
```

You should see a success message with database statistics.

## Azure PostgreSQL Setup

### Prerequisites

- Azure account with active subscription
- Azure Database for PostgreSQL Flexible Server created
- Server name: `studyhub-db.postgres.database.azure.com`
- Admin username: `dbadmin`

### Step 1: Configure Firewall Rules

Allow your IP address and Azure services to access the database:

1. Go to Azure Portal → Your PostgreSQL server
2. Navigate to **Networking** (or **Connection security**)
3. Add your client IP address
4. Enable "Allow Azure services to access this server"
5. Save changes

### Step 2: Create Databases

Connect to your Azure PostgreSQL server and create the required databases:

```bash
# Using psql
psql "host=studyhub-db.postgres.database.azure.com port=5432 dbname=postgres user=dbadmin password=YOUR_PASSWORD sslmode=require"

# Create databases
CREATE DATABASE studyhub_dev;
CREATE DATABASE studyhub_staging;
CREATE DATABASE studyhub_prod;

# Exit
\q
```

### Step 3: Configure Environment Variables

For **Development Environment** (`.env.development` or Azure DevOps variables):

```env
DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_dev?sslmode=require"
```

For **Staging Environment**:

```env
DATABASE_URL_STAGING="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_staging?sslmode=require"
```

For **Production Environment**:

```env
DATABASE_URL_PRODUCTION="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_prod?sslmode=require"
```

**Important Notes:**
- Always use `sslmode=require` for Azure connections
- Never commit actual passwords to version control
- Store passwords in Azure Key Vault or Azure DevOps secure variables

### Step 4: SSL/TLS Configuration

Azure PostgreSQL requires SSL connections. The `sslmode=require` parameter in the connection string ensures SSL is used.

**SSL Modes Available:**
- `disable` - No SSL (not recommended for Azure)
- `require` - Require SSL (recommended for Azure)
- `verify-ca` - Verify server certificate
- `verify-full` - Verify server certificate and hostname

For most cases, `sslmode=require` is sufficient for Azure PostgreSQL Flexible Server.

### Step 5: Test Connection

```bash
# Set the DATABASE_URL to your Azure connection string
export DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_dev?sslmode=require"

# Test connection
npm run db:test-connection
```

## Running Prisma Migrations

### Development Environment

For local development with schema changes:

```bash
# Create and apply a new migration
npm run db:migrate:dev

# This will:
# 1. Create a new migration file
# 2. Apply it to the database
# 3. Regenerate Prisma Client
```

### Staging/Production Environments

For deploying migrations to Azure:

```bash
# Deploy pending migrations (non-interactive)
npm run db:migrate

# Or use Prisma CLI directly
npx prisma migrate deploy
```

### Azure DevOps Pipeline

The pipeline should include migration steps for each environment:

```yaml
- script: |
    cd server
    npm ci
    npx prisma generate
    npx prisma migrate deploy
  displayName: 'Run Database Migrations'
  env:
    DATABASE_URL: $(DATABASE_URL_STAGING)  # or appropriate variable
```

### Other Useful Commands

```bash
# Push schema changes without migration (development only)
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:reset

# Generate Prisma Client only
npm run prisma:generate
```

## Troubleshooting

### Connection Issues

#### Error: "Connection refused" or "ECONNREFUSED"

**Local Database:**
- Ensure PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or `brew services list` (macOS)
- Check if PostgreSQL is listening on port 5432: `netstat -an | grep 5432`

**Azure Database:**
- Verify firewall rules allow your IP address
- Check if the server name is correct
- Ensure Azure services are allowed if connecting from Azure

#### Error: "SSL connection required"

Your connection string is missing the SSL mode parameter.

**Solution:**
Add `?sslmode=require` to your DATABASE_URL:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

#### Error: "password authentication failed"

**Solution:**
- Verify username and password are correct
- For Azure, ensure you're using the admin username (e.g., `dbadmin`)
- Check if password contains special characters that need URL encoding

### Migration Issues

#### Error: "Schema drift detected"

Your database schema doesn't match your Prisma schema.

**Solution:**
```bash
# Option 1: Push schema changes (development)
npm run db:push

# Option 2: Create a migration
npm run db:migrate:dev

# Option 3: Reset database (WARNING: loses data)
npm run db:reset
```

#### Error: "Migration failed to apply"

**Solution:**
1. Check the error message for specific SQL errors
2. Verify database permissions
3. For Azure, ensure firewall rules are configured
4. Try applying migrations manually:
   ```bash
   npx prisma migrate resolve --applied <migration-name>
   ```

### Azure-Specific Issues

#### Error: "Connection timeout"

**Possible causes:**
- Firewall rules not configured correctly
- Network connectivity issues
- Server is paused or stopped

**Solution:**
1. Check Azure Portal → PostgreSQL server → Networking
2. Add your IP address to firewall rules
3. Ensure server is running

#### Error: "Too many connections"

Azure PostgreSQL has connection limits based on pricing tier.

**Solution:**
- Use connection pooling in your application
- Increase server tier if needed
- Close unused connections properly

### Performance Issues

#### Slow queries on Azure

**Solution:**
- Enable query performance insights in Azure Portal
- Check database metrics (CPU, memory, connections)
- Consider increasing server tier
- Optimize database indexes

## Environment Variables Reference

| Variable | Environment | Description |
|----------|-------------|-------------|
| `DATABASE_URL` | Development | Local or Azure dev database |
| `DATABASE_URL_STAGING` | Staging | Azure staging database |
| `DATABASE_URL_PRODUCTION` | Production | Azure production database |

## Security Best Practices

1. **Never commit passwords** - Use `.env` files (gitignored) or Azure Key Vault
2. **Use SSL** - Always use `sslmode=require` for Azure connections
3. **Firewall rules** - Only allow necessary IP addresses
4. **Strong passwords** - Use complex passwords for database users
5. **Regular backups** - Enable automated backups in Azure
6. **Monitor access** - Review database logs regularly

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)
- [PostgreSQL SSL Support](https://www.postgresql.org/docs/current/libpq-ssl.html)

## Support

For issues or questions:
1. Check this troubleshooting guide
2. Review Prisma documentation
3. Check Azure PostgreSQL documentation
4. Contact the development team
