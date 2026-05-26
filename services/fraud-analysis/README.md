# fraud-analysis · Puerto 8082

Consume transacciones de la cola y coordina el análisis con el Rule Engine

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
GET http://localhost:8082/actuator/health
```
