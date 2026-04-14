# Kubernetes Deploy Guide (Minikube)

## 1) Prerequisites

- Minikube installed and running
- kubectl configured
- Docker images pushed to Docker Hub under your account

## 2) Set your Docker Hub username in manifests

Docker image names are already set to `mohamedazizsaid` in all files under `k8s/services`.

## 3) Create namespace and deploy

```bash
kubectl create namespace micro-platform --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n micro-platform -f k8s/infra/
kubectl apply -n micro-platform -f k8s/services/
kubectl apply -n micro-platform -f k8s/observability/
```

## 4) Check rollout

```bash
kubectl get pods -n micro-platform
kubectl get svc -n micro-platform
```

## 5) Access services

```bash
minikube service frontend -n micro-platform --url
minikube service sonarqube -n micro-platform --url
minikube service prometheus -n micro-platform --url
minikube service grafana -n micro-platform --url
```

Expected ports (cluster service targets):

- SonarQube: 9000
- Prometheus: 9090
- Grafana: 3000
