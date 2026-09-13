pipeline {
    agent any 
    
    environment {
        BACKEND_IMAGE  = "prabodhanih/first-jenkins-backend"
        FRONTEND_IMAGE = "prabodhanih/first-jenkins-client"
        COMPOSE_FILE = 'docker-compose.yml'

        UBUNTU_HOST = "192.168.8.105"
        UBUNTU_USER = "vboxuser"

        // GitHub
        //GIT_REPO = "https://github.com/dhani1234/Docker-First-Test"
        //GIT_BRANCH = "master"

        // Deployment directory on Ubuntu
        DEPLOY_DIR = "/home/vboxuser/first-jenkins"
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
                bat "docker tag first-jenkins-backend:latest %BACKEND_IMAGE%:%BUILD_NUMBER%"
                bat "docker tag first-jenkins-client:latest %FRONTEND_IMAGE%:%BUILD_NUMBER%"
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

        // new step for separately copy image to ubuntu side
        stage('Pull Mongo Image') {
            steps {
                bat "docker pull mongo:latest"
            }
        }
        
        stage('Save Images') {
            steps {
                bat "docker save -o mongo.tar mongo:latest"
                bat "docker save -o backend-%BUILD_NUMBER%.tar %BACKEND_IMAGE%:%BUILD_NUMBER%"
                bat "docker save -o frontend-%BUILD_NUMBER%.tar %FRONTEND_IMAGE%:%BUILD_NUMBER%"
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
        
        stage('Copy Images to Ubuntu') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat "scp mongo.tar %UBUNTU_USER%@%UBUNTU_HOST%:%DEPLOY_DIR%/"
                    bat "scp backend-%BUILD_NUMBER%.tar %UBUNTU_USER%@%UBUNTU_HOST%:${DEPLOY_DIR}/"
                    bat "scp frontend-%BUILD_NUMBER%.tar %UBUNTU_USER%@%UBUNTU_HOST%:${DEPLOY_DIR}/"
                }
            }
        }
        
        stage('Load Images') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                       ssh %UBUNTU_USER%@%UBUNTU_HOST% "docker load -i %DEPLOY_DIR%/mongo.tar && docker load -i ${DEPLOY_DIR}/backend-%BUILD_NUMBER%.tar && docker load -i ${DEPLOY_DIR}/frontend-%BUILD_NUMBER%.tar"
                    """
                }
            }
        }
        
        stage('Create Docker Network') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                       ssh %UBUNTU_USER%@%UBUNTU_HOST% "docker network inspect app-network >/dev/null 2>&1 || docker network create app-network"
                    """
                }
            }
        }
        
        stage('Run MongoDB') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                       ssh %UBUNTU_USER%@%UBUNTU_HOST% "docker rm -f mongo >/dev/null 2>&1 || true; docker run -d --name mongo --network app-network --restart unless-stopped -p 27017:27017 -v mongo_data:/data/db mongo:latest"
                    """
                }
            }
        }
        
        stage('Run Containers') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                        ssh %UBUNTU_USER%@%UBUNTU_HOST% "docker rm -f first-jenkins-backend first-jenkins-client >/dev/null 2>&1 || true; docker run -d --name first-jenkins-backend --network app-network --restart unless-stopped -p 5000:5000 -e MONGODB_URI=mongodb://mongo:27017/UserDb %BACKEND_IMAGE%:%BUILD_NUMBER%; docker run -d --name first-jenkins-client --network app-network --restart unless-stopped -p 5173:5173 %FRONTEND_IMAGE%:%BUILD_NUMBER%"
                    """
                }
            }
        }
        //stage('Copy Compose File') {
            //steps {
                //sshagent(['ubuntu-ssh-key']) {
                    //bat """
                       // scp -o StrictHostKeyChecking=no docker-compose.yml ${UBUNTU_USER}@${UBUNTU_HOST}:${DEPLOY_DIR}/docker-compose.yml
                    //"""
                //}
            //}
        //}
        
       //stage('Deploy to Ubuntu') {
            //steps {
                //sshagent(['ubuntu-ssh-key']) {
                    //bat """
                       // ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "cd ${DEPLOY_DIR} && export IMAGE_TAG=${BUILD_NUMBER} && docker compose pull && docker compose up -d"
                    //"""
                //}
            //}
        //}
        
        stage('Verify Deployment') {
            steps {
                sshagent(['ubuntu-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "docker ps"
                    """
                }
            }
        }
        // stage('Deploy to Ubuntu') {
        //     steps {
        //         bat """
        //         ssh ${UBUNTU_USER}@${UBUNTU_HOST} "docker pull ${BACKEND_IMAGE}:%BUILD_NUMBER% && docker pull ${FRONTEND_IMAGE}:%BUILD_NUMBER%"
        //         """
        //     }
        // }
    }
    post {
        always {
            bat 'docker logout'
        }

        success {

            echo "========================================="
            echo "Deployment Successful!"
            echo "Build Number: ${BUILD_NUMBER}"
            echo "Backend Image: ${BACKEND_IMAGE}:${BUILD_NUMBER}"
            echo "Frontend Image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
            echo "Ubuntu Server: ${UBUNTU_HOST}"
            echo "========================================="
        }

        failure {

            echo "========================================="
            echo "Deployment Failed!"
            echo "Check Jenkins console output."
            echo "========================================="
        }
    }


}
