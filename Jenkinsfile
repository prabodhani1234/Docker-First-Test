pipeline {
    agent any 
    
    environment {
        BACKEND_IMAGE  = "prabodhanih/recat_project-backend"
        FRONTEND_IMAGE = "prabodhanih/recat_project-client"
    }

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
                //bat 'docker build -t prabodhanih/dockerfirst-app:%BUILD_NUMBER% .'
                bat 'docker-compose build'
            }
        }
        stage('Login to Docker Hub') {
            steps { withCredentials([ usernamePassword( 
                credentialsId: 'jenkins-docker-first', 
                usernameVariable: 'DOCKER_USERNAME', 
                passwordVariable: 'DOCKER_PASSWORD' ) ]) { 
                    script {
                       // bat 'docker login -u prabodhanih -p %DOCKER_PASSWORD%'
                       bat 'echo %DOCKER_PASSWORD%| docker login -u %DOCKER_USERNAME% --password-stdin'
                    }
                 }
            }
        }
        stage('Push Image') {
            steps {
                bat "docker push %BACKEND_IMAGE%:%BUILD_NUMBER%"
                bat "docker push %FRONTEND_IMAGE%:%BUILD_NUMBER%"
            }
        }
    }
    post {
        always {
            bat 'docker logout'
        }
    }
}