// Webhook test 2 - Testing automatic trigger
// Webhook test - This comment is to verify GitHub webhook integration
pipeline {
    agent any
    
    triggers {
        githubPush()
    }
    
    environment {
        DOCKER_IMAGE = 'healthslot-app'
        DOCKER_TAG = 'latest'
        JIRA_PROJECT = 'HEALTHSLOT'
        NODE_VERSION = '18'
    }
    
    tools {
        nodejs 'NodeJS'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Security Scan') {
            when {
                expression {
                    return env.SNYK_TOKEN != null
                }
            }
            steps {
                script {
                    try {
                        withCredentials([string(credentialsId: 'snyk-token', variable: 'SNYK_TOKEN', optional: true)]) {
                            if (env.SNYK_TOKEN) {
                                sh '''
                                    npm install -g snyk
                                    snyk auth $SNYK_TOKEN
                                    snyk test || true
                                    snyk container test || true
                                '''
                            } else {
                                echo "Skipping Snyk security scan due to missing credentials"
                            }
                        }
                    } catch (err) {
                        echo "Error during security scan: ${err.message}"
                        // Continue pipeline even if security scan fails
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Lint') {
            steps {
                nodejs(nodeJSInstallationName: 'NodeJS') {
                    sh 'npm run lint'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    
                    // Run Trivy scan if available
                    try {
                        sh "trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    } catch (err) {
                        echo "Trivy scan skipped: ${err.message}"
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                script {
                    // Check if .env.staging exists before trying to read it
                    if (fileExists('.env.staging')) {
                        def envFile = readFile('.env.staging').trim()
                        envFile.split('\n').each { line ->
                            if (line.trim() && !line.startsWith('#')) {
                                def (key, value) = line.split('=', 2)
                                if (key && value) {
                                    env."${key}" = value
                                }
                            }
                        }
                    } else {
                        echo "Warning: .env.staging file not found. Using default configuration."
                    }
                    
                    sh '''
                        # Stop all running containers that might conflict
                        docker ps -q --filter "name=healthslot-" | xargs -r docker stop || true
                        docker ps -aq --filter "name=healthslot-" | xargs -r docker rm -f || true
                        
                        # Remove all volumes
                        docker volume ls -q --filter "name=healthslot" | xargs -r docker volume rm || true
                        
                        # Remove network if exists
                        docker network rm healthslot-pipeline2_healthslot-network || true
                        
                        # Start MongoDB
                        docker-compose -f docker-compose.staging.yml up -d mongodb || true
                        echo "Waiting for MongoDB to be healthy..."
                        sleep 20
                        
                        # Start the application
                        docker-compose -f docker-compose.staging.yml up -d app
                        echo "Application deployment completed"
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
        always {
            node('built-in') {
                script {
                    cleanWs()
                    archiveArtifacts artifacts: '**/coverage/**/*', allowEmptyArchive: true
                }
            }
        }
    }
}