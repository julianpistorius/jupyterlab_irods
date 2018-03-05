import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';

import {
  ILayoutRestorer
} from '@jupyterlab/application';

import {
  IDocumentManager
} from '@jupyterlab/docmanager';


import {
  IFileBrowserFactory
} from '@jupyterlab/filebrowser';

import {
  IrodsDrive
} from './contents';

import {
  IrodBrowser
} from './browser';


/**
 * Initialization data for the jupyterlab_irods extension.
 */
const fileBrowserPlugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab_irods',
  requires: [IDocumentManager, IFileBrowserFactory, ILayoutRestorer],
  autoStart: true,
  activate: activateFileBrowser
};

function activateFileBrowser(app: JupyterLab, manager: IDocumentManager, factory: IFileBrowserFactory, restorer: ILayoutRestorer): void {
  const { commands } = app;

  console.log("ACtivated@@.001");

  // Add the Google Drive backend to the contents manager.
  const drive = new IrodsDrive(app.docRegistry);
  manager.services.contents.addDrive(drive);

  const browser = factory.createFileBrowser("irod-fb", {
    commands,
    driveName: drive.name
  });

  const irodsBrowser = new IrodBrowser(browser, drive);

  irodsBrowser.title.iconClass = 'jp-GithHub-tablogo';
  irodsBrowser.title.label = "Irods";

  irodsBrowser.id = 'irods-file-browser';
  // manager.services.contents

  // Add the file browser widget to the application restorer.
  restorer.add(irodsBrowser, "irod-fb");
  app.shell.addToLeftArea(irodsBrowser, { rank: 102 });

  return;

}
export default fileBrowserPlugin;
