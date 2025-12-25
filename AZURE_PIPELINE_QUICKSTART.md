# Azure DevOps Pipeline Setup - Quick Start Guide

## Overview

This repository includes a complete Azure DevOps Pipeline configuration (`azure-pipelines.yml`) that automates the entire CI/CD workflow for StudyHub-IL.

## Pipeline Workflow

```
Code Commit → Trigger Pipeline → Build Stage → Test Stage → Publish Artifact → Deploy to Environment
```

## Quick Setup Steps

### 1. Prerequisites

- Azure DevOps account
- Azure Subscription
- GitHub/Azure Repos repository access

### 2. Create Pipeline

1. Go to Azure DevOps → Pipelines → New Pipeline
2. Select your repository source (GitHub/Azure Repos)
3. Choose "Existing Azure Pipelines YAML file"
4. Select `/azure-pipelines.yml`
5. Click "Run"

### 3. Configure Service Connection

1. Go to Project Settings → Service connections
2. Create new connection → Azure Resource Manager
3. Name it: `Azure-Subscription-Connection`
4. Authorize access to your Azure subscription

### 4. Create Environments

Create three environments in Pipelines → Environments:

- **Development** - For develop branch deployments
- **Staging** - For main branch deployments
- **Production** - For production deployments (with manual approval)

For Production environment:
1. Click "..." → Approvals and checks
2. Add Approval → Select approvers
3. Set timeout (e.g., 30 days)

### 5. Configure Variables

Add these variables in Pipeline → Edit → Variables:

| Variable | Type | Value |
|----------|------|-------|
| `DATABASE_URL_DEV` | Plain text | PostgreSQL connection for dev |
| `DATABASE_URL_STAGING` | Plain text | PostgreSQL connection for staging |
| `DATABASE_URL_PRODUCTION` | Secret | PostgreSQL connection for prod |
| `JWT_SECRET` | Secret | Your JWT secret key |
| `AZURE_STORAGE_CONNECTION_STRING` | Secret | Azure Storage connection |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV` | Secret | Static Web Apps token (dev) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING` | Secret | Static Web Apps token (staging) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD` | Secret | Static Web Apps token (prod) |

**Recommended**: Use Variable Groups linked to Azure Key Vault for better secrets management.

### 6. Create Azure Resources

You'll need these Azure resources:

#### Backend (App Services)
```bash
# Create App Service Plan first
az appservice plan create \
  --name StudyHub-Plan \
  --resource-group StudyHub-RG \
  --sku B1 \
  --is-linux

# Create App Services
az webapp create \
  --name studyhub-backend-dev \
  --resource-group StudyHub-RG \
  --plan StudyHub-Plan \
  --runtime "NODE|18-lts"

az webapp create \
  --name studyhub-backend-staging \
  --resource-group StudyHub-RG \
  --plan StudyHub-Plan \
  --runtime "NODE|18-lts"

az webapp create \
  --name studyhub-backend-prod \
  --resource-group StudyHub-RG \
  --plan StudyHub-Plan \
  --runtime "NODE|18-lts"
