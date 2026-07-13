# QR Code Generator

A single-page React application that instantly converts text, URLs, or Wi-Fi credentials into downloadable QR codes. Designed for quick sharing and secure Wi-Fi provisioning.

## Features
- Switch between plain text, URL, or Wi-Fi modes with contextual inputs.
- Real-time QR preview renders directly in the browser using `qrcode.react`.
- Input validation ensures only valid content is encoded.
- Download the rendered QR code as a PNG with a single click.

## Stack
- React (Create React App)
- `qrcode.react` for canvas-based QR rendering

## Getting started
```bash
cd frontend
npm install
npm run start
```

Use `npm run build` in the `frontend` directory to produce a production bundle.
