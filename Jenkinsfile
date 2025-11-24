pipeline {
    agent any

    stages {

        stage('Inject Client .env') {
            steps {
                echo "Injecting client environment variables..."
                withCredentials([file(credentialsId: 'Client_env', variable: 'CLIENT_ENV')]) {
                    sh "cp $CLIENT_ENV Client/.env"
                }
            }
        }

        stage('Inject Server .env') {
            steps {
                echo "Injecting backend environment variables..."
                withCredentials([file(credentialsId: 'Server_env', variable: 'SERVER_ENV')]) {
                    sh "cp $SERVER_ENV Server/.env"
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Building Docker images..."
                sh "docker compose build"
            }
        }

        stage('Deploy Containers') {
            steps {
                echo "Starting new containers..."
                sh "docker compose down && docker compose up -d"
            }
        }
    }

}
