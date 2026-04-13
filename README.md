# VendHub Microservices Platform

Professional monorepo for an e-commerce platform built with Spring Boot, Node.js/NestJS, React, Docker, and Kubernetes.

## Overview

This repository contains:
- Core business microservices (auth, products, orders, forum, reclamation, events)
- API Gateway and Eureka service discovery
- Frontend web application
- Full local infrastructure with Docker Compose
- CI/CD pipelines with GitHub Actions
- Kubernetes manifests for deployment
- Observability stack (Prometheus + Grafana)

## Architecture

Main runtime components:
- `eureka` (service discovery)
- `gateway` (API Gateway + Keyloack resource server)
- `microservice_authentification`
- `microservice_products`
- `microservice_Commande`
- `microservice_forum`
- `microservice_reclamation`
- `microservice_events` (Node.js)
- `frontend` (React + Nginx)

Supporting infrastructure:
- MySQL, MongoDB, RabbitMQ, Keycloak
- SonarQube + PostgreSQL
- Prometheus + Grafana

## Repository Structure

- `.github/workflows/` -> CI/CD pipelines
- `docker-compose.cicd.yml` -> full local stack
- `k8s/` -> Kubernetes manifests
- `monitoring/` -> Prometheus/Grafana provisioning
- `E-Commerce Platform Template/` -> frontend app
- `microservice_*` -> domain services

## Prerequisites

- Docker + Docker Compose
- Java 17
- Node.js 20+
- Maven 3.9+
- (Optional) kubectl + minikube for local K8s deployment

## Quick Start (Local Full Stack)

Run the full platform:

```bash
docker compose -f docker-compose.cicd.yml up -d --build
```

Stop everything:

```bash
docker compose -f docker-compose.cicd.yml down
```

## Main Endpoints

- Frontend: `http://localhost:5173`
- Gateway: `http://localhost:8085`
- Eureka: `http://localhost:8761`
- Keycloak: `http://localhost:8181`
- SonarQube: `http://localhost:9000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
- RabbitMQ Management: `http://localhost:15672`

## CI/CD Pipelines

### 1) CI (`.github/workflows/ci.yml`)
Triggered on push/PR to `main` and `master`.

- Java services build with Maven (`-DskipTests`)
- Node services build (`npm ci`, `npm run build`)

### 2) Docker Build & Push (`.github/workflows/docker.yml`)
Triggered on push and manual dispatch.

- Builds all service images
- Pushes tags to Docker Hub: `${DOCKERHUB_USERNAME}/{service}:latest`
- Uses GitHub Actions cache for Docker layers

### 3) Kubernetes Deploy (`.github/workflows/k8s-deploy.yml`)
Triggered after successful Docker workflow (or manual dispatch).

- Runs on `self-hosted` runner
- Applies manifests in namespace `micro-platform`
- Waits for rollout status of all deployments

## Required GitHub Secrets

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `SONAR_TOKEN` (if Sonar analysis enabled)
- `SONAR_HOST_URL`

## Kubernetes Deployment

Use the workflow `Kubernetes Deploy` after Docker images are available.

For local Minikube usage, ensure:
- Runner has `kubectl` installed
- Minikube context is accessible from the runner host

Detailed manifests and usage are under `k8s/`.

## Troubleshooting

### Docker Hub rate limit (`429 Too Many Requests`)

If image pull/build fails with rate-limit errors:
- Verify Docker Hub secrets are valid
- Wait for Docker Hub limit window reset
- Retry the workflow from GitHub Actions

### Frontend Docker build fails

Ensure frontend `.dockerignore` excludes `node_modules` to avoid cross-platform binary issues.

### Spring Cloud / Actuator issues

If startup fails due to missing actuator classes, verify `spring-boot-starter-actuator` is present in affected services.

## Notes

- Keep service names lowercase for Docker image tags.
- Use small, descriptive commit messages to track CI/CD changes.
- Prefer `main` for release-ready pipeline runs.
