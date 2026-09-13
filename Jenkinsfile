pipeline {
    agent any

    environment {
         BACKEND_IMAGE  = "prabodhanih/first-jenkins-backend"
        FRONTEND_IMAGE = "prabodhanih/first-jenkins-client"
        
        COMPOSE_FILE = 'docker-compose.yml'

        UBUNTU_HOST = "192.168.8.105"
        UBUNTU_USER = "vboxuser"

        DEPLOY_DIR = "/home/vboxuser/first-jenkins"
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
                bat "docker-compose -f ${COMPOSE_FILE} build --pull"
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

        stage('Prepare Ubuntu') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "mkdir -p ${DEPLOY_DIR}"
                    """
                }
            }
        }

       stage('Copy Compose File') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                        scp -o StrictHostKeyChecking=no docker-compose.yml ${UBUNTU_USER}@${UBUNTU_HOST}:${DEPLOY_DIR}/docker-compose.yml
                    """
                }
            }
        }

        stage('Deploy to Ubuntu') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "docker --version"
                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "docker compose version"

                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "docker pull ${BACKEND_IMAGE}:${BUILD_NUMBER}"
                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "docker pull ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "docker pull mongo:latest"
                    """
                }
            }
        }

        stage('Run Application in Ubuntu') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "cd ${DEPLOY_DIR} && BACKEND_IMAGE=${BACKEND_IMAGE} FRONTEND_IMAGE=${FRONTEND_IMAGE} IMAGE_TAG=${BUILD_NUMBER} docker compose -f docker-compose.prod.yml up -d"
                    """
                }
            }
        }

        stage('Check Containers') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "docker ps"
                    """
                }
            }
        }
    }

    post {

        success {
            echo "Deployment completed successfully!"
            echo "Frontend: http://${UBUNTU_HOST}:5173"
            echo "Backend:  http://${UBUNTU_HOST}:5000"
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
