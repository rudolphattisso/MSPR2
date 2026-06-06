pipeline {
    agent any

    tools {
        // Requiert le plugin NodeJS dans Jenkins + un outil nommé 'node-20' configuré
        // Jenkins > Manage Jenkins > Tools > NodeJS installations
        nodejs 'node-20'
    }

    stages {

        stage('Install') {
            steps {
                dir('backend-pays') {
                    sh 'npm ci'
                }
                dir('app-siege') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('backend-pays') {
                    sh 'npm run lint'
                }
                dir('app-siege') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Test') {
            steps {
                // Placeholder — tests réels ajoutés au Bloc 9
                echo 'Tests à venir — Bloc 9'
            }
        }

        stage('Build') {
            steps {
                dir('backend-pays') {
                    sh 'npm run build'
                }
                dir('app-siege') {
                    sh 'npm run build'
                }
            }
        }

    }

    post {
        success {
            echo 'Pipeline terminé avec succès.'
        }
        failure {
            echo 'Pipeline en échec — consulter les logs ci-dessus.'
        }
    }
}
