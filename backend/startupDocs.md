# Modix Backend Startup Sequence

## Overview
This document describes how the Modix backend determines which components to launch, and how it selects the correct platform handler for Windows or Linux environments.

---

## Main Entry Point
- **File:** `backend/modix.py`
- **Purpose:** Main entry for backend startup and platform selection.

### Launch Sequence
1. **modix.py**
    - Loads configuration from `modix_config/modix_config.json`.
    - Detects the current OS platform (Windows or Linux).
    - Selects the appropriate platform handler:
        - **Linux:** Uses `backend/API/Linux_runners/modix_auto_deployment.py`
        - **Windows:** Uses `backend/API/Windows_runners/modix_auto_deployment.py`
    - Starts the backend API server (`api_main.py`) as a subprocess.
    - Runs the platform-specific auto deployment logic.
    - On exit, terminates the API server subprocess.

---

## Platform Handlers
- **Linux Handler:**
    - File: `backend/API/Linux_runners/modix_auto_deployment.py`
    - Handles Docker container management, auto-deployment, and Linux-specific startup logic.
- **Windows Handler:**
    - File: `backend/API/Windows_runners/modix_auto_deployment.py`
    - Handles `.exe` or batch file execution, Windows process management, and Windows-specific startup logic.

---

## API Server
- **File:** `backend/api_main.py`
- **Purpose:** FastAPI application providing backend API endpoints for the frontend and other services.
- **Launched by:** `modix.py` (as a subprocess)

---

## Additional Notes
- All platform-specific logic is isolated in the respective handler modules.
- The main API and business logic remain platform-agnostic, using the handler interface for all platform-dependent operations.
- This structure allows for easy extension and maintenance as new platforms or features are added.

---

## Example Flow
```
User runs: python backend/modix.py
  └─ Loads config and detects platform
  └─ Starts backend/api_main.py (API server)
  └─ Runs Linux or Windows auto deployment logic
      └─ Manages containers (Linux) or processes (Windows)
```
