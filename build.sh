#!/bin/bash

# Define Colors
RESET='\033[0m'
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'

build_output_dir="dist"

echo -e "${BLUE}🔧 Starting build using your single .env file...${RESET}"

# Step 1: Clean previous build directory
echo -e "${BLUE}Cleaning previous build directory (${BOLD}${build_output_dir}${RESET}${BLUE})...${RESET}"
if [ -d "$build_output_dir" ]; then
  rm -rf "$build_output_dir"
  echo -e "${GREEN}Previous build directory cleaned.${RESET}"
else
  echo -e "${YELLOW}No previous build directory found; skipping clean.${RESET}"
fi

# Step 2: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${RESET}"
if npm install; then
  echo -e "${GREEN}Dependencies installed.${RESET}"
else
  echo -e "${RED}npm install failed. Aborting.${RESET}"
  exit 1
fi

# Step 3: Build
echo -e "${BLUE}🌐 Building project using .env configuration...${RESET}"
if npm run build; then
  echo -e "${GREEN}Build completed successfully.${RESET}"
  echo -e "${BLUE}Output directory: ${BOLD}${build_output_dir}${RESET}${BLUE}.${RESET}"
else
  echo -e "${RED}Build failed. Please check the error above.${RESET}"
  exit 1
fi

# Step 4: Prompt to serve locally
read -p "$(echo -e "${YELLOW}Do you want to start a local server to preview the build? (y/n): ${RESET}")" start_server_choice
if [[ "$start_server_choice" =~ ^[Yy]$ ]]; then
  echo -e "${BLUE}🚀 Starting server on port 5173...${RESET}"
  echo -e "${CYAN}Press Ctrl+C to stop the server.${RESET}"
  if ! npx serve -s dist -l 5173; then
    echo -e "${RED}Failed to start server on port 5173. Make sure 'serve' is installed and port 5173 is free.${RESET}"
    exit 1
  fi
else
  echo -e "${GREEN}Build finished. Preview step skipped.${RESET}"
fi