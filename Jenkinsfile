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
        //stage('Prepare Ubuntu') {
         //   steps {
         //       withCredentials([
           //         sshUserPrivateKey(
           //             credentialsId: 'Ubuntu-jenkins',
             //           keyFileVariable: 'SSH_KEY',
               //         usernameVariable: 'SSH_USER'
                 //   )
                //]) 
                //{
                  //  bat """
                    //ssh ${UBUNTU_USER}@${UBUNTU_HOST} "mkdir -p ${DEPLOY_DIR}"
                   // """
               // }
           // }
       // }

       stage('Copy Compose File') {
            steps {
                withCredentials([
                        sshUserPrivateKey(
                            credentialsId: 'Ubuntu-jenkins',
                            keyFileVariable: 'SSH_KEY',
                            usernameVariable: 'SSH_USER'
                        )
                    ])  {
                    bat """
                    scp -o StrictHostKeyChecking=no docker-compose.yml ${UBUNTU_USER}@${UBUNTU_HOST}:${DEPLOY_DIR}/docker-compose.yml
                    """
                }
            }
        }
        
        stage('Deploy to Ubuntu') {
            steps {
                sshagent(['Ubuntu-jenkins']) {
                    bat """
                    ssh -o StrictHostKeyChecking=no ${UBUNTU_USER}@${UBUNTU_HOST} "cd ${DEPLOY_DIR} && set IMAGE_TAG=%BUILD_NUMBER% && docker compose pull && docker compose up -d"
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                sshagent(['Ubuntu-jenkins']) {
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
