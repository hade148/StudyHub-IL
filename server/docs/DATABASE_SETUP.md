# Database Setup Guide

This guide covers database setup for both local development and Azure PostgreSQL Flexible Server deployment.

## Table of Contents
- [Local Development Setup](#local-development-setup)
- [Azure PostgreSQL Setup](#azure-postgresql-setup)
- [Running Prisma Migrations](#running-prisma-migrations)
- [Troubleshooting](#troubleshooting)
- [SSL/TLS Requirements](#ssltls-requirements)

---

## Local Development Setup

### Prerequisites
- PostgreSQL 14.x or higher installed locally
- Node.js 18.x or higher
- npm 9.x or higher

### Steps

1. **Install PostgreSQL**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Or use package manager:
     ```bash
     # Ubuntu/Debian
     sudo apt-get install postgresql postgresql-contrib
     
     # macOS (installs latest stable version)
     brew install postgresql
     
     # Windows
     # Download installer from postgresql.org
     ```

2. **Create Local Database**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   
   -- Create database
   CREATE DATABASE studyhub;
   
   -- Verify
   \l
   \q
   ```

3. **Configure Environment Variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit .env and set DATABASE_URL
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/studyhub"
   ```

4. **Generate Prisma Client and Run Migrations**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run db:migrate:dev
   
   # Or use the quick sync script
   ./sync-database.sh  # Linux/Mac
   sync-database.bat   # Windows
   ```

5. **Test Connection**
   ```bash
   npm run db:test-connection
   ```

---

## Azure PostgreSQL Setup

### Prerequisites
- Azure subscription
- Azure CLI installed (optional)
- Azure Database for PostgreSQL Flexible Server created

### Azure Database Configuration

The StudyHub-IL project uses Azure Database for PostgreSQL Flexible Server:
- **Server:** `studyhub-db.postgres.database.azure.com`
- **Admin Username:** `dbadmin`
- **Databases:**
  - `studyhub_dev` - Development environment
  - `studyhub_staging` - Staging environment
  - `studyhub_prod` - Production environment

### Connection String Format

Azure PostgreSQL requires SSL/TLS connections. The connection string format is:

```
postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/DATABASE_NAME?sslmode=require
```

### Environment-Specific Configuration

#### Development
```bash
DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_dev?sslmode=require"
```

#### Staging
```bash
DATABASE_URL_STAGING="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_staging?sslmode=require"
```

#### Production
```bash
DATABASE_URL_PRODUCTION="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_prod?sslmode=require"
```

### Firewall Configuration

Azure PostgreSQL Flexible Server uses firewall rules to control access:

1. **Allow Azure Services**
   - Enable "Allow public access from any Azure service within Azure to this server"

2. **Add Your IP Address**
   ```bash
   # Via Azure Portal
   Navigate to: Azure Portal > Your Database > Networking > Firewall Rules
   Add your IP address
   
   # Via Azure CLI
   az postgres flexible-server firewall-rule create \
     --resource-group studyhub-rg \
     --name studyhub-db \
     --rule-name AllowMyIP \
     --start-ip-address YOUR_IP \
     --end-ip-address YOUR_IP
   ```

3. **For CI/CD Pipelines**
   - Azure DevOps agents have dynamic IPs
   - Either allow Azure services or use a specific agent IP range

### Setting Up Azure Database

1. **Create Databases**
   ```bash
   # Connect to Azure PostgreSQL
   psql "host=studyhub-db.postgres.database.azure.com port=5432 dbname=postgres user=dbadmin password=YOUR_PASSWORD sslmode=require"
   
   # Create databases
   CREATE DATABASE studyhub_dev;
   CREATE DATABASE studyhub_staging;
   CREATE DATABASE studyhub_prod;
   
   # Verify
   \l
   \q
   ```

2. **Store Credentials Securely**
   - **Never commit passwords to Git**
   - Use Azure Key Vault for production
   - Use environment variables in Azure DevOps variable groups
   - Use `.env` files locally (already in .gitignore)

3. **Configure Application**
   ```bash
   # Set environment variable
   export DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_dev?sslmode=require"
   
   # Or update .env file
   DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_dev?sslmode=require"
   ```

---

## Running Prisma Migrations

### Development Environment

For local development with schema changes:

```bash
# Create a new migration
npm run db:migrate:dev

# This will:
# 1. Create a new migration file
# 2. Apply it to your database
# 3. Regenerate Prisma Client
```

### Production/Staging (Azure)

For deploying migrations to Azure environments:

```bash
# Set environment variable for target environment
export DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_staging?sslmode=require"

# Deploy migrations (no prompts, for CI/CD)
npm run db:migrate

# Or use the full command
npx prisma migrate deploy
```

### In Azure DevOps Pipeline

The migrations are automatically run as part of the deployment process:

```yaml
- script: |
    cd server
    npx prisma migrate deploy
  displayName: 'Run Prisma Migrations'
  env:
    DATABASE_URL: $(DATABASE_URL_STAGING)  # or appropriate variable
```

### Other Useful Commands

```bash
# Push schema without migrations (development only)
npm run db:push

# Open Prisma Studio to view/edit data
npm run db:studio

# Seed the database
npm run db:seed

# Reset database (WARNING: deletes all data)
npm run db:reset

# Generate Prisma Client only
npm run prisma:generate
```

---

## Troubleshooting

### Connection Issues

#### Error: "ECONNREFUSED"
- **Cause:** PostgreSQL is not running or not accessible
- **Solution:** 
  - Local: Start PostgreSQL service
  - Azure: Check firewall rules and network configuration

#### Error: "password authentication failed"
- **Cause:** Incorrect username or password
- **Solution:** 
  - Verify credentials in DATABASE_URL
  - For Azure: Check admin username format (should be just `dbadmin`, not `dbadmin@servername`)

#### Error: "database does not exist"
- **Cause:** Database hasn't been created
- **Solution:**
  ```sql
  CREATE DATABASE studyhub_dev;
  ```

#### Error: "SSL connection is required"
- **Cause:** Connecting to Azure without SSL
- **Solution:** Add `?sslmode=require` to connection string

#### Error: "no pg_hba.conf entry for host"
- **Cause:** IP address not allowed in firewall rules
- **Solution:** Add your IP to Azure firewall rules

### Migration Issues

#### Error: "Migration ... failed to apply cleanly"
- **Cause:** Database state doesn't match migration history
- **Solution:**
  ```bash
  # Option 1: Reset and reapply (development only)
  npm run db:reset
  
  # Option 2: Mark migration as applied
  npx prisma migrate resolve --applied MIGRATION_NAME
  
  # Option 3: Push schema directly (development only)
  npm run db:push
  ```

#### Error: "Database schema is not up to date"
- **Cause:** Migrations haven't been run
- **Solution:**
  ```bash
  npm run db:migrate
  ```

### Schema Drift

If you encounter errors about missing columns or tables:

```bash
# Check current database state vs schema
npx prisma migrate status

# Quick fix for development (uses db:push)
./sync-database.sh  # Linux/Mac
sync-database.bat   # Windows

# Proper fix: create and apply migration
npm run db:migrate:dev
```

---

## SSL/TLS Requirements

### Azure PostgreSQL SSL Configuration

Azure Database for PostgreSQL Flexible Server **requires** SSL/TLS connections by default for security.

#### Connection String Requirements
- Always include `?sslmode=require` in the connection string
- Example: `postgresql://user:pass@host:5432/db?sslmode=require`

#### SSL Modes Supported by Prisma
- `require` - Requires SSL, but doesn't verify certificate (recommended for Azure)
- `disable` - No SSL (only for local development)
- `prefer` - Use SSL if available (not recommended)

#### Testing SSL Connection

```bash
# Test with connection script
npm run db:test-connection

# The output will show "SSL/TLS active: Yes ✅" for Azure connections
```

#### Troubleshooting SSL Issues

**Error: "SSL connection is required"**
```bash
# Solution: Add sslmode to connection string
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

**Error: "unable to get local issuer certificate"**
```bash
# This usually doesn't happen with sslmode=require
# If it does, you may need to specify the certificate
# However, Azure Flexible Server should work with just sslmode=require
```

### Certificate Management

Azure PostgreSQL Flexible Server uses DigiCert Global Root G2 certificate. Prisma handles this automatically when `sslmode=require` is used.

For reference:
- Certificate download: [DigiCert Global Root G2](https://www.digicert.com/kb/digicert-root-certificates.htm)
- Azure documentation: [SSL/TLS connectivity in Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-networking)

---

## Best Practices

### Local Development
1. Use local PostgreSQL for development when possible
2. Keep `.env` file for local configuration (already in .gitignore)
3. Use `npm run db:migrate:dev` for schema changes
4. Test migrations locally before deploying

### Azure/Production
1. **Never commit database passwords or connection strings to Git**
2. Use Azure Key Vault for production secrets
3. Use Azure DevOps variable groups for CI/CD
4. Always use `sslmode=require` for Azure connections
5. Maintain separate databases for dev, staging, and production
6. Use `npx prisma migrate deploy` in CI/CD (not migrate dev)
7. Configure firewall rules to allow only necessary IPs
8. Regular backups through Azure automated backup
9. Monitor connection strings for security
10. Test database connection before deploying application

### Security
- Rotate database passwords regularly
- Use strong passwords (20+ characters, mixed case, numbers, symbols)
- Never log connection strings in application logs
- Use environment-specific credentials
- Monitor database access logs in Azure Portal
- Enable Azure AD authentication when possible

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Azure DevOps Documentation](https://docs.microsoft.com/en-us/azure/devops/)

---

## Quick Reference

### Common Commands
```bash
# Test database connection
npm run db:test-connection

# Run migrations (production)
npm run db:migrate

# Run migrations (development)
npm run db:migrate:dev

# Open Prisma Studio
npm run db:studio

# Push schema without migration
npm run db:push

# Seed database
npm run db:seed

# Reset database (destructive)
npm run db:reset

# Generate Prisma Client
npm run prisma:generate
```

### Environment Variables
```bash
# Local
DATABASE_URL="postgresql://postgres:password@localhost:5432/studyhub"

# Azure Development
DATABASE_URL="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_dev?sslmode=require"

# Azure Staging
DATABASE_URL_STAGING="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_staging?sslmode=require"

# Azure Production
DATABASE_URL_PRODUCTION="postgresql://dbadmin:PASSWORD@studyhub-db.postgres.database.azure.com:5432/studyhub_prod?sslmode=require"
```
