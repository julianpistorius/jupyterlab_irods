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
export
    function irodRequest<T>(url: string): Promise<T> {
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




export class IrodsDrive implements Contents.IDrive {
    name: string;
    serverSettings: ServerConnection.ISettings;
    //private _serverSettings: ServerConnection.ISettings;
    //private _fileTypeForPath: (path: string) => DocumentRegistry.IFileType;
    readonly rateLimitedState: ObservableValue;


    constructor(registry: DocumentRegistry) {
        //this._serverSettings = ServerConnection.makeSettings();
        //this._fileTypeForPath = (path: string) => {
        //     const types = registry.getFileTypesForPath(path);
        //     return types.length === 0 ?
        //         registry.getFileType('text')! :
        //         types[0];
        // };
        this.rateLimitedState = new ObservableValue(false);

    }

    get(localPath: string, options?: Contents.IFetchOptions): Promise<Contents.IModel> {


        irodRequest<Contents.IModel>(localPath).then(contents => {
            console.log("Trying to do Irods stuff")
            return contents
        });

        return null;
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
    isDisposed: boolean;
    dispose(): void {
        throw new Error("Method not implemented.");
    }

    get fileChanged(): ISignal<this, Contents.IChangedArgs> {
        return this._fileChanged;
    }

    private _fileChanged = new Signal<this, Contents.IChangedArgs>(this);

}

