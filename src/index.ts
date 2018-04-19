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


  // Add the right click menu modifier

  var observer = new MutationObserver(function (mutations) {
    // For the sake of...observation...let's output the mutation to console to see how this all works

    for (let bo of mutations) {

      if (bo.type != "childList") {
        continue;
      }

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

      let _newOption = document.createElement('li');
      _newOption.classList.add("p-Menu-item");
      _newOption.setAttribute("data-type", "command");
      _newOption.innerHTML = '<div class="p-Menu-itemIcon jp-MaterialIcon jp-CopyIcon"></div><div class="p-Menu-itemLabel">Copy Path</div><div class="p-Menu-itemShortcut"></div><div class="p-Menu-itemSubmenuIcon"></div>';
      _newOption.onmouseover = () => {
        _newOption.classList.add("p-mod-active");
      }
      _newOption.onmouseleave = () => {
        _newOption.classList.remove("p-mod-active");
      }

      _newOption.onclick = () => {

        let irodsBrowser = document.getElementById("irods-file-browser");
        if (irodsBrowser == null) return;
        //  First we need to get the current name of the item we clicked.
        let allSelected = irodsBrowser.getElementsByClassName("jp-DirListing-item jp-mod-selected");
        if (allSelected.length == 0) return;
        let selected = <HTMLElement> allSelected.item(0);
        let subSelected = selected.getElementsByClassName("jp-DirListing-itemText");
        if (subSelected.length == 0) return;
        let itemName = subSelected.item(0).innerHTML;

        //  Next we need to get the current path.

        let crumbs = irodsBrowser.getElementsByClassName("jp-BreadCrumbs-item");
        if (crumbs.length == 0) return;
        let lastCrumb = crumbs.item(crumbs.length-1);

        //  now we copy to the clipboard
        var dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.value="/" + lastCrumb.getAttribute("title") + "/" + itemName;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);


        //  close menu
        let menus = document.getElementsByClassName("p-Widget p-Menu");
        if (menus.length == 0) return;
        let menu = <HTMLElement> menus.item(0);
        menu.style.display = "none";


      }
      foundElement.appendChild(_newOption);

      //  close menu
    }
  });



  // Notify me of everything!
  var observerConfig = {
    attributes: true,
    childList: true,
    characterData: true
  };

  // Node, config
  // In this case we'll listen to all changes to body and child nodes
  var targetNode = document.body;
  observer.observe(targetNode, observerConfig);

  return;

}
export default fileBrowserPlugin;
