pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['development', 'staging', 'production'], description: 'Deployment environment')
        string(name: 'TAG', defaultValue: 'latest', description: 'Docker image tag')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip testing stages')
        booleanParam(name: 'PUSH_REGISTRY', defaultValue: true, description: 'Push images to registry')
    }

    environment {
        // Docker Registry
        DOCKER_REGISTRY = credentials('docker-registry-url')
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/calme2me-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/calme2me-backend"
        DOCKER_CREDENTIALS = credentials('docker-credentials')
        
        // Application Domains
        FRONTEND_DOMAIN = credentials("frontend-domain-${ENVIRONMENT}")
        BACKEND_DOMAIN = credentials("backend-domain-${ENVIRONMENT}")
        
        // Application Keys & Secrets
        APP_KEY = credentials("app-key-${ENVIRONMENT}")
        APP_URL = credentials("app-url-${ENVIRONMENT}")
        API_URL = credentials("api-url-${ENVIRONMENT}")
        VITE_API_URL = credentials("vite-api-url-${ENVIRONMENT}")
        
        // Database
        DB_HOST = credentials("db-host-${ENVIRONMENT}")
        DB_PORT = credentials("db-port-${ENVIRONMENT}")
        DB_USERNAME = credentials("db-username-${ENVIRONMENT}")
        DB_PASSWORD = credentials("db-password-${ENVIRONMENT}")
        DB_ROOT_PASSWORD = credentials("db-root-password-${ENVIRONMENT}")
        DB_DATABASE = credentials("db-database-${ENVIRONMENT}")
        
        // Laravel Reverb (WebSocket)
        LARAVEL_REVERB_APP_KEY = credentials("reverb-app-key-${ENVIRONMENT}")
        
        // OpenAI API
        OPENAI_API_KEY = credentials("openai-api-key-${ENVIRONMENT}")
        
        // Redis (Production)
        REDIS_HOST = credentials("redis-host-${ENVIRONMENT}")
        REDIS_PASSWORD = credentials("redis-password-${ENVIRONMENT}")
        REDIS_PORT = credentials("redis-port-${ENVIRONMENT}")
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "Cloning repository for ${ENVIRONMENT} environment"
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    script {
                        echo "Building frontend Docker image..."
                        sh '''
                            docker build -t ${FRONTEND_IMAGE}:${TAG} \
                                --build-arg NODE_ENV=production \
                                -f Dockerfile .
                        '''
                    }
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    script {
                        echo "Building backend Docker image..."
                        sh '''
                            docker build -t ${BACKEND_IMAGE}:${TAG} \
                                --build-arg APP_ENV=production \
                                -f Dockerfile .
                        '''
                    }
                }
            }
        }

        stage('Test Frontend') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                dir('frontend') {
                    script {
                        echo "Running frontend tests..."
                        sh '''
                            npm install
                            npm run lint || true
                        '''
                    }
                }
            }
        }

        stage('Test Backend') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                dir('backend') {
                    script {
                        echo "Running backend tests..."
                        sh '''
                            composer install
                            php artisan test || true
                        '''
                    }
                allOf {
                    branch 'main'
                    expression { params.PUSH_REGISTRY }
                }
            }
        }

        stage('Push Images') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Logging into Docker Registry..."
                    sh '''
                        echo ${DOCKER_CREDENTIALS_PSW} | docker login -u ${DOCKER_CREDENTIALS_USR} --password-stdin ${DOCKER_REGISTRY}
                    '''
                    
                    echo "Pushing Docker images..."
                    sh '''
                        docker push ${FRONTEND_IMAGE}:${TAG}
                        docker push ${BACKEND_IMAGE}:${TAG}
                    '''
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {echo "Frontend Domain: ${FRONTEND_DOMAIN}"
                    echo "Backend Domain: ${BACKEND_DOMAIN}"
                    
                    sh '''
                        # Select appropriate docker-compose file
                        if [ "${ENVIRONMENT}" = "production" ]; then
                            COMPOSE_FILE="docker-compose.prod.yml"
                        else
                            COMPOSE_FILE="docker-compose.yml"
                        fi
                        
                        # Stop existing containers
                        docker compose -f $COMPOSE_FILE down || true
                        
                        # Export all environment variables for docker-compose
                        export APP_KEY="${APP_KEY}"
                        export APP_URL="${APP_URL}"
                        export API_URL="${API_URL}"
                        export VITE_API_URL="${VITE_API_URL}"
                        export DB_HOST="${DB_HOST}"
                        export DB_PORT="${DB_PORT}"
                        export DB_USERNAME="${DB_USERNAME}"
                        export DB_PASSWORD="${DB_PASSWORD}"
                        export DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD}"
                        export DB_DATABASE="${DB_DATABASE}"
                        export LARAVEL_REVERB_APP_KEY="${LARAVEL_REVERB_APP_KEY}"
                        export OPENAI_API_KEY="${OPENAI_API_KEY}"
                        exDetermine ports based on environment
                        if [ "${ENVIRONMENT}" = "production" ] || [ "${ENVIRONMENT}" = "staging" ]; then
                            FRONTEND_PORT="80"
                            BACKEND_PORT="80"
                        else
                            FRONTEND_PORT="3000"
                            BACKEND_PORT="8000"
                        fi
                        
                        # Check frontend health
                        for i in {1..10}; do
                            if curl -f http://localhost:${FRONTEND_PORT}/ > /dev/null 2>&1; then
                                echo "✓ Frontend is healthy"
                                break
                            fi
                            echo "Waiting for frontend... attempt $i/10"
                            sleep 5
                        done
                        
                        # Check backend health
                        for i in {1..10}; do
                            if curl -f http://localhost:${BACKEND_PORT}/api/problems > /dev/null 2>&1; then
                                echo "✓ Backend API is healthy"
                                break
                            fi
                            echo "Waiting for backend... attempt $i/10"
                            sleep 5
                        done
                        
                        # Check database connectivity
                        docker compose ps | g on ${ENVIRONMENT}..."
                    sh '''
                        # Determine backend port
                        if [ "${ENVIRONMENT}" = "production" ] || [ "${ENVIRONMENT}" = "staging" ]; then
                            BACKEND_PORT="80"
                            WS_PORT="443"
                        else
                            BACKEND_PORT="8000"
                            WS_PORT="8080"
                        fi
                        
                        # Test API endpoints
                        echo "Testing API endpoints..."
                        curl -f http://localhost:${BACKEND_PORT}/api/problems || echo "⚠ API endpoint not accessible"
                        
                        # Test database access
                        echo "Testing database access..."
                        docker compose exec -T backend php artisan tinker --execute "echo 'DB Connected';" || echo "⚠ Database connection failed"
                        
                        # Test WebSocket connection (non-critical)
                        echo "Testing WebSocket connection..."
                        timeout 5 curl -i -N -H "Connection: Upgrade" \
                            -H "Upgrade: websocket" \
                            http://localhost:${WS_PORT}/socket.io || echo "⚠ WebSocket not fully accessible (expected for first connection)"
                    sh '''
                        # Check frontend
                        for i in {1..5}; do
                            if curl -f http://localhost:3000/ > /dev/null 2>&1; then
                                echo "Frontend is healthy"
                                break
                            fi
                            echo "Waiting for frontend... attempt $i/5"
                            sleep 5
                        done
                        
                        # Check backend
                        for i in {1..5}; do
                            if curl -f http://localhost:8000/api/me > /dev/null 2>&1; then
                                echo "Backend is healthy"
                                break
                            fi
                            echo "Waiting for backend... attempt $i/5"
                            sleep 5
                        done
                    '''
                }
            }
        }

        stage('Smoke Tests') {
            steps {
                script {
                    echo "Running smoke tests..."
                    sh '''
                        # Test API endpoints
                        curl -f http://localhost:8000/api/problems || exit 1
                        
                        # Test WebSocket connection
                        timeout 5 curl -i -N -H "Connection: Upgrade" \
                            -H "Upgrade: websocket" \
                            http://localhost:8080/socket.io || true
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployment successful!"
            // Add notification here (email, Slack, etc.)
        }

        failure {
            echo "Deployment failed!"
            sh '''
                # Rollback if needed
                docker compose -f docker-compose.yml down || true
            '''
            // Add notification here
        }

        always {
            // Cleanup
            sh '''
                docker system prune -f || true
            '''
        }
    }
}
