# Propuesta de Arquitectura - COMODISIMOS

Resumen ejecutivo:
- Sistema para uso exclusivo de Inspectores (operativos). Mobile-first, sencillo y responsive.
- Arquitectura separada en `frontend` (vistas, SPA ligera) y `backend` (API REST, seguridad y persistencia).

Componentes principales:
- Frontend: SPA ligera (HTML/CSS/JS) mobile-first, responsive, accesible desde tablet, móvil y computador.
- Backend: API REST en Node.js + Express. Endpoints para autenticación y registro de inspecciones.
- Base de datos relacional: SQLite en este prototipo; fácil migración a Postgres en producción.

Seguridad y escalabilidad:
- Autenticación con contraseñas hasheadas (bcrypt), sesiones seguras con JWT en cookie HttpOnly.
- Validaciones en backend + rate-limiting recomendado en despliegue.
- Diseño modular para insertar middleware de auditoría, control de acceso RBAC y auditoría de eventos.

Evolución:
- Migrar a Postgres o Cloud SQL para producción.
- Agregar gateway y microservicios cuando surja necesidad (p.ej. ingestión masiva, ML).
- Implementar CI/CD, pruebas automatizadas y monitorización (Prometheus/ELK).
