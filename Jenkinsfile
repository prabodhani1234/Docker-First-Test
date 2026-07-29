pipeline {
    agent any 
    
    stages { 
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'master', url: 'https://github.com/prabodhani1234/Docker-First-Test'
                }
            }
        }
        stage('Build Docker Image') {
            steps {  
                bat 'docker build -t prabodhanih/dockerfirst-app:%BUILD_NUMBER% .'
            }
        }
        stage('Login to Docker Hub') {
            steps {
                withCredentials([string(credentialsId: 'docker-hub-pass', variable: 'test-dockerhubpass')]) {
                    script {
                        bat "docker login -u prabodhanih -p %docker-hub-pass%"
                    }
                }
            }
        }
        stage('Push Image') {
            steps {
                bat 'docker push prabodhanih/dockerfirst-app:%BUILD_NUMBER%'
            }
        }
    }
    post {
        always {
            bat 'docker logout'
        }
    }
}