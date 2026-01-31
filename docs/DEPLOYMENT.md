# Deployment-Anleitung

Diese Anleitung beschreibt das automatische Deployment von Bandbreite auf einen eigenen Server mit NGINX.

## Architektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Lokal     │────→│   GitHub    │────→│ GitHub Actions  │────→│ Dein Server │
│ Entwicklung │push │ Repository  │     │ Build & Test    │rsync│   NGINX     │
└─────────────┘     └─────────────┘     └─────────────────┘     └─────────────┘
```

## Server-Konfiguration

### 1. Benutzer erstellen

```bash
# Auf dem Server als root
sudo adduser bandbreite --disabled-password
sudo mkdir -p /var/www/bandbreite
sudo chown bandbreite:bandbreite /var/www/bandbreite
```

### 2. SSH-Key für GitHub Actions

```bash
# Auf deinem lokalen Rechner
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github-deploy-key

# Public Key auf Server kopieren
ssh-copy-id -i ~/.ssh/github-deploy-key.pub bandbreite@dein-server.de

# Oder manuell:
# cat ~/.ssh/github-deploy-key.pub | ssh bandbreite@dein-server.de "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. NGINX konfigurieren

Erstelle `/etc/nginx/sites-available/bandbreite`:

```nginx
server {
    listen 80;
    server_name bandbreite.dein-server.de;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bandbreite.dein-server.de;

    # SSL-Zertifikate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/bandbreite.dein-server.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bandbreite.dein-server.de/privkey.pem;

    root /var/www/bandbreite;
    index index.html;

    # Vorkomprimierte Dateien verwenden (Brotli/Gzip)
    gzip_static on;
    brotli_static on;

    # SPA Routing: Alle Routen auf index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache für statische Assets (1 Jahr)
    location /_app/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker nicht cachen
    location /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # 404-Seite
    error_page 404 /404.html;
}
```

Aktivieren:

```bash
sudo ln -s /etc/nginx/sites-available/bandbreite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Let's Encrypt SSL-Zertifikat

```bash
sudo certbot --nginx -d bandbreite.dein-server.de
```

## GitHub-Konfiguration

### 1. Repository Secrets einrichten

Gehe zu: GitHub Repository → Settings → Secrets and variables → Actions

Füge folgende Secrets hinzu:

| Secret | Wert |
|--------|------|
| `SSH_PRIVATE_KEY` | Inhalt von `~/.ssh/github-deploy-key` (der PRIVATE Key) |
| `REMOTE_HOST` | `dein-server.de` |
| `REMOTE_USER` | `bandbreite` |
| `REMOTE_PORT` | `22` (oder dein SSH-Port) |
| `REMOTE_TARGET` | `/var/www/bandbreite` |

### 2. Branch Protection (optional, empfohlen)

Gehe zu: GitHub Repository → Settings → Branches → Add rule

- Branch name pattern: `main`
- Require a pull request before merging: ✓
- Require status checks to pass: ✓
- Require approvals: 1 (oder 0 wenn nur du)

## Workflow

### Automatisches Deployment

1. Push auf `main` Branch
2. GitHub Actions startet automatisch
3. Build wird erstellt und getestet
4. Bei Erfolg: rsync auf Server
5. Seite ist live

### Manuelles Deployment

1. Gehe zu: Actions → "Build and Deploy" → Run workflow
2. Wähle Branch aus
3. Klicke "Run workflow"

### Lokaler Build zum Testen

```bash
npm run build
npm run preview
```

## Troubleshooting

### Build schlägt fehl

```bash
# Lokal testen
npm run check
npm run test:run
npm run build
```

### SSH-Verbindung schlägt fehl

1. Prüfe ob der SSH-Key korrekt in GitHub Secrets ist
2. Prüfe ob der Public Key in `~/.ssh/authorized_keys` auf dem Server ist
3. Teste manuell: `ssh -i ~/.ssh/github-deploy-key bandbreite@dein-server.de`

### NGINX zeigt 404

1. Prüfe ob Dateien in `/var/www/bandbreite` liegen
2. Prüfe NGINX-Logs: `sudo tail -f /var/log/nginx/error.log`
3. Prüfe Berechtigungen: `ls -la /var/www/bandbreite`

## Sicherheitshinweise

- Der SSH Private Key sollte NUR in GitHub Secrets liegen
- Der `bandbreite`-User hat keine sudo-Rechte
- Der `bandbreite`-User kann nur in `/var/www/bandbreite` schreiben
- Aktiviere Fail2ban für SSH-Schutz
