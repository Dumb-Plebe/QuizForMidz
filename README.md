# Simple React and PHP Site

The React content of this site (at least the first few sections) was develped from the [React.dev Quick Start](https://react.dev/learn) site.

## Installing node.js

Node.js is a javascript runtime that runs on your computer (rather than in your browser). You need it to transpile the `.jsx` React code into a `bundle.js` file that is served to the browser.

### Step 1: Install `n`

Node.js releases new versions all the time. You'll start a project and by the time you're finished, there will be two new versions of node.js released. Managing your node.js (and `npm`) versions is an important aspect of programming in javascript.

`n` is a "version manager" for node. You will install `n` first, then use it to install node.js.

First, download the `n` executable to a folder in your path. Make it executable (`chmod`).

```sh
curl -fsSL -o ~/.local/bin/n https://raw.githubusercontent.com/tj/n/master/bin/n
chmod 0755 /usr/local/bin/n
```

### Step 2: Install Node.js

By default, `n` will try to install `node` and `npm` to `/local/bin`, which we don't have access to on the ssh server. So set `n`'s install directory to one of your local directories. I would recommend adding this to your `.bashrc` file.

```sh
export N_PREFIX="$HOME/.local"
export PATH="$N_PREFIX/bin:$PATH"
```

Once you do that, install the latest "stable" version of node (which we call "long term support", or "LTS").

```sh
n install lts
```

You can find more information about `n` from its website: https://github.com/tj/n


## Installing dependencies

Once you have node.js installed and this repository cloned, you'll need to install all of the prerequisites. This is like `pip install` in python. Every node.js project has a `package.json` file that keeps track of the required dependencies. You can install them easily with the command

```sh
npm install 
```

If `npm` complains about self-signed certificates (beacuse of ITSD's firewall), set `NODE_TLS_REJECT_UNAUTHORIZED=0` before any `npm install` commands. This isn't super secure, but should be ok for learning the ropes quickly. You can set an environment variable for the rest of your shell session with the `export` keyword:

```bash
npm config set strict-ssl false
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Building

Be sure to look at `src/config.js` and set up your enviroment correctly. Right now it expects to be run in my `public_html/` directory.

`package.json` includes two scripts: `build` and `start`. Run the `build` script to transpile the source code in the `src/` directory into `bundle.js`.

## Running

Good news - if you did this on USNA's midshipman server, in your `public_html` directory, it's already running. Access it using the `midn.cs.usna.edu/` forumlation. Replace your alpha and your folder within your `public_html`. This should match what you have in `src/config.js`.

```
https://midn.cs.usna.edu/~m091890/php_react/
```

## Tips

### Fixing midn.cs.usna permissions

If you're having trouble accessing an index.php or index.html file on midn.cs.usna.edu, you might need to update the permissions on your public_html directory. You can do this by running the following command (note the capitalized RWX):

```sh
nfs4_setfacl -R -a A::www-mids@academy.usna.edu:RWX ~/public_html
```

If you are using an sqlite database, update the permissions so the webserver can read/write to it:

```sh
nfs4_setfacl -R -a A::www-mids@academy.usna.edu:RWX ~/public_html/xxxx/xxxx/something.sqlitefile
```

To add a user to a directory so that they can rwx, such as in group projects or for the web server do something like:

```sh
nfs4_setfacl -a A:fdi:USERNAME@academy.usna.edu:RWX directoryname
```

You can also do this recursively with the -R flag.

```sh
nfs4_setfacl -R -a A:fdi:USERNAME@academy.usna.edu:RWX directoryname
```

If you want the web server to be able to read/write/execute faculty files do something like:

```sh
nfs4_setfacl -R -a A:fdi:www-data@academy.usna.edu:RWX directoryname
```

If you want the web server to be able to read/write/execute midn files do something like:

```sh
nfs4_setfacl -R -a A:fdi:www-mids@academy.usna.edu:RWX directoryname
```