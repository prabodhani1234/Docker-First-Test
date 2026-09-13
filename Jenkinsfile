pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "prabodhanih/first-jenkins-backend"
        FRONTEND_IMAGE = "prabodhanih/first-jenkins-client"

        COMPOSE_FILE = "docker-compose.yml"

        DOCKER_CREDENTIALS = "jenkins-docker-first"

        WSL_DISTRO = "Ubuntu"
    }

    stages {
        stage('SCM Checkout') {
            steps {
                retry(3) {
                    git branch: 'master',
                        url: 'https://github.com/prabodhani1234/Docker-First-Test.git'
                }
            }
        }

        stage('Check Docker') {
            steps {
                bat 'docker --version'
                bat 'docker-compose --version'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                    bat "docker-compose -f ${COMPOSE_FILE} build --pull"
                '''
            }
        }

        stage('Show Docker Images') {
            steps {
                bat 'docker images'
            }
        }

        stage('Tag Images') {
            steps {
                bat '''
                    docker tag first-jenkins-backend:latest %BACKEND_IMAGE%:%BUILD_NUMBER%
                    docker tag first-jenkins-client:latest %FRONTEND_IMAGE%:%BUILD_NUMBER%

                    docker tag first-jenkins-backend:latest %BACKEND_IMAGE%:latest
                    docker tag first-jenkins-client:latest %FRONTEND_IMAGE%:latest
                '''
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'jenkins-docker-first', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    bat 'docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%'
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                bat '''
                    docker push %BACKEND_IMAGE%:%BUILD_NUMBER%
                    docker push %BACKEND_IMAGE%:latest

                    docker push %FRONTEND_IMAGE%:%BUILD_NUMBER%
                    docker push %FRONTEND_IMAGE%:latest
                '''
            }
        }

        stage('Prepare WSL') {
            steps {
                bat '''
                    wsl -d %WSL_DISTRO% -- bash -lc "mkdir -p /home/%USERNAME%/first-jenkins"
                '''
            }
        }

        stage('Deploy to WSL') {
            steps {

                bat '''
                    echo ========================================
                    echo Deploying to WSL
                    echo ========================================

                    wsl -d %WSL_DISTRO% -- bash -lc "docker --version"
                    wsl -d %WSL_DISTRO% -- bash -lc "docker compose version"

                    wsl -d %WSL_DISTRO% -- bash -lc "docker pull %BACKEND_IMAGE%:%BUILD_NUMBER%"
                    wsl -d %WSL_DISTRO% -- bash -lc "docker pull %FRONTEND_IMAGE%:%BUILD_NUMBER%"
                    wsl -d %WSL_DISTRO% -- bash -lc "docker pull mongo:latest"
                '''
            }
        }

        stage('Run Application in WSL') {
            steps {

                bat '''
                    echo ========================================
                    echo Starting application in WSL
                    echo ========================================

                    wsl -d %WSL_DISTRO% -- bash -lc "cd /mnt/c/ProgramData/Jenkins/.jenkins/workspace/first-jenkins && BACKEND_IMAGE=%BACKEND_IMAGE% FRONTEND_IMAGE=%FRONTEND_IMAGE% IMAGE_TAG=%BUILD_NUMBER% docker compose -f %COMPOSE_FILE% up -d"
                '''
            }
        }

        stage('Check Containers') {
            steps {
                bat '''
                    echo ========================================
                    echo Running Containers
                    echo ========================================

                    wsl -d %WSL_DISTRO% -- bash -lc "docker ps"
                '''
            }
        }
    }

    post {

        success {
            echo "Deployment completed successfully!"
            echo "Frontend: http://localhost:5173"
            echo "Backend:  http://localhost:5000"
        }

        failure {
            echo "Jenkins pipeline failed."
        }

        always {
            bat '''
                docker logout
            '''
        }
    }
}
