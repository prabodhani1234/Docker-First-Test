pipeline {
    agent any 
    
    environment {
        BACKEND_IMAGE  = "prabodhanih/recat_project-backend"
        FRONTEND_IMAGE = "prabodhanih/recat_project-client"
        COMPOSE_FILE = 'docker-compose.yml'
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
                bat "docker-compose -f ${COMPOSE_FILE} build --pull"
                //bat 'docker build -t prabodhanih/dockerfirst-app:%BUILD_NUMBER% .'
                //bat 'docker compose build'
            }
        }

        stage('Tag Images') {
            steps {
                bat "docker tag %BACKEND_IMAGE%:%BUILD_NUMBER%"
                bat "docker tag %FRONTEND_IMAGE%:%BUILD_NUMBER%"
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-docker-first', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    bat 'docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%'
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
