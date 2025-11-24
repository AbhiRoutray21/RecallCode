pipeline {
    agent any

    stages {
        stage('Test Git Pull') {
            steps {
                echo "If you see this message, Jenkins successfully pulled the code."
                sh "ls -la"
                sh "git log -1 --oneline || true"
            }
        }
    }
}
