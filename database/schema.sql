-- Schema para Sistema de Finanzas Personales
-- PostgreSQL Database Schema compatible con Django

-- Solo insertar categorías por defecto después de que Django cree las tablas
-- Las tablas serán creadas por las migraciones de Django

-- Script para insertar categorías por defecto
-- Este script se ejecutará después de las migraciones
DO $$
BEGIN
    -- Esperar a que la tabla categories_category exista
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories_category') THEN
        -- Insertar categorías por defecto si no existen
        INSERT INTO categories_category (nombre, descripcion, color, icono, created_at) 
        SELECT * FROM (VALUES
            ('Comida', 'Gastos en alimentación y restaurantes', '#e74c3c', 'utensils', NOW()),
            ('Transporte', 'Gastos en transporte público, gasolina, etc.', '#f39c12', 'car', NOW()),
            ('Vivienda', 'Renta, servicios, mantenimiento del hogar', '#2ecc71', 'home', NOW()),
            ('Ocio', 'Entretenimiento, cine, deportes', '#9b59b6', 'gamepad', NOW()),
            ('Salud', 'Gastos médicos, medicamentos', '#1abc9c', 'heartbeat', NOW()),
            ('Educación', 'Cursos, libros, material educativo', '#34495e', 'graduation-cap', NOW()),
            ('Ropa', 'Vestimenta y accesorios', '#e67e22', 'tshirt', NOW()),
            ('Otros', 'Gastos varios no categorizados', '#95a5a6', 'ellipsis-h', NOW())
        ) AS v(nombre, descripcion, color, icono, created_at)
        WHERE NOT EXISTS (SELECT 1 FROM categories_category WHERE nombre = v.nombre);
    END IF;
END
$$;