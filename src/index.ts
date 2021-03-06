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

import { CopyPath } from './modules/copyPath'

/**
 * Initialization data for the jupyterlab_irods extension.
 */
const fileBrowserPlugin: JupyterLabPlugin<void> = {
  id: 'jupyterlab_irods',
  requires: [IDocumentManager, IFileBrowserFactory, ILayoutRestorer],
  autoStart: true,
  activate: activateFileBrowser
};

function activateFileBrowser(app: JupyterLab,
  manager: IDocumentManager,
  factory: IFileBrowserFactory,
  restorer: ILayoutRestorer): void {
  const { commands } = app;

  console.log("Irods Activated  1");

  const drive = new IrodsDrive(app.docRegistry);
  manager.services.contents.addDrive(drive);


  const browser = factory.createFileBrowser("irod-fb", {
    commands,
    driveName: drive.name
  });

  const irodsBrowser = new IrodBrowser(browser, drive);


  irodsBrowser.title.iconClass = 'irods-logo';

  irodsBrowser.id = 'irods-file-browser';

  // Add the file browser widget to the application restorer.
  restorer.add(irodsBrowser, "irod-fb");
  app.shell.addToLeftArea(irodsBrowser, { rank: 102 });



  Promise.all([app.restored])
    .then(([settings]) => {
      browser.model.restored.then(() => {
        irodsBrowser.cdHome();
      });
    }).catch((reason: Error) => {
      console.error(reason.message);
    });



  // Add the right click menu modifier

  var observer = new MutationObserver(function (mutations) {

    if (!irodsBrowser.createMenu){
      
      return;
    }

    for (let bo of mutations) {

      if (bo.addedNodes.length == 0) {
        continue;
      }

      var foundElement: HTMLElement;

      for (let i = 0; i < bo.addedNodes.length; i++) {
        let no = <HTMLElement>bo.addedNodes.item(i);

        if (no.className != "p-Widget p-Menu") {
          continue;
        }
        if (no.childElementCount != 1) {
          continue;
        }
        foundElement = <HTMLElement>no.childNodes.item(0);
      }

      if (foundElement == undefined) {
        continue;
      }

      let el: HTMLElement = new CopyPath().copyPath;
      foundElement.appendChild(el);
      irodsBrowser.createMenu = false;
    }
  });

  observer.observe(document.body, { childList: true });

  return;

}
export default fileBrowserPlugin;
