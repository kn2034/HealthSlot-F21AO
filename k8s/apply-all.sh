#!/bin/bash

# Exit on any error
set -e

echo "Creating namespaces..."
kubectl apply -f namespaces.yaml

echo "Creating monitoring namespace..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

echo "Applying ConfigMaps..."
kubectl apply -f staging/configmap.yaml
kubectl apply -f production/configmap.yaml

echo "Applying Network Policies..."
kubectl apply -f staging/network-policies.yaml
kubectl apply -f production/network-policies.yaml

echo "Setting up MongoDB..."
kubectl apply -f staging/mongodb.yaml
kubectl apply -f production/mongodb.yaml

echo "Deploying applications..."
kubectl apply -f staging/app-deployment.yaml
kubectl apply -f production/app-deployment.yaml

echo "Configuring HPA..."
kubectl apply -f staging/hpa.yaml
kubectl apply -f production/hpa.yaml

echo "Setting up monitoring..."
kubectl apply -f monitoring/service-monitor.yaml

echo "Waiting for MongoDB deployments..."
kubectl rollout status deployment/mongodb-staging -n staging
kubectl rollout status statefulset/mongodb-production -n production

echo "Waiting for application deployments..."
kubectl rollout status deployment/healthslot-staging -n staging
kubectl rollout status deployment/healthslot-production -n production

echo "All configurations applied successfully!" 