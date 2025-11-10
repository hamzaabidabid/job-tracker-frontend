// Jenkinsfile pour le frontend (Angular)

pipeline {
  // On exécute toutes les étapes sur l'agent Jenkins principal, qui a accès à Docker et kubectl.
  agent any

  environment {
    DOCKER_REGISTRY = 'abidhamza'
    IMAGE_NAME = "${DOCKER_REGISTRY}/job-tracker-frontend"

    // --- CONFIGURATION KUBERNETES ---
    // Assurez-vous que cette IP est correcte (résultat de 'minikube ip')
    KUBERNETES_SERVER_URL = 'https://192.168.49.2:8443'
    // On réutilise le même token que pour le backend
    KUBERNETES_TOKEN_CREDENTIAL_ID = 'kubernetes-token'
    // ------------------------------------
  }

  stages {
    // ======================================================
    // Étape 1 : Récupérer le code source
    // ======================================================
    stage('Checkout') {
      steps {
        // Nettoie l'espace de travail avant de cloner
        cleanWs()
        // Clone le dépôt du frontend
        git url: 'https://github.com/hamzaabidabid/job-tracker-frontend.git', branch: 'master'
      }
    }

    // ======================================================
    // Étape 2 : Construire l'application Angular (Phase CI)
    // ======================================================
    stage('Build Angular App') {
      // On exécute le build Node.js à l'intérieur d'un conteneur Docker dédié.
      // C'est propre et évite d'installer Node.js sur Jenkins.
      agent {
        docker {
          image 'node:18-alpine'
        }
      }
      steps {
        echo "--- Installing dependencies ---"
        sh 'npm install'

        echo "--- Building application ---"
        sh 'npm run build'
      }
    }

    // ======================================================
    // Étape 3 : Construire et Pousser l'Image Docker
    // ======================================================
    stage('Build & Push Docker Image') {
      steps {
        script {
          // On génère un tag unique pour chaque build
          def imageTag = "v1.${BUILD_NUMBER}"

          echo "--- Building Docker image: ${IMAGE_NAME}:${imageTag} ---"
          def dockerImage = docker.build(IMAGE_NAME + ":${imageTag}", '.')

          echo "--- Pushing Docker image to Docker Hub ---"
          docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
            dockerImage.push()
          }
        }
      }
    }

    // ======================================================
    // Étape 4 : Déployer sur Kubernetes (Phase CD)
    // ======================================================
    stage('Deploy to Kubernetes') {
      steps {
        script {
          def imageTag = "v1.${BUILD_NUMBER}"

          // On utilise le token pour s'authentifier auprès de Kubernetes
          withCredentials([string(credentialsId: KUBERNETES_TOKEN_CREDENTIAL_ID, variable: 'KUBERNETES_TOKEN')]) {
            sh '''
                            # On configure kubectl à la volée
                            kubectl config set-cluster minikube --server=${KUBERNETES_SERVER_URL} --insecure-skip-tls-verify=true
                            kubectl config set-credentials jenkins-agent --token=${KUBERNETES_TOKEN}
                            kubectl config set-context jenkins-context --cluster=minikube --user=jenkins-agent
                            kubectl config use-context jenkins-context

                            echo "--- Applying Kubernetes manifests ---"
                            # Applique la configuration de base (Service, Ingress, etc.)
                            kubectl apply -f k8s/frontend.yml
                            kubectl apply -f k8s/ingress.yml

                            echo "--- Updating deployment image ---"
                            # Met à jour l'image du déploiement avec le nouveau tag
                            kubectl set image deployment/frontend-deployment frontend-app=${IMAGE_NAME}:${imageTag}

                            echo "--- Waiting for deployment to complete ---"
                            # Attend que la mise à jour soit terminée
                            kubectl rollout status deployment/frontend-deployment
                        '''
          }
        }
      }
    }
  }

  // Options pour nettoyer l'espace de travail à la fin du build
  post {
    always {
      cleanWs()
    }
  }
}
