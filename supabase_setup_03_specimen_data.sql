-- Migración para añadir estadísticas y habilidades a putedex_tasks
ALTER TABLE putedex_tasks 
ADD COLUMN atk INT DEFAULT 50,
ADD COLUMN def INT DEFAULT 50,
ADD COLUMN ability TEXT,
ADD COLUMN funny_note TEXT;

-- Actualizar los datos de los especímenes
UPDATE putedex_tasks SET atk = 45, def = 30, ability = 'Brillo Carmesí', funny_note = 'Nivel de seducción: Peligroso para carteras.' WHERE task_number = 1;
UPDATE putedex_tasks SET atk = 60, def = 55, ability = 'Espectro Eléctrico', funny_note = 'Más difícil de capturar que un shiny.' WHERE task_number = 2;
UPDATE putedex_tasks SET atk = 99, def = 85, ability = 'Latigazo Crítico', funny_note = 'Defensa impenetrable (literalmente armadura de látex).' WHERE task_number = 3;
UPDATE putedex_tasks SET atk = 20, def = 90, ability = 'Experiencia Ancestral', funny_note = 'Vigila con sabiduría y desprecio.' WHERE task_number = 4;
UPDATE putedex_tasks SET atk = 75, def = 40, ability = 'Mirada de Hielo', funny_note = 'Estatura media: 1.90m sin tacones.' WHERE task_number = 5;
UPDATE putedex_tasks SET atk = 65, def = 50, ability = 'Ritmo Nocturno', funny_note = 'Curvas nivel: Circuito de Nürburgring.' WHERE task_number = 6;
UPDATE putedex_tasks SET atk = 85, def = 45, ability = 'Pasión Picante', funny_note = 'Nivel de fuego: Requiere extintor.' WHERE task_number = 7;
UPDATE putedex_tasks SET atk = 55, def = 65, ability = 'Nébula Estrecha', funny_note = 'Ubicación: 404 Not Found.' WHERE task_number = 8;
UPDATE putedex_tasks SET atk = 70, def = 95, ability = 'Abrazo Total', funny_note = 'Defensa física: Máxima. Suavidad: Legendaria.' WHERE task_number = 9;
UPDATE putedex_tasks SET atk = 78, def = 62, ability = 'Sombra Amsterdam', funny_note = 'Color favorito: Negro desesperación.' WHERE task_number = 10;
UPDATE putedex_tasks SET atk = 0, def = 0, ability = 'Cortina de Humo', funny_note = 'Habilidad especial: Depresión post-paseo.' WHERE task_number = 11;
UPDATE putedex_tasks SET atk = 90, def = 35, ability = 'Persuasión Agresiva', funny_note = 'Attack: Persuade hasta a los palos de los canales.' WHERE task_number = 12;
UPDATE putedex_tasks SET atk = 10, def = 99, ability = 'Paciencia Budista', funny_note = 'Nivel de concentración: Nivel Dios.' WHERE task_number = 13;
UPDATE putedex_tasks SET atk = 40, def = 70, ability = 'Maquillaje Flash', funny_note = 'Speed: 120 FPS (Flashes Por Segundo).' WHERE task_number = 14;
UPDATE putedex_tasks SET atk = 82, def = 58, ability = 'Trampa Estrecha', funny_note = 'Agilidad: Máxima en espacios reducidos.' WHERE task_number = 15;
UPDATE putedex_tasks SET atk = 30, def = 40, ability = 'Turbo Silla', funny_note = 'Par motor: Impresionante.' WHERE task_number = 16;
UPDATE putedex_tasks SET atk = 77, def = 66, ability = 'Instinto Animal', funny_note = 'No la acaricies si no quieres un arañazo.' WHERE task_number = 17;
UPDATE putedex_tasks SET atk = 88, def = 88, ability = 'Folículo Bravo', funny_note = 'Suavidad: Cero. Estilo: Infinito.' WHERE task_number = 18;
