# Port Usage Documentation

**IMPORTANT**: Before adding new services, check this file!

## Ports Used by OpenClaw Projects

| Project | Port | Protocol | Status | Notes |
|---------|------|----------|--------|-------|
| OpenClaw Gateway | 18789 | WebSocket/HTTP | ✅ Active | Main OpenClaw gateway |
| OpenClaw Dashboard | 3001 | HTTP | ✅ Active | Dashboard backend |
| **Family Chat** | **3010** | **HTTP/WebSocket** | ✅ **Active** | Family WebChat UI |
| | | | | |
| | | | | |
| | | | | |

---

## Rules

1. **Always check this file before using a new port**
2. **Use ports 3000+ for custom projects** (avoids conflict with system services)
3. **Document new ports immediately** after deployment
4. **Reserve ports 1-1024** for system services only

---

## Available Ports (Recommendations)

- 3010, 3011, 3012, 3013, 3014, 3015 (Family Chat + related)
- 3020-3050 (General custom projects)
- 3100-3200 (Development/testing)

---

## How to Add a New Port

1. Choose an available port from the list above
2. Update your project's configuration
3. Add entry to this table with: Project name, Port, Protocol, Status
4. Commit this file with your project

## Current Status: 2026-02-02

✅ All ports documented above are reserved for their respective projects.
