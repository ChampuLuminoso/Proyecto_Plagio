# notification-service · Puerto 8084

Consume alertas de la cola y notifica a Admin/Analista según nivel de riesgo

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
GET http://localhost:8084/actuator/health
```
