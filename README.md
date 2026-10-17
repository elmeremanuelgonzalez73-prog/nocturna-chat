# Nocturna Chat

Chat por salas en el navegador.  
Los mensajes se eliminan **exactamente 24 horas** después de haber sido enviados.

## Características

- Salas por código/número
- El primer usuario que entra puede ponerle nombre a la sala
- Tema oscuro por defecto + interruptor día/noche
- Efectos glass, micro-interacciones y diseño no genérico
- Mensajes con caducidad de 24h (limpieza automática)

## Cómo correrlo localmente

```bash
npm install
npm start
```

Abre `http://localhost:3000`

## Deploy en Render / Railway / etc.

1. Conecta este repositorio
2. Build command: `npm install`
3. Start command: `npm start`
4. Listo

> **Nota:** En planes gratuitos la memoria se reinicia cuando el servicio duerme.  
> Los mensajes viven mientras el servidor esté activo + la regla de 24h.

## Uso

1. Pon tu nombre
2. Elige un número/código de sala
3. (Opcional) ponle nombre a la sala si eres el primero
4. Entra y habla

Hecho para que no se sienta como otro chat genérico más.
