#!/bin/bash

# Inicia o Xvfb (display virtual) na porta 99
echo "🖥️  Iniciando display virtual Xvfb..."
Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
XVFB_PID=$!

# Aguarda um momento para o Xvfb inicializar
sleep 2

# Define a variável de ambiente DISPLAY
export DISPLAY=:99

echo "🚀 Iniciando servidor Node.js..."
node index.js

# Quando o servidor terminar, mata o processo do Xvfb
kill $XVFB_PID 2>/dev/null
echo "🔒 Display virtual finalizado" 