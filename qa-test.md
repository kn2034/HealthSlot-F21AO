# QA Test File

This file is created to test the Jenkins CI/CD pipeline integration with the qa branch.

## Test Details

- **Date**: March 21, 2025
- **Purpose**: Verify that commits to the qa branch trigger the Jenkins pipeline
- **Expected Outcome**: Automatic execution of the CI/CD pipeline on the qa branch

## CI/CD Pipeline Stages

1. Setup
2. Lint
3. Test
4. QA
5. Build Docker Image
6. Deploy to Staging (for qa and develop branches)
7. Deploy to Production (for main branch only, with manual approval) 