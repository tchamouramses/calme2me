#!/usr/bin/env groovy
// Jenkins Script Console - Créer les credentials automatiquement
// Utilisation: Copy-paste this script in Jenkins Script Console

import jenkins.model.Jenkins
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.impl.*
import com.cloudbees.plugins.credentials.domains.Domain
import org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl
import hudson.util.Secret

def store = Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore()
def domain = Domain.global()

// Fonction pour créer un StringCredential
def createStringCredential(id, description, secret) {
    def credentialExists = store.getCredentials(domain).any { it.id == id }
    
    if (credentialExists) {
        println("⚠️  Credential '$id' already exists - skipping")
        return false
    }
    
    def credential = new StringCredentialsImpl(
        CredentialsScope.GLOBAL,
        id,
        description,
        Secret.fromString(secret)
    )
    
    store.addCredentials(domain, credential)
    println("✓ Created: $id")
    return true
}

// Fonction pour créer un UsernamePasswordCredential
def createUsernamePasswordCredential(id, description, username, password) {
    def credentialExists = store.getCredentials(domain).any { it.id == id }
    
    if (credentialExists) {
        println("⚠️  Credential '$id' already exists - skipping")
        return false
    }
    
    def credential = new UsernamePasswordCredentialsImpl(
        CredentialsScope.GLOBAL,
        id,
        description,
        username,
        password
    )
    
    store.addCredentials(domain, credential)
    println("✓ Created: $id")
    return true
}

println("\n🔐 Creating Jenkins Credentials for calme2me\n")
println("=" * 50)

// Créer les credentials Docker
println("\n📦 Docker Registry Credentials:")
createStringCredential("docker-registry-url", "Docker Registry URL", "your-docker-registry.com")
createUsernamePasswordCredential("docker-credentials", "Docker Registry Credentials", "your-username", "your-token")

// Créer les credentials par environnement
def environments = ["development", "staging", "production"]
def domains = [
    "development": [
        frontend: "calme2me.local",
        backend: "api.calme2me.local"
    ],
    "staging": [
        frontend: "calme2me-staging.com",
        backend: "api-staging.calme2me.com"
    ],
    "production": [
        frontend: "calme2me.com",
        backend: "api.calme2me.com"
    ]
]

environments.each { env ->
    println("\n🔑 ${env.toUpperCase()} Environment:")
    
    // Domaines
    createStringCredential("frontend-domain-${env}", "Frontend Domain", domains[env].frontend)
    createStringCredential("backend-domain-${env}", "Backend Domain", domains[env].backend)
    
    // URLs
    def protocol = (env == "development") ? "http" : "https"
    def port = (env == "development") ? ":8000" : ""
    def backendDomain = domains[env].backend
    
    createStringCredential("app-url-${env}", "APP_URL", "${protocol}://${backendDomain}${port}")
    createStringCredential("api-url-${env}", "API_URL", "${protocol}://${backendDomain}${port}/api")
    createStringCredential("vite-api-url-${env}", "VITE_API_URL", "${protocol}://${backendDomain}${port}/api")
    
    // Application Keys (À remplacer par vos vraies valeurs!)
    createStringCredential("app-key-${env}", "Laravel APP_KEY", "base64:CHANGE_ME_WITH_REAL_KEY_${env}")
    createStringCredential("reverb-app-key-${env}", "Reverb App Key", "CHANGE_ME_WITH_REAL_KEY_${env}")
    createStringCredential("openai-api-key-${env}", "OpenAI API Key", "sk-proj-CHANGE_ME")
}

// Database Credentials
println("\n🗄️  Database Credentials:")

def dbConfigs = [
    "development": [
        host: "mysql",
        port: "3306",
        username: "calme2me",
        password: "password",
        root_password: "root",
        database: "calme2me_dev"
    ],
    "staging": [
        host: "mysql.staging.internal",
        port: "3306",
        username: "calme2me_staging",
        password: "staging_password",
        root_password: "staging_root",
        database: "calme2me_staging"
    ],
    "production": [
        host: "mysql.prod.internal",
        port: "3306",
        username: "calme2me_prod",
        password: "PRODUCTION_PASSWORD",
        root_password: "PRODUCTION_ROOT",
        database: "calme2me_prod"
    ]
]

dbConfigs.each { env, config ->
    createStringCredential("db-host-${env}", "Database Host", config.host)
    createStringCredential("db-port-${env}", "Database Port", config.port)
    createStringCredential("db-username-${env}", "Database Username", config.username)
    createStringCredential("db-password-${env}", "Database Password", config.password)
    createStringCredential("db-root-password-${env}", "Database Root Password", config.root_password)
    createStringCredential("db-database-${env}", "Database Name", config.database)
}

// Redis Credentials
println("\n⚡ Redis Credentials:")

def redisConfigs = [
    "development": [
        host: "redis",
        port: "6379",
        password: ""
    ],
    "staging": [
        host: "redis.staging.internal",
        port: "6379",
        password: "staging_redis_password"
    ],
    "production": [
        host: "redis.prod.internal",
        port: "6379",
        password: "PRODUCTION_REDIS_PASSWORD"
    ]
]

redisConfigs.each { env, config ->
    createStringCredential("redis-host-${env}", "Redis Host", config.host)
    createStringCredential("redis-port-${env}", "Redis Port", config.port)
    createStringCredential("redis-password-${env}", "Redis Password", config.password)
}

// Sauvegarder les changements
Jenkins.instance.save()

println("\n" + "=" * 50)
println("✅ Credentials creation completed!")
println("\n⚠️  IMPORTANT:")
println("1. Review and update all credentials with real values:")
println("   - Replace 'CHANGE_ME' placeholders")
println("   - Set real database passwords")
println("   - Set real API keys")
println("\n2. Access credentials here:")
println("   Jenkins → Manage Credentials → System → Global credentials")
println("\n3. Document your credentials in a secure location")
