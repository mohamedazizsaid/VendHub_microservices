# VendHub Microservices Platform

<p align="center">
	<img src="https://img.shields.io/badge/Architecture-Microservices-0A66C2?style=for-the-badge" alt="Architecture"/>
	<img src="https://img.shields.io/badge/Backend-Spring%20Boot%20%2B%20NestJS-1F883D?style=for-the-badge" alt="Backend"/>
	<img src="https://img.shields.io/badge/Frontend-React-087EA4?style=for-the-badge" alt="Frontend"/>
	<img src="https://img.shields.io/badge/Deployment-Docker%20%2B%20Kubernetes-326CE5?style=for-the-badge" alt="Deployment"/>
</p>

<p align="center">
	<img src="https://img.shields.io/github/actions/workflow/status/mohamedazizsaid/VendHub_microservices/ci.yml?branch=main&label=CI&style=flat-square" alt="CI"/>
	<img src="https://img.shields.io/github/actions/workflow/status/mohamedazizsaid/VendHub_microservices/docker.yml?branch=main&label=Docker&style=flat-square" alt="Docker"/>
	<img src="https://img.shields.io/github/actions/workflow/status/mohamedazizsaid/VendHub_microservices/k8s-deploy.yml?branch=main&label=K8s%20Deploy&style=flat-square" alt="K8s"/>
	<img src="https://img.shields.io/badge/Java-17-orange?style=flat-square" alt="Java 17"/>
	<img src="https://img.shields.io/badge/Node-20-339933?style=flat-square" alt="Node 20"/>
</p>

```text
__      __            _ _   _       _     
\ \    / /__ _ _   __| | | | |_  __| |__  
 \ \/\/ / -_) ' \ / _` | |_| | || | '_ \ 
	\_/\_/\___|_||_|\__,_|\___/ \_,_|_.__/ 
```

Professional monorepo for a full e-commerce ecosystem based on Spring Boot, Node.js, React, Docker, and Kubernetes.

## Project Stats

| Metric | Value |
|---|---:|
| Business services | 7 |
| Total app services (with gateway/eureka/frontend/events) | 9 |
| CI/CD workflows | 3 |
| Data/message engines | 4 (MySQL, MongoDB, RabbitMQ, Keycloak) |
| Observability components | 3 (Prometheus, Grafana, SonarQube) |

## Platform Scope

- Domain microservices: authentication, products, orders, forum, reclamation, events
- Platform services: Eureka discovery, API Gateway, React frontend
- Full DevOps stack: CI, Docker image publishing, Kubernetes deployment
- Monitoring and quality: Prometheus, Grafana, SonarQube

## High-Level Architecture

### Core Runtime
- `eureka` -> service registry
- `gateway` -> API gateway and JWT resource server
- `microservice_authentification`
- `microservice_products`
- `microservice_Commande`
- `microservice_forum`
- `microservice_reclamation`
- `microservice_events` (Node.js)
- `frontend` (React + Nginx)

### Supporting Stack
- MySQL, MongoDB, RabbitMQ, Keycloak
- SonarQube + PostgreSQL
- Prometheus + Grafana

## Repository Layout

- `.github/workflows/` -> CI/CD workflows
- `docker-compose.cicd.yml` -> full local platform orchestration
- `k8s/` -> infra, services, and observability manifests
- `monitoring/` -> Prometheus and Grafana provisioning
- `E-Commerce Platform Template/` -> frontend source and build config
- `microservice_*` -> business microservices

## Prerequisites

- Docker + Docker Compose
- Java 17
- Node.js 20+
- Maven 3.9+
- kubectl + minikube (required for self-hosted K8s deploy workflow)

## Quick Start

Start complete stack:

```bash
docker compose -f docker-compose.cicd.yml up -d --build
```

Stop stack:

```bash
docker compose -f docker-compose.cicd.yml down
```

## Service Endpoints

- Frontend: `http://localhost:5173`
- Gateway API: `http://localhost:8085`
- Eureka: `http://localhost:8761`
- Keycloak: `http://localhost:8181`
- RabbitMQ UI: `http://localhost:15672`
- SonarQube: `http://localhost:9000`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

## CI/CD

### CI (`.github/workflows/ci.yml`)
- Trigger: push/PR on `main` and `master`
- Java build: `mvn -B -DskipTests clean verify`
- Node build: `npm ci` + `npm run build`

### Docker Publish (`.github/workflows/docker.yml`)
- Trigger: push and manual dispatch
- Builds and pushes all application images
- Docker Hub tag pattern: `${DOCKERHUB_USERNAME}/{service}:latest`
- Layer caching enabled via GitHub Actions cache backend

### Kubernetes Deploy (`.github/workflows/k8s-deploy.yml`)
- Trigger: successful Docker workflow or manual dispatch
- Runner type: `self-hosted`
- Namespace: `micro-platform`
- Deployment check: rollout status for all components

## Required GitHub Secrets

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `SONAR_TOKEN` (if code quality scan is enabled)
- `SONAR_HOST_URL`

## Troubleshooting

### Docker Hub 429 Rate Limit
- Confirm Docker Hub credentials are valid in repository secrets
- Retry after Docker Hub limit window reset
- Keep cache enabled to reduce repeated pulls

### Frontend Docker Build Error
- Ensure frontend `.dockerignore` excludes `node_modules`

### Spring Boot Actuator Missing at Startup
- Ensure `spring-boot-starter-actuator` exists in affected service `pom.xml`

## Engineering Notes

- Keep Docker image names lowercase
- Prefer explicit, traceable commit messages for CI/CD changes
- Use `main` as the release-ready branch
