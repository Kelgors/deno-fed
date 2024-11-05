platform=$(uname)
arch=$(uname -m)

case "${platform}" in
  Linux)
    target="${arch}-unknown-linux-gnu"
    ;;
  Darwin)
    target="${arch}-apple-darwin"
    ;;
  *)
    >&2 echo "Unknown platform ${platform} ${arch}"
    exit 1
esac

rm -rf dist

version=$(jq -r .version deno.json)
echo "export const VERSION = '${version}';" > src/version.ts

deno compile \
  --allow-env=SHELL \
  --allow-read \
  --allow-run \
  --target "${target}" \
  --output "dist/fed" \
  main.ts

echo "export const VERSION = 'dev';" > src/version.ts
