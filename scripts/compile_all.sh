TARGETS=(
  x86_64-unknown-linux-gnu
  aarch64-unknown-linux-gnu
  x86_64-apple-darwin
  aarch64-apple-darwin
)

rm -rf dist

version=$(jq -r .version deno.json)
echo "export const VERSION = '${version}';" > src/version.ts

for target in ${TARGETS[@]}; do
  deno compile \
    --allow-env=SHELL \
    --allow-read \
    --allow-run \
    --target "${target}" \
    --output "dist/fed-v${version}-${target}" \
    main.ts
done

echo "export const VERSION = 'dev';" > src/version.ts
