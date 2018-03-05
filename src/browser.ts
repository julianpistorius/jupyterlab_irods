


  import {
    PanelLayout, Widget
  } from '@phosphor/widgets';
  


  import {
    FileBrowser
  } from '@jupyterlab/filebrowser';
import { IrodsDrive } from './contents';



export
class IrodBrowser extends Widget {
 
    constructor(browser: FileBrowser, drive: IrodsDrive) {
        super();
        this.addClass('jp-GitHubBrowser');
        this.layout = new PanelLayout();
        (this.layout as PanelLayout).addWidget(browser);
    }
}