# Azure DevOps Pipeline Architecture

## Pipeline Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Code Repository                              │
│                     (GitHub / Azure Repos)                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │    Triggers    │
                    │  • Push to:    │
                    │    - main      │
                    │    - develop   │
                    │    - feature/* │
                    │  • Pull Request│
                    └────────┬───────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                         STAGE 1: BUILD                             │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐              ┌──────────────────┐           │
│  │  BuildBackend    │              │  BuildFrontend   │           │
│  │  • Node.js 18    │              │  • Node.js 18    │           │
│  │  • npm ci        │              │  • npm ci        │           │
│  │  • Prisma gen    │              │  • npm build     │           │
│  │  • lint          │              │  • Vite build    │           │
│  └────────┬─────────┘              └────────┬─────────┘           │
│           │                                 │                      │
│           ▼                                 ▼                      │
│  ┌──────────────────┐              ┌──────────────────┐           │
│  │ backend-app      │              │ frontend-app     │           │
│  │ (Artifact)       │              │ (Artifact)       │           │
│  └──────────────────┘              └──────────────────┘           │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                         STAGE 2: TEST                              │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐             │
│  │           TestBackend                            │             │
│  │  • PostgreSQL Service (Docker)                   │             │
│  │  • npm test (Jest)                               │             │
│  │  • Generate coverage report                      │             │
│  │  • Publish test results                          │             │
│  └──────────────────┬───────────────────────────────┘             │
│                     │                                              │
│                     ▼                                              │
│           ┌─────────────────┐                                      │
│           │  Tests Passed?  │                                      │
│           └────┬────────┬───┘                                      │
│                │        │                                          │
│               Yes       No                                         │
│                │        └──────> Pipeline Fails                    │
│                ▼                                                   │
└────────────────────────────────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────────────────────────────┐
│                  STAGE 3: DEPLOY TO DEVELOPMENT                    │
│                   (Trigger: develop branch)                        │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐             │
│  │  Environment: Development                        │             │
│  │  • Download artifacts                            │             │
│  │  • Deploy backend → Azure App Service            │             │
│  │  •   studyhub-backend-dev                        │             │
│  │  • Deploy frontend → Azure Static Web Apps       │             │
│  └──────────────────────────────────────────────────┘             │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                   STAGE 4: DEPLOY TO STAGING                       │
│                     (Trigger: main branch)                         │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐             │
│  │  Environment: Staging                            │             │
│  │  • Download artifacts                            │             │
│  │  • Deploy backend → Azure App Service            │             │
│  │  •   studyhub-backend-staging                    │             │
│  │  • Deploy frontend → Azure Static Web Apps       │             │
│  │  • Run smoke tests (optional)                    │             │
│  └──────────────────┬───────────────────────────────┘             │
└────────────────────┼────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│                  STAGE 5: DEPLOY TO PRODUCTION                     │
│              (Depends on: Staging + Manual Approval)               │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐             │
│  │         ⏸️  Manual Approval Required             │             │
│  │  • Designated approvers notified                 │             │
│  │  • Review staging deployment                     │             │
│  │  • Approve or reject                             │             │
│  └──────────────────┬───────────────────────────────┘             │
│                     ▼                                              │
│  ┌──────────────────────────────────────────────────┐             │
│  │  Environment: Production                         │             │
│  │  • Download artifacts                            │             │
│  │  • Deploy backend → Azure App Service            │             │
│  │  •   studyhub-backend-prod                       │             │
│  │  • Deploy frontend → Azure Static Web Apps       │             │
│  │  • Verify deployment                             │             │
│  └──────────────────────────────────────────────────┘             │
└────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   ✅ Success   │
                    │  App is Live!  │
                    └────────────────┘
```

## Component Breakdown

### Triggers
- **Continuous Integration**: Automatic on push to main, develop, feature/*
- **Pull Requests**: Automatic on PR to main or develop
- **Manual**: Can be triggered manually from Azure DevOps UI
- **Scheduled**: Can be configured for nightly builds (optional)

### Agents
- **Type**: Microsoft-hosted agents
- **Image**: ubuntu-latest
- **Runtime**: Node.js 18.x
- **Can Switch To**: Self-hosted agents if needed

### Build Stage
**Backend Job**:
1. Checkout code
2. Install Node.js 18
3. Cache npm dependencies
4. Install dependencies (`npm ci`)
5. Generate Prisma client
6. Run ESLint
7. Copy files to staging directory
8. Publish artifact

**Frontend Job**:
1. Checkout code
2. Install Node.js 18
3. Cache npm dependencies
4. Install dependencies (`npm ci`)
5. Build with Vite
6. Copy dist folder
7. Publish artifact

**Runs in parallel** to save time!

### Test Stage
**Backend Tests**:
1. Start PostgreSQL service (container)
2. Checkout code
3. Install Node.js and dependencies
4. Generate Prisma client
5. Run Jest tests with coverage
6. Publish test results (JUnit format)
7. Publish code coverage (Cobertura format)

**Dependencies**: Requires Build stage to succeed

### Deploy Stages

#### Development Environment
- **Trigger**: Automatic on develop branch
- **Target**: studyhub-backend-dev, studyhub-frontend-dev
- **Purpose**: Feature testing and development
- **Approval**: None required

#### Staging Environment
- **Trigger**: Automatic on main branch
- **Target**: studyhub-backend-staging, studyhub-frontend-staging
- **Purpose**: Pre-production testing
- **Approval**: None required
- **Dependencies**: Test stage must succeed

#### Production Environment
- **Trigger**: After successful staging deployment
- **Target**: studyhub-backend-prod, studyhub-frontend-prod
- **Purpose**: Live application
- **Approval**: ⚠️ Manual approval required
- **Dependencies**: Staging deployment must succeed

## Artifacts

### Backend Artifact (backend-app)
Contains:
- All source code (`src/`)
- Configuration files
- `package.json` and `package-lock.json`
- Prisma schema and migrations
- Generated Prisma client

Excludes:
- `node_modules/`
- `tests/`
- `coverage/`

### Frontend Artifact (frontend-app)
Contains:
- Compiled production build (`dist/`)
- All static assets
- Optimized JavaScript bundles
- CSS files
- HTML entry point

## Variables

### Build Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `nodeVersion` | Node.js version | 18.x |
| `buildConfiguration` | Build mode | Release |
| `backendArtifactName` | Backend artifact name | backend-app |
| `frontendArtifactName` | Frontend artifact name | frontend-app |

### Environment Variables (Secrets)
| Variable | Type | Usage |
|----------|------|-------|
| `DATABASE_URL` | Secret | PostgreSQL connection string |
| `JWT_SECRET` | Secret | Token signing secret |
| `AZURE_STORAGE_CONNECTION_STRING` | Secret | Azure Blob Storage |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_*` | Secret | Static Web Apps deployment |

### Environment Names
| Environment | Variable | Branch Trigger |
|-------------|----------|----------------|
| Development | `devEnvironment` | develop |
| Staging | `stagingEnvironment` | main |
| Production | `productionEnvironment` | main + approval |

## Conditions and Dependencies

### Stage Dependencies
```
Build → Test → Deploy Dev (if develop)
                    ↓
Build → Test → Deploy Staging (if main)
                    ↓
               Deploy Production (if approved)
```

### Branch Conditions
- **Deploy to Development**: `eq(variables['Build.SourceBranch'], 'refs/heads/develop')`
- **Deploy to Staging**: `eq(variables['Build.SourceBranch'], 'refs/heads/main')`
- **Deploy to Production**: Depends on Staging + manual approval

### Success Conditions
Each stage requires:
- Previous stage: `dependsOn: PreviousStage`
- Success condition: `condition: succeeded()`

## Security Features

1. **Secrets Management**
   - All sensitive data stored as pipeline variables
   - Can be linked to Azure Key Vault
   - Never committed to source code

2. **Manual Approvals**
   - Production requires human approval
   - Prevents accidental deployments
   - Audit trail maintained

3. **Environment Protection**
   - Each environment can have custom checks
   - Branch restrictions
   - Approval policies

4. **Service Connections**
   - Azure connections use service principals
   - Limited scope and permissions
   - Regularly rotated credentials

## Monitoring and Notifications

### Available Metrics
- Build duration
- Test pass rate
- Code coverage percentage
- Deployment success rate
- Pipeline failure frequency

### Notification Events
- Build completed/failed
- Tests failed
- Deployment started/completed/failed
- Approval pending
- Artifact published

## Troubleshooting Guide

### Common Issues

| Issue | Solution |
|-------|----------|
| Pipeline not triggering | Check trigger configuration and branch names |
| Build fails on dependencies | Clear cache, verify package-lock.json |
| Tests fail in pipeline | Check PostgreSQL service, environment variables |
| Deployment fails | Verify service connection, check Azure resources exist |
| Artifact not found | Check build stage succeeded, artifact name matches |
| Manual approval timeout | Increase timeout in environment settings |

## Best Practices Applied

✅ **Parallel Execution**: Backend and frontend build simultaneously
✅ **Caching**: npm dependencies cached to speed up builds
✅ **Fail Fast**: Tests run before any deployments
✅ **Immutable Artifacts**: Same artifact deployed to all environments
✅ **Environment Parity**: Same configuration structure across environments
✅ **Manual Gates**: Production requires human approval
✅ **Audit Trail**: All deployments logged and traceable
✅ **Rollback Capability**: Artifacts retained for rollback if needed

## Metrics and KPIs

Track these metrics for pipeline health:

1. **Build Time**: Target < 10 minutes
2. **Test Pass Rate**: Target > 95%
3. **Code Coverage**: Target > 80%
4. **Deployment Frequency**: Track per environment
5. **Mean Time to Recovery (MTTR)**: Time to fix failed deployments
6. **Change Failure Rate**: Percentage of deployments causing issues

## Future Enhancements

Potential improvements:
- [ ] Integration tests stage
- [ ] Performance testing
- [ ] Security scanning (SAST/DAST)
- [ ] Database migration verification
- [ ] Automated rollback on failure
- [ ] Blue-green deployment for zero downtime
- [ ] Canary deployments
- [ ] Feature flags integration
