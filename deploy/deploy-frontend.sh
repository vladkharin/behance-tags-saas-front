#!/usr/bin/env bash
# Install root-owned as /usr/local/bin/deploy-beranked-frontend.
# The dedicated SSH key is restricted to this command in authorized_keys.
set -euo pipefail
if [[ "${SSH_ORIGINAL_COMMAND:-}" != "deploy-beranked-frontend" ]]; then
    echo "This key permits only deploy-beranked-frontend." >&2
    exit 126
fi

export PATH=/usr/local/bin:/usr/bin:/bin
export GIT_TERMINAL_PROMPT=0
umask 022
project=/home/vladkharin/projects/behance-tags-saas-front
cache=/home/vladkharin/.cache/beranked-frontend-deploy
mkdir -p "$cache"
chmod 700 "$cache"
exec 9>"$cache/deploy.lock"
flock -w 300 9
cd "$project"
git diff --quiet
git diff --cached --quiet
git fetch origin main
git merge --ff-only origin/main
npm ci --no-audit --no-fund

# Build away from the live document root, then exchange directories atomically.
build=$(mktemp -d "$cache/build.XXXXXX")
trap 'rm -rf "$build"' EXIT
git archive HEAD | tar -x -C "$build"
ln -s "$project/node_modules" "$build/node_modules"
for file in .env .env.local .env.production .env.production.local; do
    if [[ -f "$project/$file" ]]; then cp "$project/$file" "$build/$file"; fi
done
(cd "$build" && npm run build && npm run check:seo)
if [[ -d "$project/dist/assets" ]]; then
    cp -an "$project/dist/assets/." "$build/dist/assets/"
fi

exchange() {
    python3 - "$project/dist" "$build/dist" <<'PY'
import ctypes, os, sys
libc = ctypes.CDLL(None, use_errno=True)
rename = libc.renameat2
rename.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
rename.restype = ctypes.c_int
if rename(-100, os.fsencode(sys.argv[1]), -100, os.fsencode(sys.argv[2]), 2):
    error = ctypes.get_errno()
    raise OSError(error, os.strerror(error))
PY
}

exchange
if ! curl --fail --silent --show-error --max-time 20 --output "$build/live-tags.html" https://beranked.domcraft.digital/tags || \
   ! grep -Fq 'href="https://beranked.domcraft.digital/tags"' "$build/live-tags.html"; then
    exchange
    echo "Public URL check failed; restored the previous release." >&2
    exit 1
fi
previous="$cache/previous-dist"
rm -rf "$previous"
mv "$build/dist" "$previous"
echo "BeRanked frontend deployed: $(git rev-parse --short HEAD)"
