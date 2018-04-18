
import {
    ToolbarButton
} from '@jupyterlab/apputils';

import {
    PanelLayout, Widget
} from '@phosphor/widgets';

import {
    ObservableValue
} from '@jupyterlab/observables';

import {
     ServerConnection,
} from '@jupyterlab/services';

import {
    URLExt
} from '@jupyterlab/coreutils';

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


        this._openGitHubButton = new ToolbarButton({
            onClick: () => {

            },
            className: 'jp-spin',
            tooltip: 'When this is spinning. IRODS is being queried',

        });

        let progressBars = document.createElement('div');
        progressBars.innerHTML = '<div class="spinner"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div>'

        this._openGitHubButton.node.appendChild(progressBars);

        this._browser.toolbar.addItem('GitHub', this._openGitHubButton);

        this._drive.rateLimitedState.changed.connect(this._updateErrorPanel, this);

        this._browser.toolbar.addClass("display_block");

        let myStorage = window.localStorage


        // Create an editable name for the user/org name.
        this.host = new GitHubEditableName('', localStorage.getItem("irhost") === null ? '<edit host>': localStorage.getItem("irhost"));
        this.host.addClass('jp-editable');
        this.host.node.title = 'Click to edit host';
        this._browser.toolbar.addItem('host', this.host);
        this.host.name.changed.connect(() => {
            myStorage.setItem("irhost", String(this.host.name.get()));
        }, this);

        this.port = new GitHubEditableName('', localStorage.getItem("irport") === null ? '<edit port>': localStorage.getItem("irport"));
        this.port.addClass('jp-editable');
        this.port.node.title = 'Click to edit port';
        this._browser.toolbar.addItem('port', this.port);
        this.port.name.changed.connect(() => {
            myStorage.setItem("irport", String(this.port.name.get()));
        }, this);

        this.user = new GitHubEditableName('', localStorage.getItem("iruser") === null ? '<edit user>': localStorage.getItem("iruser"));
        this.user.addClass('jp-editable');
        this.user.node.title = 'Click to edit user';
        this._browser.toolbar.addItem('user', this.user);
        this.user.name.changed.connect(() => {
            myStorage.setItem("iruser", String(this.user.name.get()));
        }, this);

        this.zone = new GitHubEditableName('', localStorage.getItem("irzone") === null ? '<edit zone>': localStorage.getItem("irzone"));
        this.zone.addClass('jp-editable');
        this.zone.node.title = 'Click to edit zone';
        this._browser.toolbar.addItem('zone', this.zone);
        this.zone.name.changed.connect(() => {
            myStorage.setItem("irzone", String(this.zone.name.get()));
        }, this);

        this.password = new GitHubEditableName('', localStorage.getItem("irpassword") === null ? '<edit password>': localStorage.getItem("irpassword"));
        this.password.addClass('jp-editable');
        this.password.node.title = 'Click to edit password';
        this._browser.toolbar.addItem('password', this.password);
        this._browser.toolbar.addClass("display_block");
        //this.password.name.changed.connect(() => {
         //   myStorage.setItem("irpassword", String(this.password.name.get()));
        //}, this);
        this.password._editNode.type = "password";
        this.password._nameNode.style.filter = "Blur(4px)";

        let submit = document.createElement('button');
        submit.innerHTML = "Submit";
        submit.onclick = () => {
            let server_con = ServerConnection.makeSettings();
            let setupUrl = URLExt.join(server_con.baseUrl, 'irsetup', "a");
            console.log("Submit data");

            let my_promise = ServerConnection.makeRequest(setupUrl, {
                method: "POST",
                body: JSON.stringify({
                    host: String(this.host._nameNode.textContent),
                    zone: String(this.zone._nameNode.textContent),
                    port: String(this.port._nameNode.textContent),
                    password: String(this.password._nameNode.textContent),
                    user: String(this.user._nameNode.textContent),
                })
            }, server_con).then(response => {
                if (response.status !== 200) {
                    return response.json().then(data => {
                        throw new ServerConnection.ResponseError(response, data.message);
                    });
                }
    
                var spinners = document.getElementsByClassName("spinner") as HTMLCollectionOf<HTMLElement>;
                if (spinners.length > 0) {
                    var spinner = spinners[0];
                    spinner.style.display = "none";
                }
                return response.json();
            });
            return my_promise;
    
        }
        this._browser.toolbar.node.appendChild(submit);
    }
    readonly host: GitHubEditableName;
    readonly port: GitHubEditableName;
    readonly user: GitHubEditableName;
    readonly zone: GitHubEditableName;
    readonly password: GitHubEditableName;
    private _openGitHubButton: ToolbarButton;


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
 * A widget that hosts an editable field,
 * used to host the currently active GitHub
 * user name.
 */
export
    class GitHubEditableName extends Widget {
    constructor(initialName: string = '', placeholder?: string) {
        super();
        this.addClass('jp-GitHubEditableName');
        this._nameNode = document.createElement('div');
        this._nameNode.className = 'jp-GitHubEditableName-display';
        this._editNode = document.createElement('input');
        this._editNode.className = 'jp-GitHubEditableName-input';

        this._placeholder = placeholder || '<Edit Name>';

        this.node.appendChild(this._nameNode);
        this.name = new ObservableValue(initialName);
        this._nameNode.textContent = initialName || this._placeholder;

        this.node.onclick = () => {
            if (this._pending) {
                return;
            }
            this._pending = true;
            Private.changeField(this._nameNode, this._editNode).then(value => {
                this._pending = false;
                if (this.name.get() !== value) {
                    this.name.set(value);
                }
            });
        };

        this.name.changed.connect((s, args) => {
            if (args.oldValue !== args.newValue) {
                this._nameNode.textContent =
                    args.newValue as string || this._placeholder;
            }
        });
    }

    /**
     * The current name of the field.
     */
    readonly name: ObservableValue;


    private _pending = false;
    private _placeholder: string;
    public _nameNode: HTMLElement;
    public _editNode: HTMLInputElement;
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


/**
 * A module-Private namespace.
 */
namespace Private {
    export
        /**
         * Given a text node and an input element, replace the text
         * node wiht the input element, allowing the user to reset the
         * value of the text node.
         *
         * @param text - The node to make editable.
         *
         * @param edit - The input element to replace it with.
         *
         * @returns a Promise that resolves when the editing is complete,
         *   or has been canceled.
         */
        function changeField(text: HTMLElement, edit: HTMLInputElement): Promise<string> {
        // Replace the text node with an the input element.
        let parent = text.parentElement as HTMLElement;
        let initialValue = text.textContent || '';
        edit.value = initialValue;
        parent.replaceChild(edit, text);
        edit.focus();

        // Highlight the input element
        let index = edit.value.lastIndexOf('.');
        if (index === -1) {
            edit.setSelectionRange(0, edit.value.length);
        } else {
            edit.setSelectionRange(0, index);
        }

        return new Promise<string>((resolve, reject) => {
            edit.onblur = () => {
                // Set the text content of the original node, then
                // replace the node.
                parent.replaceChild(text, edit);
                text.textContent = edit.value || initialValue;
                resolve(edit.value);
            };
            edit.onkeydown = (event: KeyboardEvent) => {
                switch (event.keyCode) {
                    case 13:  // Enter
                        event.stopPropagation();
                        event.preventDefault();
                        edit.blur();
                        break;
                    case 27:  // Escape
                        event.stopPropagation();
                        event.preventDefault();
                        edit.value = initialValue;
                        edit.blur();
                        break;
                    default:
                        break;
                }
            };
        });
    }
}