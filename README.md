# jupyterlab_irods

IROD connection filemanager for jupyterlab. Contains both a backend server using python-irods and a frontend for managing content.

Currently supports the following features:

* Add new text file or jupyter notebook file (only python3)
* delete any file
* rename any file or folder
* open any file or jupyter notebook file
* navigate through IRODS collection
* save files
* add new folder
* Copy
* Paste
* Cut
* Move
* Download
* Copy remote path


TODO:


* Delete folder
* Refactor python code a bit
* example script with sessions
* ?multiple irods connections


## Prerequisites

* JupyterLab

## Installation

```bash
pip install jupyterlab_irods
jupyter serverextension enable --py jupyterlab_irods
jupyter labextension install @towicode/jupyterlab_irods
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

