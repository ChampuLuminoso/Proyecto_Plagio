# FraudGuard UAN
### Sistema de Detección de Transacciones Anómalas y Accesos No Autorizados
> Universidad Antonio Nariño · Arquitectura de Software · 2026

---

## 📁 Estructura del proyecto

```
fraudguard-uan/
├── docker-compose.yml          ← levanta todo el sistema
├── .env.example                ← variables de entorno (copiar como .env)
├── mysql/
│   └── init/01_init.sql        ← esquema + datos de prueba
├── services/
│   ├── transaction-ingestion/  ← Puerto 8081 · Recibe transacciones
│   ├── fraud-analysis/         ← Puerto 8082 · Analiza y clasifica
│   ├── rule-engine/            ← Puerto 8083 · Motor de reglas (Strategy)
│   ├── notification-service/   ← Puerto 8084 · Envía alertas
│   └── alert-query-service/    ← Puerto 8085 · API REST + JWT
└── frontend/                   ← Puerto 3000 · Dashboard React
```

---

## ⚙️ Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Spring Boot 3 (Java 17) |
| Frontend | React + Vite + Axios |
| Cola de mensajes | RabbitMQ |
| Base de datos | MySQL 8 |
| Seguridad | Spring Security + JWT |
| Contenedores | Docker + Docker Compose |
| Monitoreo | Spring Boot Actuator |
| Pruebas de carga | JMeter |

---

## 🚀 Cómo correr el proyecto

### Requisitos
- Docker Desktop instalado y corriendo
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/fraudguard-uan.git
cd fraudguard-uan

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar todo
docker compose up --build

# 4. Verificar que todos los servicios estén UP
docker compose ps
```

### URLs

| Servicio | URL |
|---|---|
| Dashboard Frontend | http://localhost:3000 |
| Transaction Ingestion | http://localhost:8081/actuator/health |
| Fraud Analysis | http://localhost:8082/actuator/health |
| Rule Engine | http://localhost:8083/actuator/health |
| Notification Service | http://localhost:8084/actuator/health |
| Alert Query Service | http://localhost:8085/actuator/health |
| RabbitMQ Panel | http://localhost:15672 |

---

## 👤 Credenciales de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| admin@uan.edu.co | password123 | ADMIN |
| analista@uan.edu.co | password123 | ANALISTA |
| tecnico@uan.edu.co | password123 | TECNICO |

---

## 🔄 Flujo del sistema

```
Sistema de Pagos UAN (externo)
        │  POST /api/v1/transactions  (JSON)
        ▼
Transaction Ingestion Service (8081)
        │  → transactions.queue  (RabbitMQ · ASÍNCRONO)
        ▼
Fraud Analysis Service (8082)
        │  → POST /api/v1/rules/evaluate  (REST · SÍNCRONO)
        ▼
Rule Engine Service (8083)
        │  ← retorna violaciones
        ▼
Fraud Analysis
        │  → crea alertas en MySQL
        │  → alerts.queue  (RabbitMQ · ASÍNCRONO)
        ▼
Notification Service (8084)
        │  notifica Admin/Analista según nivel de riesgo
        ▼
Alert Query Service (8085)
        │  GET /api/v1/alerts  (REST+JWT · SÍNCRONO)
        ▼
Frontend Dashboard (3000)
```

---

## 👥 Equipo

| Integrante | Responsabilidad |
|---|---|
| Jorge Montes | Stack tecnológico, microservicios, tácticas, interfaz |
| Laura Caminos | Objetivo, responsabilidades |
| Daniel Posada | Atributos de calidad, drivers arquitectónicos |
| Virginia Raga | Riesgos, conclusión |

**Profesor:** Juan Huertas
