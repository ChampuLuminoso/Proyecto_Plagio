# alert-query-service · Puerto 8085

API REST protegida con JWT. Punto único de acceso externo al sistema

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
GET http://localhost:8085/actuator/health
```
