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
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'jenkins-docker-first',
                    usernameVariable: 'UserName',
                    passwordVariable: 'PassWord'
                )]) {
                    bat 'echo %PassWord%| docker login -u %UserName% --password-stdin'
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