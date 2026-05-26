# transaction-ingestion · Puerto 8081

Recibe transacciones del sistema de pagos UAN y las publica en RabbitMQ

## Archivos que faltan completar

Para que este servicio compile necesitas agregar en el paquete correspondiente:

- `*Application.java` — clase principal con `@SpringBootApplication`
- `*Repository.java` — interfaz JPA que extiende `JpaRepository`
- DTOs de request y response
- Configuración de seguridad si aplica

## Correr localmente (sin Docker)

```bash
mvn spring-boot:run
```

## Health check

```
GET http://localhost:8081/actuator/health
```
