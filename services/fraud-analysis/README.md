# Fraud Analysis Service · Puerto 8082

## ¿Qué hace este servicio?

Es el **cerebro del sistema**. Escucha la cola de transacciones de RabbitMQ,
consulta el Rule Engine para saber si son sospechosas, y si lo son:
crea alertas en MySQL y las publica en la cola de notificaciones.

---

## Archivos en este servicio

```
fraud-analysis/
├── pom.xml                                   ← dependencias Maven
├── Dockerfile                                ← para correr con Docker
└── src/main/
    ├── resources/
    │   └── application.yml                   ← configuración de puertos, BD, RabbitMQ
    └── java/.../analysis/
        ├── FraudAnalysisApplication.java     ← clase principal (ya creado)
        ├── model/
        │   ├── Transaccion.java              ← entidad de la tabla transacciones
        │   └── Alerta.java                   ← entidad de la tabla alertas
        ├── repository/
        │   ├── TransaccionRepository.java    ← acceso a BD para transacciones
        │   └── AlertaRepository.java         ← acceso a BD para alertas
        ├── dto/
        │   ├── EvaluationRequest.java        ← datos que se envían al Rule Engine
        │   └── EvaluationResult.java         ← respuesta del Rule Engine
        ├── client/
        │   └── RuleEngineClient.java         ← llama al Rule Engine por REST
        ├── config/
        │   └── AppConfig.java               ← declara colas RabbitMQ y RestTemplate
        └── service/
            └── FraudAnalysisService.java     ← lógica principal del análisis
```

---

## Cómo integrarlo al proyecto principal

1. Copia toda esta carpeta `fraud-analysis/` dentro de `fraudguard-uan/services/`
2. Verifica que el `docker-compose.yml` ya lo tiene configurado (sí lo tiene)
3. Levanta con: `docker compose up --build fraud-analysis`

## Probar que funciona

```bash
# Health check
curl http://localhost:8082/actuator/health

# Enviar una transacción desde el Transaction Ingestion y ver los logs
docker compose logs -f fraud-analysis
```
