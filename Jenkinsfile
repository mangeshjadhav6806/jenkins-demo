pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub repository...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Verifying project files...'
                script {
                    def requiredFiles = ['index.html', 'style.css', 'script.js']
                    for (file in requiredFiles) {
                        if (fileExists(file)) {
                            echo "Found required file: ${file}"
                        } else {
                            error "Build failed: Missing required file '${file}'"
                        }
                    }
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running basic validation tests on project files...'
                script {
                    def filesToValidate = ['index.html', 'style.css', 'script.js']
                    for (file in filesToValidate) {
                        def content = readFile(file)
                        if (content.trim().length() > 0) {
                            echo "Validation passed for: ${file} (Non-empty file verified)"
                        } else {
                            error "Test failed: '${file}' is empty!"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully! Student Task Tracker is ready.'
        }
        failure {
            echo 'Pipeline failed! Please check the logs above for details.'
        }
    }
}
