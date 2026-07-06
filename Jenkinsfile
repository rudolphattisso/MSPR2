pipeline {
    agent any

    tools {
        // Requiert le plugin NodeJS dans Jenkins + un outil nommé 'node-20' configuré
        // Jenkins > Manage Jenkins > Tools > NodeJS installations
        nodejs 'node-20'
    }

    // Prérequis agent : Docker + Docker Compose disponibles (base de test + packaging).
    options {
        timestamps()
    }

    stages {

        stage('Install') {
            steps {
                // npm install (et non ci) : tolère l'écart de résolution entre versions de npm.
                dir('backend-pays') { sh 'npm install --no-audit --no-fund' }
                dir('app-siege')    { sh 'npm install --no-audit --no-fund' }
            }
        }

        stage('Lint') {
            steps {
                dir('backend-pays') { sh 'npm run lint' }
                dir('app-siege')    { sh 'npm run lint' }
            }
        }

        stage('Base de test') {
            steps {
                // Base Postgres dédiée aux tests (port 5433), isolée des données de démo.
                sh 'docker compose up -d db-test'
                sh '''
                  for i in $(seq 1 30); do
                    docker exec futurekawa-db-test pg_isready -U futurekawa && exit 0
                    sleep 2
                  done
                  echo "db-test n'est pas prête" && exit 1
                '''
            }
        }

        stage('Tests + Couverture') {
            steps {
                // Le seuil de 80% est enforced dans vitest.config → le stage échoue si non atteint.
                dir('backend-pays') { sh 'npm run coverage' }
                dir('app-siege')    { sh 'npm run coverage' }
            }
        }

        stage('Build') {
            steps {
                dir('backend-pays') { sh 'npm run build' }
                dir('app-siege')    { sh 'npm run build' }
            }
        }

        stage('Packaging Docker') {
            steps {
                // Construit les images de production (artefacts déployables pour la démo).
                sh 'docker compose build backend-pays app-siege'
            }
        }

    }

    post {
        always {
            // Libère la base de test et publie les rapports de couverture (preuve d'exécution).
            sh 'docker compose stop db-test || true'
            archiveArtifacts artifacts: 'backend-pays/coverage/**, app-siege/coverage/**', allowEmptyArchive: true
        }
        success {
            echo 'Pipeline terminé avec succès.'
        }
        failure {
            echo 'Pipeline en échec — consulter les logs ci-dessus.'
        }
    }
}
