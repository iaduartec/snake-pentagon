# Neon Snake Pentagon — Diseño

## Objetivo

Crear un juego Snake rápido y completo para navegador, contenido visualmente dentro de un pentágono de estética neón. La rotación será decorativa: no alterará la dirección lógica de la serpiente ni el significado de los controles.

## Experiencia visual

- Fondo oscuro con profundidad sutil y destellos ambientales.
- Área jugable central con forma pentagonal fija y borde tenue claramente visible.
- Un aro pentagonal exterior de doble línea neón gira lentamente alrededor del área jugable.
- Serpiente verde/cian luminosa, con cabeza diferenciada y cuerpo de lectura clara.
- Comida representada como un núcleo magenta pulsante.
- Partículas breves y un destello de puntuación al comer.
- Interfaz compacta: puntuación, récord local, pausa y reinicio, sin paneles innecesarios.
- Diseño adaptable a escritorio y móvil, con controles táctiles visibles solo cuando sean útiles.

## Mecánica

- Movimiento en una cuadrícula lógica de celdas válidas dentro de un pentágono.
- Flechas o WASD cambian la dirección; no se permite invertir directamente sobre el cuerpo.
- En móvil se puede jugar con botones direccionales y gestos de deslizamiento.
- Comer aumenta la puntuación y la longitud de la serpiente.
- La velocidad aumenta gradualmente, con un límite que mantiene la partida jugable.
- La partida termina al tocar el borde pentagonal o el propio cuerpo.
- Espacio pausa o continúa; Enter y el botón de reinicio comienzan otra partida.
- El récord se guarda localmente en el navegador.

## Arquitectura

- React + Vite para la aplicación y la interfaz.
- Canvas 2D para el tablero, la serpiente, la comida, las partículas y los efectos luminosos.
- Estado React para puntuación, récord, pausa, fin de partida y controles de interfaz.
- Un bucle de juego basado en `requestAnimationFrame`, con actualización lógica a intervalos estables separados del renderizado.
- Módulos separados para geometría pentagonal, estado/reglas del juego, renderizado y controles.
- Los elementos interactivos y textos serán HTML accesible; el canvas será la superficie gráfica del juego.

## Geometría y rotación

- La colisión usa un pentágono fijo en coordenadas lógicas.
- Al iniciar y al generar comida se eligen únicamente celdas cuyo centro y margen están dentro del pentágono.
- El aro exterior gira alrededor del centro sin participar en las colisiones.
- La cámara y el sistema de controles permanecen fijos; pulsar arriba siempre mueve la serpiente hacia arriba en pantalla.

## Estados y errores

- Estado inicial con llamada clara para jugar y controles resumidos.
- Pausa superpuesta sin perder el estado de la partida.
- Fin de partida con puntuación, récord y reinicio inmediato.
- Si no existe una celda libre para generar comida, la partida se considera completada.
- Si `localStorage` no está disponible, el juego sigue funcionando sin persistir el récord.
- Respeta `prefers-reduced-motion`: reduce el giro, pulsos y partículas sin afectar la jugabilidad.

## Verificación

- Pruebas unitarias para geometría, movimiento, crecimiento, colisión propia, borde, generación de comida y aumento de velocidad.
- Build y lint del proyecto.
- Prueba en navegador del flujo completo: iniciar, mover, comer, pausar, perder y reiniciar.
- Verificación visual en escritorio y móvil, incluyendo legibilidad, ausencia de desbordamiento y funcionamiento táctil.
- Comparación final entre el concepto visual aprobado y la captura real del navegador.

## Fuera de alcance

- Multijugador, cuentas, backend, ranking en línea, compras y despliegue público.
- Rotación física del tablero, gravedad o controles que cambien con el ángulo.
- Audio obligatorio; el primer alcance se centra en interacción y acabado visual.
