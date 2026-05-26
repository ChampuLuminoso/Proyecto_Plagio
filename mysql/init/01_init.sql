-- ─────────────────────────────────────────────────────────────
--  FraudGuard UAN — Script de inicialización MySQL
--  Se ejecuta automáticamente al levantar el contenedor
-- ─────────────────────────────────────────────────────────────

USE fraudguard;

-- ── USUARIOS DEL SISTEMA ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,  -- BCrypt hash
  nombre      VARCHAR(100) NOT NULL,
  rol         ENUM('ADMIN','ANALISTA','TECNICO') NOT NULL DEFAULT 'ANALISTA',
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── TRANSACCIONES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transacciones (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  referencia      VARCHAR(50)  NOT NULL UNIQUE,
  servicio        ENUM('MATRICULA','NOMINA','INSCRIPCION','PAGOS') NOT NULL,
  monto           DECIMAL(18,2) NOT NULL,
  usuario_origen  VARCHAR(150) NOT NULL,
  ip_origen       VARCHAR(45),
  estado          ENUM('NORMAL','ANOMALA','EN_REVISION') NOT NULL DEFAULT 'NORMAL',
  latencia_ms     INT,
  procesada_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_servicio (servicio),
  INDEX idx_estado   (estado),
  INDEX idx_procesada (procesada_en)
);

-- ── REGLAS DE DETECCIÓN ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS reglas (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  tipo        ENUM('MONTO','FRECUENCIA','HORARIO','ACCESO','PATRON') NOT NULL,
  activa      BOOLEAN NOT NULL DEFAULT TRUE,
  parametros  JSON NOT NULL,          -- configuración flexible por regla
  creada_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tipo   (tipo),
  INDEX idx_activa (activa)
);

-- ── ALERTAS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alertas (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  transaccion_id  BIGINT REFERENCES transacciones(id),
  regla_id        BIGINT REFERENCES reglas(id),
  tipo            VARCHAR(100) NOT NULL,
  descripcion     TEXT,
  nivel_riesgo    ENUM('BAJO','MEDIO','ALTO') NOT NULL,
  estado          ENUM('PENDIENTE','REVISADO','CERRADO') NOT NULL DEFAULT 'PENDIENTE',
  notificado      BOOLEAN NOT NULL DEFAULT FALSE,
  generada_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revisada_en     DATETIME,
  revisada_por    BIGINT REFERENCES usuarios(id),
  INDEX idx_estado      (estado),
  INDEX idx_nivel_riesgo (nivel_riesgo),
  INDEX idx_generada    (generada_en)
);

-- ── LOGS DE ACCESO ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS logs_acceso (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  usuario     VARCHAR(150),
  ip          VARCHAR(45),
  endpoint    VARCHAR(255),
  metodo      VARCHAR(10),
  exitoso     BOOLEAN NOT NULL DEFAULT TRUE,
  registrado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_usuario    (usuario),
  INDEX idx_ip         (ip),
  INDEX idx_registrado (registrado_en)
);

-- ─────────────────────────────────────────────────────────────
--  DATOS DE PRUEBA
-- ─────────────────────────────────────────────────────────────

-- Usuarios (passwords hasheadas con BCrypt — todas son "password123")
INSERT INTO usuarios (email, password, nombre, rol) VALUES
  ('admin@uan.edu.co',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador UAN',    'ADMIN'),
  ('analista@uan.edu.co', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Analista de Fraude',   'ANALISTA'),
  ('tecnico@uan.edu.co',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Técnico del Sistema',  'TECNICO');

-- Reglas de detección
INSERT INTO reglas (nombre, descripcion, tipo, activa, parametros) VALUES
(
  'Monto excesivo en matrícula',
  'Detecta transacciones de matrícula con monto superior al umbral permitido',
  'MONTO',
  TRUE,
  '{"servicio": "MATRICULA", "monto_maximo": 6000000, "nivel_riesgo": "ALTO"}'
),
(
  'Monto excesivo en nómina',
  'Detecta pagos de nómina con monto inusualmente alto',
  'MONTO',
  TRUE,
  '{"servicio": "NOMINA", "monto_maximo": 10000000, "nivel_riesgo": "ALTO"}'
),
(
  'Frecuencia anormal de transacciones',
  'Detecta más de 5 transacciones del mismo usuario en menos de 10 minutos',
  'FRECUENCIA',
  TRUE,
  '{"max_transacciones": 5, "ventana_minutos": 10, "nivel_riesgo": "MEDIO"}'
),
(
  'Transacción fuera de horario',
  'Detecta transacciones realizadas entre las 11pm y las 5am',
  'HORARIO',
  TRUE,
  '{"hora_inicio": 23, "hora_fin": 5, "nivel_riesgo": "MEDIO"}'
),
(
  'Acceso no autorizado al sistema',
  'Detecta más de 3 intentos de login fallidos desde la misma IP',
  'ACCESO',
  TRUE,
  '{"max_intentos": 3, "ventana_minutos": 5, "nivel_riesgo": "ALTO"}'
);

-- Transacciones de prueba
INSERT INTO transacciones (referencia, servicio, monto, usuario_origen, ip_origen, estado, latencia_ms, procesada_en) VALUES
  ('TXN-9807', 'NOMINA',      12500000, 'sys.batch@uan.edu.co',    '10.0.0.5',  'ANOMALA',    188, '2026-05-25 23:11:44'),
  ('TXN-9808', 'MATRICULA',    4850000, 'l.moreno@uan.edu.co',     '10.0.1.42', 'NORMAL',      95, '2026-05-25 22:41:15'),
  ('TXN-9809', 'NOMINA',       3200000, 'sys.payroll@uan.edu.co',  '10.0.0.5',  'NORMAL',     110, '2026-05-26 06:00:00'),
  ('TXN-9810', 'INSCRIPCION',   890000, 'r.lopez@uan.edu.co',      '10.0.1.88', 'NORMAL',      87, '2026-05-26 06:45:30'),
  ('TXN-9811', 'PAGOS',         120000, 'j.martinez@uan.edu.co',   '10.0.1.91', 'ANOMALA',     98, '2026-05-26 07:30:03'),
  ('TXN-9812', 'MATRICULA',    4850000, 'u.garcia@uan.edu.co',     '10.0.1.77', 'ANOMALA',    142, '2026-05-26 08:14:20');

-- Alertas de prueba
INSERT INTO alertas (transaccion_id, regla_id, tipo, descripcion, nivel_riesgo, estado, notificado, generada_en) VALUES
  (1, 2, 'Monto anómalo',            'Pago nómina $12.500.000 supera umbral de $10.000.000',          'ALTO',  'PENDIENTE', FALSE, '2026-05-25 23:11:47'),
  (5, 3, 'Frecuencia anormal',       'Usuario j.martinez realizó 6 transacciones en 8 minutos',       'MEDIO', 'PENDIENTE', FALSE, '2026-05-26 07:30:05'),
  (6, 1, 'Monto anómalo',            'Matrícula $4.850.000 supera umbral de $4.000.000',              'ALTO',  'PENDIENTE', FALSE, '2026-05-26 08:14:22'),
  (NULL, 5, 'Acceso no autorizado',  'IP 192.168.1.105 registró 5 intentos fallidos en 3 minutos',   'ALTO',  'REVISADO',  TRUE,  '2026-05-26 07:52:10'),
  (3, 4, 'Transacción fuera de horario', 'Pago nómina procesado a las 23:11 fuera del horario normal', 'MEDIO', 'CERRADO', TRUE,  '2026-05-25 23:12:00');
