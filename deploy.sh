#!/bin/zsh
set -euo pipefail

# Load environment variables from .env
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

if [ -z "${SSH_DEPLOY_TARGET:-}" ] || [ -z "${SSH_DEPLOY_PATH:-}" ]; then
  echo "Feil: SSH_DEPLOY_TARGET eller SSH_DEPLOY_PATH er ikke satt i .env"
  exit 1
fi

# Valider format på SSH_DEPLOY_TARGET for å hindre argument-injeksjon
if ! [[ "$SSH_DEPLOY_TARGET" =~ ^[a-zA-Z0-9._@-]+$ ]]; then
  echo "Feil: SSH_DEPLOY_TARGET har ugyldig format. Tillatt: brukernavn@server.no eller server.no"
  exit 1
fi

# Fjern eventuell avsluttende skråstrek for konsekvent validering og bruk
SSH_DEPLOY_PATH="${SSH_DEPLOY_PATH%/}"

# Sikkerhetssjekker for SSH_DEPLOY_PATH
if [[ "$SSH_DEPLOY_PATH" == *..* ]]; then
  echo "Feil: SSH_DEPLOY_PATH kan ikke inneholde '..' (stigjennomgang/path traversal)."
  exit 1
fi

if [[ "$SSH_DEPLOY_PATH" != /* ]]; then
  echo "Feil: SSH_DEPLOY_PATH må være en absolutt bane som starter med '/'."
  exit 1
fi

# Tell antall skråstreker for å sikre at banen er dyp nok (f.eks. minst 3 ledd: /a/b/c)
SLASH_COUNT=$(echo -n "$SSH_DEPLOY_PATH" | tr -cd '/' | wc -c)
if [ "$SLASH_COUNT" -lt 3 ]; then
  echo "Feil: SSH_DEPLOY_PATH ($SSH_DEPLOY_PATH) er for grunn. Banen må ha minst 3 nivåer (f.eks. /home/bruker/snikksnakk)."
  exit 1
fi

# Hviteliste: kun tillat distribusjon til godkjente rotkatalog-prefixer
ALLOWED_PREFIXES=("/var/www/" "/home/" "/srv/")
PATH_OK=false
for prefix in "${ALLOWED_PREFIXES[@]}"; do
  if [[ "$SSH_DEPLOY_PATH" == "$prefix"* ]]; then
    PATH_OK=true
    break
  fi
done
if [ "$PATH_OK" = false ]; then
  echo "Feil: SSH_DEPLOY_PATH ($SSH_DEPLOY_PATH) er ikke innenfor tillatte rotkatalog-prefixer: ${ALLOWED_PREFIXES[*]}"
  exit 1
fi

echo "Bygger prosjektet..."
npm run build

# Sjekk at dist/ faktisk inneholder filer før overføring (sikrer mot tom dist ved byggfeil)
if [ -z "$(ls -A dist/ 2>/dev/null)" ]; then
  echo "Feil: dist/ er tom eller eksisterer ikke. Avbryter distribusjon."
  exit 1
fi

echo "Overfører filer til $SSH_DEPLOY_TARGET:$SSH_DEPLOY_PATH..."

# Try rsync first (preferred for speed, handles directory structure and deletes obsolete files safely without owner/group errors)
if command -v rsync >/dev/null 2>&1; then
  rsync -rtlz --delete dist/ "$SSH_DEPLOY_TARGET:$SSH_DEPLOY_PATH/"
  RESULT=$?
else
  # Fallback to scp (cd into dist to avoid path expansion and glob issues)
  (cd dist && scp -r . "$SSH_DEPLOY_TARGET:$SSH_DEPLOY_PATH/")
  RESULT=$?
fi

if [ $RESULT -eq 0 ]; then
  echo "Distribusjon fullført med suksess!"
else
  echo "Feil: Overføring mislyktes (Exit code: $RESULT)."
  exit $RESULT
fi