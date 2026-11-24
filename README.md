# Baobao AI Painting Frontend

A Stable Diffusion image-generation frontend built with Vue 3 and Vite. It provides text-to-image, image-to-image/inpainting, and gallery features, and calls the backend API to use the SDXL, SD3, and Flux models.

## Features

- **Text-to-image**: Write prompts and generate images with SDXL, SD3, or Flux.
- **Image-to-image and inpainting**: Create variations from existing images and regenerate selected regions.
- **Generation progress**: Track generation status and cancel tasks in progress.
- **Gallery**: Browse generated images.
- **Responsive interface**: Supports desktop and mobile layouts, with dark theme styles.

## Tech Stack

- Vue 3, TypeScript, Vue Router, Vuex
- Vite
- Element Plus, Ant Design Vue
- Axios, Sass

## Prerequisites

- Node.js (a currently maintained LTS version is recommended)
- Yarn
- Access to the companion image-generation backend API

## Installation and Development

```bash
yarn install
yarn dev
```

Vite starts the development server and prints the local URL in the terminal.

## Environment Configuration

The project uses `.env.development`, `.env.test`, `.env.production`, and `.env.qudongkeji` for different environments. Configure the backend URL with `VITE_BASE_URL` for the target environment. In development, Vite proxies `/chatsdapi` requests to this backend. For how API URLs are handled in test, production, and other environments, see `src/utils/service.ts`.

Do not commit secrets or sensitive credentials to the repository.

## Common Commands

| Command | Description |
| --- | --- |
| `yarn dev` | Start the default development environment |
| `yarn dev:test` | Start the development server in test mode |
| `yarn build` | Build for the default production environment |
| `yarn build:development` | Build in development mode |
| `yarn build:qudongkeji` | Build in qudongkeji mode |
| `yarn preview` | Preview the build locally |
| `yarn typecheck` | Run Vue and TypeScript type checks |
| `yarn lint` | Format the code and run ESLint |

## Pages

- `/Txt2Img`: Text-to-image (default home page)
- `/Img2Img`: Image-to-image and inpainting
- `/Gallery`: Image gallery

The router uses Vue Router's Hash History mode.

## Project Structure

```text
src/
├── api/          # Backend API clients (authentication, users, SDXL, SD3, Flux, etc.)
├── assets/       # Images and fonts
├── components/   # Reusable components (if present)
├── data/         # Demo data, including images
├── router/       # Route configuration
├── store/        # Vuex state management
├── utils/        # Request services and shared utilities
└── views/        # Pages and feature components
    ├── Gallery/  # Image gallery
    ├── Img2Img/  # Image-to-image and inpainting
    └── Txt2Img/  # Text-to-image
```

## Backend Requirements

This frontend requires the companion image-generation API. Model inference, model files, and task queues are provided by the backend. Before using generation features, make sure the backend URL and authentication are configured and the model service is available.
