# Muncho Dashboard

A React-based dashboard application for managing restaurant including menu management, staff management, and customer interactions for Muncho Web App.

## Features

- **Authentication**
  - Staff login
  - Password reset functionality
  - Protected routes

- **Menu Management**
  - Create and edit menu groups
  - Manage dishes and categories
  - Update menu stock
  - Reorder menu items
  - Upload dish images

- **Staff Management**
  - Create and edit staff profiles
  - Manage staff permissions
  - Assign tables to staff
  - Staff status management

- **Marketing Tools**
  - Banner ads management
  - Popup ads management
  - Upsells configuration
  - Restaurant appearance customization

- **Customer Management**
  - View customer data
  - Handle customer reviews
  - Customer insights

## Tech Stack

- React 18
- React Router v7
- Material UI v6
- Tailwind CSS
- Vite
- DND Kit for drag-and-drop
- React Color for color picking
- Chart.js for analytics
- Axios for API calls

## Getting Started

1. **Installation**
   ```bash
   npm install
   ```

2. **Development**
   ```bash
   npm run dev
   ```

3. **Build**
   
   **Using Build Script (Recommended):**
   ```bash
   # Interactive mode - prompts for environment selection
   ./build.sh
   
   # Direct environment specification
   ./build.sh production
   ./build.sh development
   
   # Show help
   ./build.sh --help
   ```
   
   **Using npm commands:**
   ```bash
   # Standard build
   npm run build
   
   # Build for specific environment
   npm run build -- --mode production
   npm run build -- --mode development
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Build Information

### Build Script Features

The `build.sh` script provides an enhanced build experience with the following features:

- **Environment Selection**: Choose between production and development builds
- **Automatic Cleanup**: Removes previous build directory before building
- **Dependency Check**: Ensures all dependencies are installed
- **Local Preview**: Option to start a local server to preview the build
- **Interactive Mode**: Prompts for user input when no arguments provided
- **Colored Output**: Enhanced terminal output with colors for better readability

### Build Environments

- **Production**: Optimized build with minification and compression
- **Development**: Build with development optimizations and source maps

### Build Output

- Build artifacts are generated in the `dist/` directory
- The build script automatically cleans previous builds
- Option to serve the build locally for testing

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components
│   ├── login/      # Authentication pages
│   ├── dashboard/  # Main dashboard
│   ├── menu/       # Menu management
│   ├── staff/      # Staff management
│   └── ...
├── services/       # API services
├── utils/          # Utility functions
└── routes/         # Route configurations
```

## API Integration

The application uses a REST API with the following main endpoints:
- Authentication: `/auth/*`
- Staff Management: `/staff/*`
- Menu Management: `/menu/*`
- Restaurant Management: `/restaurant/*`
- File Upload: `/file/upload`


## License

Proprietary - All Rights Reserved to Muncho Technologies Private Limited
