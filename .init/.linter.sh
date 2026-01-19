#!/bin/bash
cd /home/kavia/workspace/code-generation/recipe-explorer-200711-200724/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

