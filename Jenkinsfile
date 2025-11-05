// Jenkinsfile pour le frontend

pipeline {
  agent any

  environment {
    DOCKER_REGISTRY = 'abidhamza'
    IMAGE_NAME = "${DOCKER_REGISTRY}/job-tracker-frontend"
    KUBECONFIG_CREDENTIAL_ID = 'kubeconfig-credentials'
  }

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/hamzaabidabid/job-tracker-frontend.git'
      }
    }

    // L'étape de build est différente pour un projet Node.js
    stage('Build') {
      steps {
        script {
          def nodeImage = docker.image('node:18-alpine')
          nodeImage.inside {
            sh 'npm install'
            sh 'npm run build'
          }
        }
      }
    }

    stage('Build & Push Docker Image') {
      steps {
        script {
          def imageTag = "v1.${BUILD_NUMBER}"
          def dockerImage = docker.build(IMAGE_NAME + ":${imageTag}", '.')

          docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
            dockerImage.push()
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          def imageTag = "v1.${BUILD_NUMBER}"
          withCredentials([file(credentialsId: KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG')]) {
            sh "sed -i 's|image: .*|image: ${IMAGE_NAME}:${imageTag}|' k8s/frontend.yml"
            sh "kubectl apply -f k8s/frontend.yml"
            sh "kubectl rollout status deployment/frontend-deployment"
          }
        }
      }
    }
  }
}
