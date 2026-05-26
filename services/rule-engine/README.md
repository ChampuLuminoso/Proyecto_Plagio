# rule-engine · Puerto 8083

Evalúa reglas de detección usando patrón Strategy. Las reglas viven en MySQL

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
GET http://localhost:8083/actuator/health
```
