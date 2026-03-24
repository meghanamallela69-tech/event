@echo off
echo Creating minimal setup for frontend...

REM Create minimal node_modules structure
mkdir node_modules 2>nul
mkdir node_modules\.bin 2>nul

REM Create a simple vite wrapper
echo @echo off > node_modules\.bin\vite.cmd
echo vite %%* >> node_modules\.bin\vite.cmd

REM Create minimal package.json for vite config
echo { > node_modules\package.json
echo   "name": "minimal-setup", >> node_modules\package.json
echo   "version": "1.0.0" >> node_modules\package.json
echo } >> node_modules\package.json

echo Starting frontend with global vite...
vite