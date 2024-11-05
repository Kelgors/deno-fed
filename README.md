# fed

fed (for-each directory) is a small utility to iterate over directories to execute one command in each of them. There are some flags to
filter in/out git repositories, repositories with diff, unpushed commits, directories containing file, ...

The default command is a simple echo but you can chain multiple commands to commit and push, or checkout, pull and
install dependencies...

This is a convenient way to make batch operation over multiple repositories or directories.

## Install

### Binary

```sh
curl -L "https://github.com/Kelgors/deno-fed/releases/download/v1.0.0/fed" -o "$HOME/.local/bin/fed"
```

### Build from sources

```sh
FED_DIR=/tmp/fed
BIN_DIR=$HOME/.local/bin
git clone --depth 1 https://github.com/Kelgors/deno-fed.git $FED_DIR
cd $FED_DIR
deno task compile
mv dist/fed $BIN_DIR/fed
```

### Use from sources

```sh
FED_DIR=$HOME/.local/share/fed
BIN_DIR=$HOME/.local/bin
git clone --depth 1 https://github.com/Kelgors/deno-fed.git $FED_DIR
echo "deno run --quiet  --allow-env=SHELL --allow-read --allow-run $FED_DIR/main.ts" | tee $BIN_DIR/fed
chmod +x $BIN_DIR/fed
```