```

#### Frontend (Static Web Apps)
```bash
az staticwebapp create --name studyhub-frontend-dev --resource-group StudyHub-RG
az staticwebapp create --name studyhub-frontend-staging --resource-group StudyHub-RG
az staticwebapp create --name studyhub-frontend-prod --resource-group StudyHub-RG
```

#### Database (PostgreSQL)
```bash
az postgres flexible-server create --name studyhub-db --resource-group StudyHub-RG
az postgres flexible-server db create --database-name studyhub_dev
az postgres flexible-server db create --database-name studyhub_staging
az postgres flexible-server db create --database-name studyhub_prod
```

## Pipeline Stages

### Stage 1: Build
- **BuildBackend**: Compiles backend code, generates Prisma client, runs linter
- **BuildFrontend**: Builds frontend application with Vite
- **Outputs**: Two artifacts - backend-app and frontend-app

### Stage 2: Test
- **TestBackend**: Runs Jest tests with PostgreSQL service
- **Outputs**: Test results and code coverage reports

### Stage 3: Deploy to Development
- **Trigger**: Push to `develop` branch
- **Deploys**: Both backend and frontend to dev environment

### Stage 4: Deploy to Staging
- **Trigger**: Push to `main` branch
- **Deploys**: Both backend and frontend to staging environment

### Stage 5: Deploy to Production
- **Trigger**: After successful staging deployment + manual approval
- **Deploys**: Both backend and frontend to production environment

## Triggers

The pipeline automatically runs on:
- Push to `main`, `develop`, or `feature/*` branches
- Pull requests to `main` or `develop`
- Excludes changes to `*.md` files and docs

## Architecture

### Components Defined in Pipeline

1. **Repository Connection**: Automatic connection to GitHub/Azure Repos
2. **Triggers**: CI triggers on push/PR, optional scheduled runs
3. **Agents**: Ubuntu-latest hosted agents (can use self-hosted)
4. **Stages**: Build → Test → Deploy (Dev/Staging/Prod)
5. **Tasks**: Node.js setup, npm install, build, test, deploy
6. **Variables**: Configuration values and secrets
7. **Artifacts**: Build outputs saved and passed between stages
8. **Conditions**: Deployment based on branch and previous stage success
9. **Environments**: Three deployment targets with approval gates

## Key Features

✅ **Continuous Integration**: Automatic build and test on every commit
✅ **Continuous Deployment**: Automatic deployment to appropriate environment
✅ **Multi-Environment**: Separate dev, staging, and production environments
✅ **Manual Approvals**: Required approval before production deployment
✅ **Artifact Management**: Build outputs saved for each run
✅ **Test Automation**: Automated testing with coverage reports
✅ **Security**: Secrets managed via Azure Key Vault
✅ **Caching**: Dependency caching for faster builds
✅ **Parallel Jobs**: Frontend and backend build in parallel

## Customization

### Change Node.js Version
Edit the `nodeVersion` variable:
```yaml
variables:
  nodeVersion: '20.x'  # Change to desired version
```

### Add New Environment
1. Create environment in Azure DevOps
2. Add new deployment stage in `azure-pipelines.yml`
3. Configure service connection and variables

### Modify Triggers
Edit trigger section:
```yaml
trigger:
  branches:
    include:
      - main
      - your-branch-name
```

### Add Scheduled Runs
Add schedules section:
```yaml
schedules:
- cron: "0 2 * * *"
  displayName: Nightly build
  branches:
    include:
    - main
```

## Monitoring

### View Pipeline Runs
1. Go to Pipelines in Azure DevOps
2. Click on your pipeline
3. View run history and details

### Logs
- Each stage and task has detailed logs
- Download logs for offline analysis
- View test results and coverage reports

### Notifications
Configure notifications:
1. Project Settings → Notifications
2. Add subscription for:
   - Build completed
   - Build failed
   - Deployment completed
   - Deployment failed

## Troubleshooting

### Pipeline Won't Start
- Check triggers configuration
- Verify service connection exists
- Check repository permissions

### Build Fails
- Review build logs
- Check dependency versions
- Test locally: `npm ci && npm run build`

### Tests Fail
- Verify PostgreSQL service is running
- Check environment variables
- Review test logs

### Deployment Fails
- Verify Azure service connection
- Check Azure resource exists
- Verify artifact was created
- Check deployment logs

### Access Denied to Key Vault
- Add service principal to Key Vault access policies
- Grant Get and List permissions for secrets

## Best Practices

1. **Use Variable Groups**: Organize variables by environment
2. **Enable Caching**: Significantly reduces build time
3. **Parallel Jobs**: Run independent jobs simultaneously
4. **Manual Approvals**: Always require approval for production
5. **Secrets Management**: Never commit secrets to code
6. **Test Coverage**: Maintain high test coverage
7. **Artifact Retention**: Keep artifacts for at least 30 days
8. **Monitoring**: Set up notifications and alerts

## Documentation

For detailed documentation in Hebrew, see [AZURE_PIPELINE_GUIDE.md](AZURE_PIPELINE_GUIDE.md)

## Support

For issues or questions:
1. Check pipeline logs
2. Review Azure DevOps documentation
3. Contact DevOps team
4. Open an issue in the repository

## Resources

- [Azure Pipelines Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [YAML Schema Reference](https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/)
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)
