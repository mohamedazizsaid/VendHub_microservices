# Complete CI/CD Setup

This repository now includes:

- GitHub Actions CI (`.github/workflows/ci.yml`)
- GitHub Actions Docker build/push (`.github/workflows/docker.yml`)
- GitHub Actions Kubernetes deployment (`.github/workflows/k8s-deploy.yml`)
- Docker compose full stack (`docker-compose.cicd.yml`)
- Kubernetes manifests (`k8s/infra`, `k8s/services`, `k8s/observability`)
- SonarQube config (`sonar-project.properties`)
- Prometheus + Grafana provisioning (`monitoring/`)

## 1) GitHub Secrets Required

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `SONAR_TOKEN`
- `SONAR_HOST_URL` (example: `http://<your-sonarqube-host>:9000`)

## 2) Local Full Stack with Docker Compose

```bash
docker compose -f docker-compose.cicd.yml up -d --build
```

Main endpoints:
- Frontend: http://localhost:5173
- Gateway: http://localhost:8085
- SonarQube: http://localhost:9000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## 3) CI Pipeline

On push/PR to `main`/`master`, `ci.yml` runs:
- Maven build for all Spring services
- Node build for events + frontend
- Optional Sonar analysis if secrets are configured

## 4) Docker Publish Pipeline

`docker.yml` builds and pushes all service images to Docker Hub.

## 5) Kubernetes Deploy Pipeline

`k8s-deploy.yml` is `workflow_dispatch` and targets a self-hosted runner with `kubectl` + `minikube` context.

Detailed minikube deployment steps: `k8s/README.md`
