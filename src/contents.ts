import {
    Signal, ISignal
} from '@phosphor/signaling';

import {
    Contents, ServerConnection,
} from '@jupyterlab/services';

import {
    URLExt
} from '@jupyterlab/coreutils';

import {
    DocumentRegistry
} from '@jupyterlab/docregistry';

import {
    ObservableValue
} from '@jupyterlab/observables';

/**
* Make a request to the notebook server proxy for the
* Irods API.
*
* @param url - the api path for the Irods 
*   (not including the base url)
*
* @param settings - the settings for the current notebook server.
*
* @returns a Promise resolved with the JSON response.
*/










export class IrodsDrive implements Contents.IDrive {
    private _serverSettings: ServerConnection.ISettings;
    //private _fileTypeForPath: (path: string) => DocumentRegistry.IFileType;

    private _validUser = true;
    private _isDisposed = false;
    // private _serverSettings: ServerConnection.ISettings;
    // private _fileTypeForPath: (path: string) => DocumentRegistry.IFileType;






    constructor(registry: DocumentRegistry) {
        this._serverSettings = ServerConnection.makeSettings();
        this._fileTypeForPath = (path: string) => {
            const types = registry.getFileTypesForPath(path);
            return types.length === 0 ?
                registry.getFileType('text')! :
                types[0];
        };
        this.rateLimitedState = new ObservableValue(false);

    }



    /**
     * The name of the drive.
     */
    get name(): 'Irods' {
        return 'Irods';
    }

    /**
   * State for whether the user is valid.
   */
    get validUser(): boolean {
        return this._validUser;
    }

    /**
     * Settings for the notebook server.
     */
    readonly serverSettings: ServerConnection.ISettings;

    /**
     * State for whether the drive is being rate limited by GitHub.
     */
    readonly rateLimitedState: ObservableValue;

    /**
     * A signal emitted when a file operation takes place.
     */
    get fileChanged(): ISignal<this, Contents.IChangedArgs> {
        return this._fileChanged;
    }

    /**
     * Test whether the manager has been disposed.
     */
    get isDisposed(): boolean {
        return this._isDisposed;
    }

    /**h
     * Dispose of the resources held by the manager.
     */
    dispose(): void {
        if (this.isDisposed) {
            return;
        }
        this._isDisposed = true;
        Signal.clearData(this);
    }

    /**
     * Get the base url of the manager.
     */
    get baseURL(): string {
        return 'https://api.github.com';
    }

    get(localPath: string, options?: Contents.IFetchOptions): Promise<Contents.IModel> {
        

        return this.IrodsRequest<Contents.IModel>(localPath).then(contents => {
            console.log("Trying to do Irods stuff")
            return contentsToJupyterContents(localPath,contents, this._fileTypeForPath);
        });

    }
    getDownloadUrl(localPath: string): Promise<string> {
        return Promise.reject('Irods is CURRENTLY read only');
    }
    newUntitled(options?: Contents.ICreateOptions): Promise<Contents.IModel> {
        return Promise.reject('Irods is CURRENTLY read only');
    }
    delete(localPath: string): Promise<void> {
        return Promise.reject('Irods is CURRENTLY read only');
    }
    rename(oldLocalPath: string, newLocalPath: string): Promise<Contents.IModel> {
        return Promise.reject('Irods is CURRENTLY read only');
    }
    save(localPath: string, options?: Partial<Contents.IModel>): Promise<Contents.IModel> {
        return Promise.reject('Irods is CURRENTLY read only');
    }
    copy(localPath: string, toLocalDir: string): Promise<Contents.IModel> {
        return Promise.reject('Irods is CURRENTLY read only');
    }
    createCheckpoint(localPath: string): Promise<Contents.ICheckpointModel> {
        return Promise.reject('Irods is CURRENTLY read only');
    }
    listCheckpoints(localPath: string): Promise<Contents.ICheckpointModel[]> {
        return Promise.resolve([]);
    }
    restoreCheckpoint(localPath: string, checkpointID: string): Promise<void> {
        return Promise.reject('Irods is CURRENTLY read only');
    }
    deleteCheckpoint(localPath: string, checkpointID: string): Promise<void> {
        return Promise.reject('Irods is CURRENTLY read only');
    }

    private IrodsRequest<T>(url: string): Promise<T> {
        const fullURL = URLExt.join(this._serverSettings.baseUrl, 'irods', url);
        return ServerConnection.makeRequest(fullURL, {}, this._serverSettings).then(response => {
            if (response.status !== 200) {
                return response.json().then(data => {
                    throw new ServerConnection.ResponseError(response, data.message);
                });
            }
            return response.json();
        });
    }



    private _fileChanged = new Signal<this, Contents.IChangedArgs>(this);
    private _fileTypeForPath: (path: string) => DocumentRegistry.IFileType;


}

export
function contentsToJupyterContents(path: string, contents: any , fileTypeForPath: (path: string) => DocumentRegistry.IFileType): Contents.IModel {
    if (contents.content == "directory"){
        return contents;
    }
}


