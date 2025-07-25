# Job Application Manager

Sistema completo de gestión de aplicaciones de trabajo con autenticación JWT robusta, refresh tokens, y gestión de sesiones.

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
cd server && npm install
```

### 2. Configurar Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb job_application_manager

# Inicializar esquema
cd server && npm run init:db
```

### 3. Configurar Variables de Entorno

```bash
cd server
cp env.example .env
```

Editar `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/job_application_manager"
JWT_SECRET="tu-super-secret-jwt-key"
PORT=3001
```

### 4. Iniciar Servidor

```bash
cd server
npm run start:dev
```

El servidor estará disponible en: `http://localhost:3001`

## ✅ Funcionalidades Verificadas

### 🔐 Autenticación Completa

- ✅ Registro de usuarios
- ✅ Login con JWT tokens
- ✅ Refresh tokens (7 días)
- ✅ Logout con revocación
- ✅ Blacklist de tokens
- ✅ Gestión de sesiones múltiples

### 📊 Gestión de Datos

- ✅ Crear/editar/eliminar empresas
- ✅ Crear/editar/eliminar aplicaciones
- ✅ Crear/editar/eliminar eventos de entrevista
- ✅ Crear/editar/eliminar notas
- ✅ Relaciones entre entidades

### 🛡️ Seguridad

- ✅ Tokens JWT de 15 minutos
- ✅ Refresh tokens almacenados en DB
- ✅ Revocación individual y masiva
- ✅ Limpieza automática de tokens expirados

## 🧪 Probar la API

### Usar el archivo de pruebas

```bash
# En VS Code: Abrir API_TESTING.http
# Los tokens ya están configurados para pruebas
```

### Endpoints principales

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/health` - Verificar estado

## 📋 Estructura del Proyecto

```
├── server/                 # Backend NestJS
│   ├── src/
│   │   ├── auth/          # Autenticación JWT
│   │   ├── controllers/   # Endpoints API
│   │   ├── services/      # Lógica de negocio
│   │   └── entities/      # Modelos de base de datos
│   └── database/          # Esquemas SQL
├── src/                   # Frontend React
└── API_TESTING.http       # Pruebas de API
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run start:dev          # Servidor con hot reload
npm run build             # Compilar para producción
npm run seed              # Poblar base de datos

# Base de datos
npm run init:db           # Inicializar esquema
npm run deploy:local      # Despliegue local completo
```

## 📝 Notas Importantes

- **Tokens JWT**: Expiran en 15 minutos
- **Refresh Tokens**: Expiran en 7 días
- **Base de datos**: PostgreSQL requerido
- **Puerto**: 3001 (configurable en .env)

## 🚨 Solución de Problemas

### Puerto en uso

```bash
lsof -ti:3001 | xargs kill -9
```

### Base de datos no conecta

```bash
# Verificar PostgreSQL
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Errores de enum

Los valores de estado de aplicación son:

- `Applied`
- `In progress`
- `Rejected`
- `Accepted`
- `Job Offered`
- `Withdraw`
