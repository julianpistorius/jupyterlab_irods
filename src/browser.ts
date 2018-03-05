


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
        this.addClass('jp-IrodBrowser');
        this.layout = new PanelLayout();
        (this.layout as PanelLayout).addWidget(browser);
        this._drive = drive;
        this._browser = browser;



        this._drive.rateLimitedState.changed.connect(this._updateErrorPanel, this);



    }

    private _updateErrorPanel(): void {

        const rateLimited = this._drive.rateLimitedState.get();
        //const validUser = this._drive.validUser;

        // If we currently have an error panel, remove it.
        if (this._errorPanel) {
            const listing = (this._browser.layout as PanelLayout).widgets[2];
            listing.node.removeChild(this._errorPanel.node);
            this._errorPanel.dispose();
            this._errorPanel = null;
        }

        // If we are being rate limited, make an error panel.
        if (rateLimited) {
            this._errorPanel = new GitHubErrorPanel(
                'You have been rate limited by GitHub! ' +
                'You will need to wait about an hour before ' +
                'continuing');
            const listing = (this._browser.layout as PanelLayout).widgets[2];
            listing.node.appendChild(this._errorPanel.node);
            return;
        }
    }

    private _drive: IrodsDrive;
    private _browser: FileBrowser;
    private _errorPanel: GitHubErrorPanel | null;


}

/**
 * A widget hosting an error panel for the browser,
 * used if there is an invalid user name or if we
 * are being rate-limited.
 */
export
class GitHubErrorPanel extends Widget {
  constructor(message: string) {
    super();
    this.addClass('jp-GitHubErrorPanel');
    const image = document.createElement('div');
    const text = document.createElement('div');
    image.className = 'jp-GitHubErrorImage';
    text.className = 'jp-GitHubErrorText';
    text.textContent = message;
    this.node.appendChild(image);
    this.node.appendChild(text);
  }
}